
import Usermodel from "../../model/user.model.js";

const getAllUsers = async (req, res) => {
  try {
    // Get currently logged-in user ID
    const currentUserId =
      req.user.id || req.user._id || req.user.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Fetch all users except the logged-in user
    const users = await Usermodel.find({
      _id: { $ne: currentUserId },
   
    })
      .select("username fullName profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export default getAllUsers;
