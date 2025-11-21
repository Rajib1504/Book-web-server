import { Router } from "express";
import {
  createBook,
  getAllBooks,
  getBookDetails,
  getRelatedBooks,
  deleteBook,
  updateBook,
} from "./Books.controller.js";
import {
  protect,
  admin,
  requirePro,
} from "../../middlewares/auth.middleware.js";

export const BookRouter = Router();

//  all books and filters
BookRouter.get("/", protect, requirePro, getAllBooks);

//  detaisl
BookRouter.get("/:id", protect, requirePro, getBookDetails);

//related
BookRouter.get(
  "/related/:category/:currentBookId",
  protect,
  requirePro,
  getRelatedBooks
);

BookRouter.post("/", protect, admin, createBook);

BookRouter.delete("/:id", protect, admin, deleteBook);
BookRouter.put("/:id", protect, admin, updateBook);
