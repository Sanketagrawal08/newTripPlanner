import { Calendar, WholeWord } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();

  const createHandler = () => {
    navigate("/trip-form");
  };

  const viewTripsHandler = () => {
    navigate("/trip-lists");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col items-center gap-8">
      {/* Welcome */}
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        Welcome! Ready to plan your next adventure?
      </h1>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={createHandler}
          className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition font-medium"
        >
          Create New Trip
        </button>
        <button
          onClick={viewTripsHandler}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-medium"
        >
          My Trips
        </button>

        
      </div>

      {/* Optional placeholder for quick stats or info */}
      <div className="mt-6 text-gray-600 text-center">
        Plan trips, explore destinations, and track your adventures—all in one place.
      </div>
    </div>
  );
};

export default Home;
