import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import connecttodb from "./db/db.js";

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,              
}));

app.use(express.json());

// db
connecttodb();

// routes
app.use("/user", authRoutes);

export default app;