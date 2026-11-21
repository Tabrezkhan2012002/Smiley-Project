import Usermodel from "../../model/user.model.js";
import uploadcloudinary from "../../utilities/Cloudinary.js";
import fs from "fs";

// ========================================
// UPLOAD PROFILE PICTURE
// ========================================

const uploadProfileController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
            });
        }

        const user = await Usermodel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const result = await uploadcloudinary(req.file.path, "profiles");

        if (!result || !result.secure_url) {
            return res.status(500).json({
                success: false,
                message: "Image upload to Cloudinary failed",
            });
        }

        user.profilePicture = result.secure_url;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            profilePicture: user.profilePicture,
        });

    } catch (error) {
        console.error("Profile upload error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to upload profile picture",
        });
    } finally {
        // Remove the temp file saved by multer, whether upload succeeded or not
        if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
        }
    }
};
export default uploadProfileController;


// ========================================
// UPDATE WHATSAPP PHONE NUMBER
// ========================================

export  const uploadPhoneNumber = async (req, res) => {
    try {
        const userId = req.user.id;
        const { phoneNumber } = req.body;

        if (!phoneNumber || typeof phoneNumber !== "string") {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        // Remove spaces, hyphens, plus signs and brackets
        const cleanedNumber = phoneNumber.replace(/[\s\-+()]/g, "");

        // Validate phone number (10-15 digits, including country code)
        if (!/^\d{10,15}$/.test(cleanedNumber)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number with country code",
            });
        }

        const user = await Usermodel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.phoneNumber = cleanedNumber;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "WhatsApp number updated successfully",
            phoneNumber: user.phoneNumber,
        });

    } catch (error) {
        console.error("Phone number upload error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update phone number",
        });
    }
};