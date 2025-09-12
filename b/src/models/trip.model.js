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
  title:{type:String},
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  tripOutline: [daySchema],
  createdAt: { type: Date, default: Date.now },
  currentStatus: { type: String, enum: ["PENDING", "STARTED", "ENDED"], default: "PENDING" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  invites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const TripModel = mongoose.model("Trip", tripSchema);

export default TripModel;
