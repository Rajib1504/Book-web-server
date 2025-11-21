import { SendError } from "../../utils/SendError.js";
import { Book } from './Books.model.js';
// const sendError = (res, statusCode, message) => {
//   return res.status(statusCode).json({ success: false, message });
// };

// create book
export const createBook = async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json({
      success: true,
      message: "book created successfully",
      data: newBook,
    });
  } catch (error) {
    if (error.code === 10000) {
      return SendError(res, 400, "A book with this title already exists.");
    }
    SendError(res, 500, error.message);
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const { search, category, tags, page = 1, limit = 10 } = req.query;
    const queryObj = {};

    // A. Search Logic (Title )
    if (search) {
      queryObj.title = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // B. Category Filter
    if (category) {
      queryObj.category = category;
    }

    // C. Tags Filter (any tag)
    if (tags) {
      // tags=marketing,business (comma separated string will convert in array)
      const tagsArray = tags.split(",");
      queryObj.tags = { $in: tagsArray };
    }

    // D. Pagination Setup
    const skip = (page - 1) * limit;

    // E. Database Query
    const books = await Book.find(queryObj)
      .sort({ createdAt: -1 }) // new book will be first
      .skip(skip)
      .limit(parseInt(limit));

    const totalBooks = await Book.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: books.length,
      total: totalBooks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBooks / limit),
      data: books,
    });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};

export const getBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return SendError(res, 404, "Book not found");
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};

export const getRelatedBooks = async (req, res) => {
  try {
    const { category, currentBookId } = req.params;

    const relatedBooks = await Book.find({
      category: category,
      _id: { $ne: currentBookId }, // accpt this book another books will be visible
    })
      .limit(4) // max 4 books will be visible
      .select("title cover_image category subtitle"); // only need filed we will take

    res.status(200).json({ success: true, data: relatedBooks });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return SendError(res, 404, "Book not found");

    await book.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};

export const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return SendError(res, 404, "Book not found");
    }

    // Update logic
    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};
