import jwt from "jsonwebtoken";
import { User } from "../modules/user/User.model.js";
import { SendError } from "../utils/SendError.js";


// --- 1. Shudhu Logged-in kina check korar middleware ---
export const protect = async (req, res, next) => {
  let token;

  // Header theke token-ta ber korchi
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Token-take ber korlam ('Bearer' baad diye)
      token = req.headers.authorization.split(" ")[1];

      // Token-ta valid kina check korchi
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token theke user ID diye user-ke database theke khuje ber korchi
      // Password baad diye user data req.user e save korchi
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return SendError(res, 401, "User not found, token failed");
      }

      next(); // Sob thik thakle porer step-e jabe
    } catch (error) {
      console.error(error);
      return SendError(res, 401, "Not authorized, token failed");
    }
  }

  if (!token) {
    return SendError(res, 401, "Not authorized, no token");
  }
};

// --- 2. User 'admin' kina check korar middleware ---
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // User jodi admin hoy, porer step-e jabe
  } else {
    return SendError(res, 403, "Not authorized as an admin");
  }
};
export const requirePro = (req, res, next) => {
  // Allow access if user is 'pro' OR if user is 'admin'
  if (req.user && (req.user.plan === "pro" || req.user.role === "admin")) {
    next();
  } else {
    return SendError(
      res,
      403,
      "Access denied. You need a PRO plan to access the library."
    );
  }
};
