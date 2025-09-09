import cohere from "../services/cohereclient.js";
import { jsonrepair } from "jsonrepair";
import axios from "axios";
import TripModel from "../models/trip.model.js";

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
  const { country, destination, budget, travellers, days } = req.body;

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
    const { tripOutline } = req.body;

    if (!tripOutline) {
      return res.status(400).json({ message: "tripOutline is required" });
    }

    const trip = new TripModel({
      userId,
      tripOutline,
    });

    await trip.save();
    return res.status(201).json({ message: "Trip saved successfully", trip });
  } catch (error) {
    console.error("Error saving trip:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
