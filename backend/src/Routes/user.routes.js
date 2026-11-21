import { Router } from "express";
import { registerController } from "../Config/controller/User.controller.js";
import loginController from "../Config/controller/login.controller.js";
import jwtAuthMiddleware from "../Middleware/jwtauth.middleware.js";
import otpvarification from "../Config/controller/otpverification.controller.js";
import { createReadStream } from "streamifier";
import uploadcloudinary from "../utilities/Cloudinary.js";
import { upload } from "../Middleware/multer.middleware.js";
import uploadProfileController from "../Config/controller/uploadimage.controller.js";
import { createPost } from "../Config/controller/post.controller.js";
import { deletePost } from "../Config/controller/post.controller.js";
import { getAllPosts, getprofile } from "../Config/controller/feed.controller.js";
import { profile } from "../Config/controller/profile.controller.js";
import {uploadPhoneNumber} from "../Config/controller/uploadimage.controller.js";
import getAllUsers from "../Config/controller/all.User.controller.js";
import { getNearbyShops } from "../Config/controller/nearbyShops.controller.js";
const router = Router();

router.post(
  "/users",
  upload.single("profile"),
  registerController
);
router.post("/verify-otp", otpvarification);
router.post("/Login", loginController);
router.get("/profile", jwtAuthMiddleware, profile);
router.post("/post-content", jwtAuthMiddleware, upload.single("image"), createPost);
router.delete("/delete-post", jwtAuthMiddleware, deletePost);
router.get("/getallpost", getAllPosts);
router.get("/profile-post/:id", jwtAuthMiddleware, getprofile);
router.post("/upload", jwtAuthMiddleware, upload.single("profile"), uploadProfileController);
router.post(
    "/upload-phone",
    jwtAuthMiddleware,
    uploadPhoneNumber
);
router.get("/all-users", jwtAuthMiddleware, getAllUsers);
router.get("/nearby-shops", jwtAuthMiddleware,getNearbyShops);


export default router; 