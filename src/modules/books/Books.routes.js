import { Router } from "express";
import { admin, protect } from "./../../middlewares/auth.middleware";
import { CreateBook } from "./Books.controller";

export const BookRouter = Router();

BookRouter.post("/createBook", protect, admin, CreateBook);

