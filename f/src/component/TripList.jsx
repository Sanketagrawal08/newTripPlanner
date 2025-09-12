import React, { useEffect, useState } from "react";
import api from "../api";
import { CalendarDays, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import useAuthStore from "../store/authStore";

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTrip, setOpenTrip] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const user = useAuthStore(); // Auth user

  useEffect(() => {
    getTripList();
  }, []);

  const getTripList = async () => {
    try {
      const res = await api.get("/trip/get-trip-lists");
      setTrips(res.data || []);
    } catch (error) {
      console.log("Error fetching trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrip = (id) => setOpenTrip(openTrip === id ? null : id);

  const sendInvite = async (tripId) => {
    if (!inviteEmail) return alert("Enter a valid email!");
    try {
      await api.post(`/trip/${tripId}/invite`, { email: inviteEmail });
      alert("Invite sent!");
      setInviteEmail("");
      setSelectedTrip(null);
      getTripList();
    } catch (error) {
      alert(error.response?.data?.message || "Error sending invite");
    }
  };

  const respondInvite = async (tripId, action) => {
    try {
      if (action === "accept") {
        await api.post(`/trip/${tripId}/accept`);
      } else {
        await api.post(`/trip/${tripId}/reject`);
      }
      alert(`Invite ${action}`);
      getTripList();
    } catch (error) {
      alert(error.response?.data?.message || "Error responding to invite");
    }
  };

  const startTrip = async (tripId) => {
    try {
      console.log("Trip started!");

      

      getTripList(); // Refresh trips to reflect status
    } catch (error) {
      alert(error.response?.data?.message || "Error starting trip");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <CalendarDays className="w-6 h-6 text-blue-600" />
        My Trips
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading trips...</p>
      ) : trips.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl shadow">
          <p className="text-gray-600 text-lg">No trips found</p>
        </div>
      ) : (
        trips.map((trip) => (
          <div
            key={trip._id}
            className="border rounded-xl shadow-md mb-6 bg-white"
          >
            <button
              onClick={() => toggleTrip(trip._id)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-800 hover:bg-gray-50 rounded-t-xl"
            >
              Trip created on{" "}
              <span className="text-blue-600">
                {new Date(trip.createdAt).toLocaleDateString()}
              </span>
              {openTrip === trip._id ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {openTrip === trip._id && (
              <div className="p-6 border-t space-y-6">
                {/* Participants */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Participants:
                  </h3>
                  {trip.participants?.length > 0 ? (
                    <ul className="list-disc ml-6 text-gray-800">
                      {trip.participants.map((p) => (
                        <li key={p._id}>
                          {p.name} ({p.email})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No participants yet</p>
                  )}
                </div>

                {/* Pending Invites */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Pending Invites:
                  </h3>
                  {trip.invites?.length > 0 ? (
                    <ul className="list-disc ml-6 text-gray-800">
                      {trip.invites.map((i) => (
                        <li key={i._id}>
                          {i.name} ({i.email})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No pending invites</p>
                  )}
                </div>

                {/* Invite Friend */}
                <div className="mt-4">
                  {selectedTrip === trip._id ? (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Friend's email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="border rounded px-3 py-1 flex-1"
                      />
                      <button
                        onClick={() => sendInvite(trip._id)}
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => setSelectedTrip(null)}
                        className="bg-gray-300 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTrip(trip._id)}
                      className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-100"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite Friend
                    </button>
                  )}
                </div>

                {/* Accept / Reject buttons */}
                {trip.userRole === "invited" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => respondInvite(trip._id, "accept")}
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondInvite(trip._id, "reject")}
                      className="bg-red-600 text-white px-4 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Start Trip button - only for owner */}
                {trip.userRole === "owner" && (
                  <div className="mt-4">
                    <button
                      onClick={() => startTrip(trip._id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      Start Trip
                    </button>
                  </div>
                )}

                {/* Trip Outline */}
                <div className="mt-6">
                  {trip.tripOutline.map((day) => (
                    <div key={day._id} className="mb-6">
                      <h3 className="font-bold text-md text-gray-700 mb-3">
                        Day {day.day}
                      </h3>
                      <div className="flex flex-col md:flex-row gap-4">
                        {["morning", "afternoon", "evening"].map((time) => (
                          <div
                            key={time}
                            className="flex-1 border rounded-lg shadow-sm bg-gray-50 overflow-hidden"
                          >
                            <img
                              src={day[time].place_image_url}
                              alt={day[time].place}
                              className="w-full h-36 object-cover"
                            />
                            <div className="p-3">
                              <p className="font-semibold text-gray-900">
                                {day[time].place}
                              </p>
                              <p className="text-sm text-gray-700">
                                Ticket: ₹{day[time].ticket_price}
                              </p>
                              <p className="text-sm text-gray-700">
                                Best time: {day[time].best_time_to_visit}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TripList;
