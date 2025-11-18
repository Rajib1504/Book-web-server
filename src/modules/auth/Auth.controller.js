import { User } from "../user/User.model.js";
import jwt from "jsonwebtoken";

// Utility function to handle errors
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

// --- Token Generate korar function ---
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token 30 din valid thakbe
  });
};

// --- 1. Register User ---
// POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check korchi user agei register koreche kina
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, "User already exists with this email");
    }

    // Notun user create korchi
    // Password-ta User.model.js-e automatically hash hoye jabe
    const user = await User.create({
      name,
      email,
      password,
      // Ekhane plan logic add kora jete pare, ekhon default 'free' thakbe
    });

    if (user) {
      // Register korar sathe sathe login koranor jonno token generate korchi
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return sendError(res, 400, "Invalid user data");
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// --- 2. Login User ---
// POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // User-ke email diye khujchi
    // .select('+password') dilam karon schema-te 'select: 0' kora chilo
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    // User.model.js-e banano 'isPasswordCorrect' method-ta use korchi
    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password");
    }

    // Sob thik thakle token generate korchi
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};