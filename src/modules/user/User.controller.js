import { SendError } from "../../utils/SendError.js";
import { User } from "./User.model.js";
import { generateLicensePDF } from "../../utils/pdfGenerator.js";
// Utility for errors
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

// --- 1. Get User Profile (Logged in User) ---
export const getUserProfile = async (req, res) => {
  try {
    // req.user comes from 'protect' middleware
    const user = await User.findById(req.user._id);

    if (user) {
      if (user.status === "suspended") {
        return SendError(
          res,
          403,
          "Your account has been suspended. Contact support."
        );
      }
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan, // Frontend can check if 'pro'
          planStartDate: user.planStartDate,
          license: user.license,
        },
      });
    } else {
      sendError(res, 404, "User not found");
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// --- 2. Update User Plan (After Payment) ---
// Frontend will call this when payment is successful
// export const updateUserPlan = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (user) {
//       user.plan = "pro"; // Set plan to PRO
//       user.planStartDate = new Date(); // Set start date

//       const updatedUser = await user.save();

//       res.status(200).json({
//         success: true,
//         message: "Plan upgraded to PRO successfully!",
//         data: {
//             name: updatedUser.name,
//             email: updatedUser.email,
//             plan: updatedUser.plan
//         }
//       });
//     } else {
//       sendError(res, 404, "User not found");
//     }
//   } catch (error) {
//     sendError(res, 500, error.message);
//   }
// };

// --- 3. Get All Users (Admin Only) ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return SendError(res, 404, "User not found");
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return SendError(res, 404, "User not found");
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};

export const updateUserPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return SendError(res, 404, "User not found");
    }

    user.plan = "pro";
    user.planStartDate = new Date();

    // ২.if no license then will create
    if (!user.license || !user.license.key) {
      //uniqe license ex: (LIC-TIMESTAMP-RANDOM)
      const licenseKey = `LIC-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

      // ৩. PDF জেনারেট করা (Utils ফাংশন কল)
      // বিঃদ্রঃ এটি লোকাল সার্ভারে ফাইল সেভ করবে
      const pdfUrl = await generateLicensePDF(user, licenseKey);

      // ৪. ইউজারের ডাটায় সেভ করা
      user.license = {
        key: licenseKey,
        fileUrl: pdfUrl, // ফ্রন্টএন্ড এই লিঙ্কে হিট করে ডাউনলোড করবে
        issueDate: new Date(),
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Plan upgraded to PRO & License Generated!",
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
        license: updatedUser.license, // লাইসেন্স ডাটা ফ্রন্টএন্ডে পাঠাচ্ছি
      },
    });
  } catch (error) {
    console.error("License Generation Error:", error);
    SendError(res, 500, error.message);
  }
};

// ... আগের ইম্পোর্ট এবং ফাংশনগুলো ...

// --- 4. Toggle Book Save (Save / Unsave) ---
export const toggleBookSave = async (req, res) => {
  try {
    const { bookId } = req.body; // ফ্রন্টএন্ড থেকে বইয়ের ID আসবে
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return SendError(res, 404, "User not found");
    }

    // চেক করি বইটি অলরেডি সেভ করা আছে কিনা
    // (MongoDB তে ObjectId অবজেক্ট হিসেবে থাকে, তাই string এ কনভার্ট করে চেক করতে হয়)
    const isSaved = user.savedBooks.some(id => id.toString() === bookId);

    if (isSaved) {
      // যদি থাকে, রিমুভ করো (Unsave)
      user.savedBooks = user.savedBooks.filter(
        (id) => id.toString() !== bookId
      );
      await user.save();
      res.status(200).json({
        success: true,
        message: "Book removed from saved list",
        isSaved: false,
      });
    } else {
      // না থাকলে, অ্যাড করো (Save)
      user.savedBooks.push(bookId);
      await user.save();
      res.status(200).json({
        success: true,
        message: "Book saved successfully",
        isSaved: true,
      });
    }
  } catch (error) {
    SendError(res, 500, error.message);
  }
};

// --- 5. Get All Saved Books ---
export const getSavedBooks = async (req, res) => {
  try {
    const userId = req.user._id;

    // savedBooks অ্যারেতে শুধু ID আছে, .populate() দিয়ে আমরা পুরো বইয়ের তথ্য আনব
    const user = await User.findById(userId).populate({
      path: "savedBooks",
      select: "title category cover_image subtitle", // শুধু প্রয়োজনীয় তথ্যগুলো আনছি
    });

    if (!user) {
      return SendError(res, 404, "User not found");
    }

    res.status(200).json({
      success: true,
      count: user.savedBooks.length,
      data: user.savedBooks,
    });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};