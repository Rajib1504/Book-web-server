import mongoose, { Schema } from "mongoose";

// Ei choto schema-gulo main schema-r bhitor use hobe
const statsSchema = new Schema(
  {
    pages: { type: Number, default: 0 },
    words: { type: String, trim: true },
    size: { type: String, trim: true },
  },
  { _id: false } // Ete stats-er jonno alada _id toyri hobe na
);

const fileDetailsSchema = new Schema(
  {
    type: { type: String, default: "ZIP", trim: true },
    size: { type: String, trim: true }, // size stats-e o ache, ekhane file-er original size
    date_added: { type: String, default: () => new Date().toISOString().split('T')[0] }, // Auto date add hobe
  },
  { _id: false }
);

// --- Main Book Schema ---
const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      unique: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    icon: {
      // Frontend-e icon dekhate help korbe (mail, book etc.)
      type: String,
      trim: true,
      default: "book",
    },
    cover_image: {
      type: String,
      required: [true, "Cover image URL is required"],
      trim: true,
    },
    short_description: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    long_description: {
      type: String,
      trim: true,
    },
    stats: statsSchema, // Uporer statsSchema ekhane use holo
    file_details: fileDetailsSchema, // Uporer fileDetailsSchema ekhane use holo

    // --- Array Fields ---
    // AddBook.jsx form-e egulo comma-separated chilo.
    // Amra save korar somoy comma theke split kore array te convert korbo.
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    whats_inside: [
      {
        type: String,
        trim: true,
      },
    ],
    usage_rights: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model("Book", bookSchema);