import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  place: { type: String, required: true },
  ticket_price: { type: Number, default: 0 },
  best_time_to_visit: { type: String },
  place_image_url: { type: String },
});

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  morning: { type: activitySchema },
  afternoon: { type: activitySchema },
  evening: { type: activitySchema },
});

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  tripOutline: [daySchema], // array of day
  createdAt: { type: Date, default: Date.now },
});

const TripModel = mongoose.model("Trip", tripSchema);

export default TripModel;
