import { Router } from "express";
import * as authController from "./Auth.controller.js";

export const Authrouter = Router();

// POST /api/auth/register
Authrouter.post("/register", authController.registerUser);

// POST /api/auth/login
Authrouter.post("/login", authController.loginUser);