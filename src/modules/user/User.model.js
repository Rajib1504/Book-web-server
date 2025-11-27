import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: 0, // Default-e password query-te asbe na
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePhoto: { type: String },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    // Amra pore ei 'planStartDate' field-ta use korbo apnar 3-month logic-er jonno
    planStartDate: {
      type: Date,
    },
    license: {
      key: { type: String }, //unique key
      fileUrl: { type: String }, //download link
      issueDate: { type: Date },
    },
    savedBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book", // connection with Book model 
      },
    ],
  },
  {
    timestamps: true,
  }
);

// --- Step 2: Password Hashing Middleware ---
// Notun user create korar age ba password change korle ei function-ta run hobe
userSchema.pre("save", async function (next) {
  // Shudhu password change holei hash korbo
  if (!this.isModified("password")) {
    return next();
  }

  // Password-take hash korchi
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Jokhon user register korche, tokhon jodi plan thake, tar 'planStartDate' set korchi
    if (this.isNew && this.plan !== "free") {
      this.planStartDate = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// --- Step 3: Password Compare Method ---
// Login-er somoy password check korar jonno ei method-ta banalam
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
