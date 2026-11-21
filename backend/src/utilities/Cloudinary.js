
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadcloudinary = async (localfilepath, folder) => {
    try {
        if (!localfilepath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(localfilepath, {
            folder,
            resource_type: "image",
            transformation: [
                {
                    quality: "auto",
                    fetch_format: "auto",
                },
            ],
        });

        console.log("Image uploaded successfully:", response.secure_url);

        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);

        return null;

    } finally {
        // Delete temporary local image after upload attempt
        if (localfilepath && fs.existsSync(localfilepath)) {
            await fs.promises.unlink(localfilepath).catch(console.error);
        }
    }
};

export default uploadcloudinary;
