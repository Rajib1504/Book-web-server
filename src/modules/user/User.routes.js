import { Router } from "express";
import { 
    getUserProfile, 
    updateUserPlan, 
    getAllUsers, 
    deleteUser,
    updateUserStatus
} from "./User.controller.js";
import { protect, admin } from "../../middlewares/auth.middleware.js";

export const Userrouter = Router();

Userrouter.get("/profile", protect, getUserProfile);


Userrouter.put("/update-plan", protect, updateUserPlan);

Userrouter.get("/", protect, admin, getAllUsers);
Userrouter.delete("/:id", protect, admin, deleteUser); 
Userrouter.patch("/status/:id", protect, admin, updateUserStatus); 