import React, { useEffect, useState } from "react";
import api from "../api";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTrip, setOpenTrip] = useState(null); // track which trip is open

  useEffect(() => {
    const getTripList = async () => {
      try {
        const res = await api.get("/trip/get-trip-lists");
        const data = res.data;
        if (Array.isArray(data)) {
          setTrips(data);
        } else if (data && typeof data === "object") {
          setTrips([data]);
        } else {
          setTrips([]);
        }
      } catch (error) {
        console.log("Error fetching trips:", error);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    getTripList();
  }, []);

  const toggleTrip = (id) => {
    setOpenTrip(openTrip === id ? null : id); // collapse if open, expand otherwise
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
            {/* Trip Header (Clickable) */}
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

            

            {/* Dropdown Content */}
            {openTrip === trip._id && (
              <div className="p-6 border-t">
                {trip.tripOutline.map((day) => (
                  <div key={day._id} className="mb-6">
                    <h3 className="font-bold text-md text-gray-700 mb-3">
                      Day {day.day}
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Morning */}
                      <div className="flex-1 border rounded-lg shadow-sm bg-gray-50 overflow-hidden">
                        <img
                          src={day.morning.place_image_url}
                          alt={day.morning.place}
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-3">
                          <p className="font-semibold text-gray-900">
                            {day.morning.place}
                          </p>
                          <p className="text-sm text-gray-700">
                            Ticket: ₹{day.morning.ticket_price}
                          </p>
                          <p className="text-sm text-gray-700">
                            Best time: {day.morning.best_time_to_visit}
                          </p>
                        </div>
                      </div>

                      {/* Afternoon */}
                      <div className="flex-1 border rounded-lg shadow-sm bg-gray-50 overflow-hidden">
                        <img
                          src={day.afternoon.place_image_url}
                          alt={day.afternoon.place}
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-3">
                          <p className="font-semibold text-gray-900">
                            {day.afternoon.place}
                          </p>
                          <p className="text-sm text-gray-700">
                            Ticket: ₹{day.afternoon.ticket_price}
                          </p>
                          <p className="text-sm text-gray-700">
                            Best time: {day.afternoon.best_time_to_visit}
                          </p>
                        </div>
                      </div>

                      {/* Evening */}
                      <div className="flex-1 border rounded-lg shadow-sm bg-gray-50 overflow-hidden">
                        <img
                          src={day.evening.place_image_url}
                          alt={day.evening.place}
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-3">
                          <p className="font-semibold text-gray-900">
                            {day.evening.place}
                          </p>
                          <p className="text-sm text-gray-700">
                            Ticket: ₹{day.evening.ticket_price}
                          </p>
                          <p className="text-sm text-gray-700">
                            Best time: {day.evening.best_time_to_visit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TripList;
