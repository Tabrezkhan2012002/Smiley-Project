import Usermodel from "../models/user.model.js"; // 👈 adjust to your real model path

const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,30}$/;
const BIO_MAX_LENGTH = 150;

/**
 * PUT /testuser/update-profile
 * Body: { fullName?, username?, bio? }
 * Only these three fields can be changed here (role, email, password, etc. are ignored).
 */
export const updateProfile = async (req, res) => {
  try {
    // 👇 Use whatever your auth middleware sets (same one used by GET /profile)
    const userId = req.user?._id || req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { fullName, username, bio } = req.body;
    const updates = {};

    // ---- Full name ----
    if (fullName !== undefined) {
      if (typeof fullName !== "string" || !fullName.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Name cannot be empty." });
      }
      updates.fullName = fullName.trim();
    }

    // ---- Username ----
    if (username !== undefined) {
      const cleanUsername = typeof username === "string" ? username.trim() : "";

      if (!USERNAME_REGEX.test(cleanUsername)) {
        return res.status(400).json({
          success: false,
          message:
            "Username must be 3–30 characters: letters, numbers, dots or underscores.",
        });
      }

      const taken = await Usermodel.exists({
        username: cleanUsername,
        _id: { $ne: userId },
      });

      if (taken) {
        return res
          .status(409)
          .json({ success: false, message: "This username is already taken." });
      }

      updates.username = cleanUsername;
    }

    // ---- Bio ----
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid bio." });
      }

      const cleanBio = bio.trim();

      if (cleanBio.length > BIO_MAX_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Bio must be ${BIO_MAX_LENGTH} characters or less.`,
        });
      }

      updates.bio = cleanBio;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update." });
    }

    const updatedUser = await Usermodel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpiry");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    // Two requests grabbing the same username at once
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "This username is already taken." });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }

    console.error("Update profile error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

/*
  ROUTE (add next to your other /testuser routes):

  import { updateProfile } from "../controllers/updateProfile.controller.js";

  router.put("/update-profile", yourAuthMiddleware, updateProfile);
*/