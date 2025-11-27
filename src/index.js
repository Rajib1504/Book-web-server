import express from "express";
import cors from "cors";
import path from "path";
import { Userrouter } from "./modules/user/User.routes.js";
import { Authrouter } from "./modules/auth/Auth.routes.js"; // <-- Notun import
import { BookRouter } from "./modules/books/Books.routes.js";
import { StatsRouter } from "./modules/stats/Stats.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", Authrouter);
app.use("/api/users", Userrouter);
app.use("/api/books", BookRouter);
app.use("/api/stats", StatsRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Book API is running successfully",
  });
});

// --- Not Found Route ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: `Cannot find ${req.method} ${req.originalUrl}`,
  });
});

export default app;
