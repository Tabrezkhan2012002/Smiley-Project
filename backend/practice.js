const express = require("express");
const streamifier = require("streamifier");
const upload = require("../middleware/upload");
const cloudinary = require("../cloudinary");

const router = express.Router();

router.post(
    "/upload",
    upload.single("image"),
    async (req, res) => {

        try {

            // image category sent by frontend
            const type = req.body.type;

            // allowed folders
            const folders = {
                profile: "profiles",
                post: "posts",
                story: "stories",
                product: "products"
            };

            // choose folder
            const folder = folders[type] || "others";

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder
                },
                (error, result) => {

                    if (error) {
                        return res.status(500).json(error);
                    }

                    return res.json({
                        success: true,
                        imageUrl: result.secure_url,
                        folder: result.folder,
                        publicId: result.public_id
                    });

                }
            );

            streamifier
                .createReadStream(req.file.buffer)
                .pipe(uploadStream);

        } catch (err) {

            res.status(500).json({
                message: err.message
            });

        }

    }
);

module.exports = router;