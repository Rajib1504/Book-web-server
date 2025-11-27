import { User } from "../user/User.model.js";
import { Book } from "../books/Books.model.js";
import { SendError } from "../../utils/SendError.js";

export const getDashboardStats = async (req, res) => {
  try {
    // ১. বেসিক কাউন্ট (Basic Counts)
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    
    // ২. Revenue Calculation (Subscription Model)
    // যেহেতু বইয়ের দাম নেই, তাই আমরা PRO ইউজারদের সংখ্যা গুনব
    const totalProUsers = await User.countDocuments({ plan: "pro" });
    
    // মনে করি প্রতিটি PRO প্ল্যানের দাম $49 (তুমি চাইলে এটা পরিবর্তন করতে পারো)
    const subscriptionPrice = 149; 
    const totalRevenue = totalProUsers * subscriptionPrice;

    
    // recent 5 books
    const recentBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category cover_image createdAt stats");

    // লেটেস্ট ৫টি ইউজার
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role plan createdAt profilePhoto");

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalRevenue,
        totalProUsers, 
        recentBooks,
        recentUsers,
      },
    });
  } catch (error) {
    SendError(res, 500, error.message);
  }
};