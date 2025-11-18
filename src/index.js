import express from "express";
import cors from "cors";
import { Userrouter } from "./modules/user/User.routes.js";
import { Authrouter } from "./modules/auth/Auth.routes.js"; // <-- Notun import
import { BookRouter } from "./modules/books/Books.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", Authrouter); 
app.use("/api/users", Userrouter);
app.use("/api/books", BookRouter);


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