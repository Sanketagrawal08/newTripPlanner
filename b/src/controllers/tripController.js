import cohere from "../services/cohereclient.js";
import { jsonrepair } from "jsonrepair";
import axios from "axios";
import TripModel from "../models/trip.model.js";
import UserModel from "../models/user.model.js";

const UNSPLASH_KEY = "A37NTQMDIgFMWbq5kq1uEslTH8hWwVnDSi4ZYfKTdJE";
const FALLBACK_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

// Function to fetch Unsplash image for a place
async function fetchPlacePhoto(placeName) {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: { query: placeName, client_id: UNSPLASH_KEY, per_page: 1 },
    });
    return response.data.results?.[0]?.urls?.regular || FALLBACK_IMAGE;
  } catch (err) {
    console.error("🖼️ Unsplash Error:", err.message);
    return FALLBACK_IMAGE;
  }
}

export const generateTripOverviewController = async (req, res) => {
  const { title,country, destination, budget, travellers, days } = req.body;

  const prompt = `
You are a travel assistant. Generate a ${days}-day trip plan for ${destination}, ${country}.
Budget: INR ${budget}.
Travellers: ${travellers}.

Return the result STRICTLY in this JSON format:
{
  "trip_outline": [
    {
      "day": 1,
      "morning": { "place": "Place Name", "ticket_price": 200, "best_time_to_visit": "09:00–12:00" },
      "afternoon": { "place": "Place Name", "ticket_price": 300, "best_time_to_visit": "12:00–16:00" },
      "evening": { "place": "Place Name", "ticket_price": 100, "best_time_to_visit": "16:00–20:00" }
    }
  ]
}

Rules:
- Only valid JSON, no markdown, no extra text.
- Each day must have morning, afternoon, evening keys.
- Include ticket_price (integer) and best_time_to_visit (string).
- trip_outline must have exactly ${days} entries.
`;

  try {
    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 4000,
      temperature: 0.7,
    });

    let rawText = response.generations?.[0]?.text;
    let tripData;

    // Parse JSON safely
    try {
      tripData = JSON.parse(rawText);
    } catch (err) {
      console.warn("⚠️ JSON parse failed, attempting jsonrepair...");
      try {
        tripData = JSON.parse(jsonrepair(rawText));
      } catch (err2) {
        console.error("❌ JSON repair failed:", err2.message);
        return res.status(500).json({ error: "AI JSON response invalid" });
      }
    }

    // Fetch images for all places
    for (const day of tripData.trip_outline || []) {
      for (const time of ["morning", "afternoon", "evening"]) {
        const place = day[time];
        if (place && place.place) {
          place.place_image_url = await fetchPlacePhoto(place.place);
        } else {
          place.place_image_url = FALLBACK_IMAGE;
        }
      }
    }

    res.json({ overview: tripData });
  } catch (err) {
    console.error("❌ Cohere Error:", err);
    res.status(500).json({ error: "Failed to generate trip overview" });
  }
};

export const saveTripController = async (req, res) => {
  try {
    const userId = req.user.id; // got from middleware
    console.log(req.user.id)
    const { title, tripOutline } = req.body;

    if (!tripOutline) {
      return res.status(400).json({ message: "tripOutline is required" });
    }

    const trip = new TripModel({
      title,
     owner: userId,
      tripOutline,
    });

    await trip.save();
    return res.status(201).json({ message: "Trip saved successfully", trip });
  } catch (error) {
    console.error("Error saving trip:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTripListController = async (req, res) => {
  try {
    // support both req.user.id or req.user._id depending on your auth middleware
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find trips where user is owner OR participant OR invited
    const trips = await TripModel.find({
      $or: [
        { owner: userId },
        { participants: userId },
        { invites: userId }
      ]
    })
      .populate("owner", "name email")
      .populate("participants", "name email")
      .populate("invites", "name email");

    // Attach userRole and isUserInvited to each trip
    const tripsWithRole = trips.map((trip) => {
      const obj = trip.toObject();

      let role = "viewer";
      if (trip.owner && trip.owner._id.toString() === userId.toString()) {
        role = "owner";
      } else if (
        Array.isArray(trip.participants) &&
        trip.participants.some((p) => p._id.toString() === userId.toString())
      ) {
        role = "participant";
      } else if (
        Array.isArray(trip.invites) &&
        trip.invites.some((i) => i._id.toString() === userId.toString())
      ) {
        role = "invited";
      }

      obj.userRole = role;
      obj.isUserInvited = role === "invited";
      return obj;
    });

    return res.status(200).json(tripsWithRole);
  } catch (err) {
    console.error("Error in getTripListController:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateEmergencyContactsController = async (req, res) => {
  const { contact } = req.body;

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.emergencyContacts.push(contact);
    await user.save();

    res.json({
      msg: "Emergency contacts updated",
      contacts: user.emergencyContacts,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getEmergencyContactsController = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.status(200).json({
      msg: "contacts",
      contacts: Array.isArray(user.emergencyContacts)
        ? user.emergencyContacts
        : [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error in getemergency", error: error.message });
  }
};

// Invite a friend
export const sendInviteFriends = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    const trip = await TripModel.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Only owner can invite
    if (!trip.owner || trip.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only owner can invite friends" });
    }

    const friend = await UserModel.findOne({ email });
    if (!friend)
      return res
        .status(400)
        .json({ message: "User not registered. Ask them to sign up first." });

    if (
      trip.invites?.some((id) => id.toString() === friend._id.toString()) ||
      trip.participants?.some((id) => id.toString() === friend._id.toString())
    ) {
      return res
        .status(400)
        .json({ message: "Already invited or participant" });
    }

    trip.invites.push(friend._id);
    await trip.save();

    res.json({ message: "Invite sent successfully", trip });
  } catch (err) {
    console.error("Error in invitefriend", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept invite
export const acceptInvite = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await TripModel.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (!trip.invites?.some((id) => id.toString() === userId.toString())) {
      return res.status(400).json({ message: "No pending invite found" });
    }

    trip.invites = trip.invites.filter(
      (id) => id.toString() !== userId.toString()
    );

    if (!trip.participants?.some((id) => id.toString() === userId.toString())) {
      trip.participants.push(userId);
    }

    await trip.save();
    res.json({ message: "Invite accepted", trip });
  } catch (err) {
    console.error("Error accepting invite:", err);
    res.status(500).json({ message: "Server error in acceptinvite" });
  }
};

// Reject invite
export const rejectInvite = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await TripModel.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    trip.invites = trip.invites.filter((id) => id.toString() !== userId.toString());
    await trip.save();

    res.json({ message: "Invite rejected", trip });
  } catch (err) {
    console.error("Error rejecting invite:", err);
    res.status(500).json({ message: "Server error" });
  }
};
