import { Router } from "express";
import { protect, admin } from "../../middlewares/auth.middleware.js";
import { getDashboardStats } from "./Stats.Controller.js";

export const StatsRouter = Router();

// GET /api/stats/dashboard
StatsRouter.get("/dashboard", protect, admin, getDashboardStats);