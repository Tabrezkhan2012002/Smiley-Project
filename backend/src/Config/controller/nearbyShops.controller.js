
import Usermodel from "../../model/user.model.js";

export const getNearbyShops = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Validate coordinates
    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === "" ||
      longitude === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    // Find shopkeepers within 5 km
    const nearbyShops = await Usermodel.find({
      role: "shopkeeper",
      shopLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 5000,
        },
      },
    }).select("username fullName profilePicture phoneNumber shopLocation");

    return res.status(200).json({
      success: true,
      count: nearbyShops.length,
      shops: nearbyShops,
    });
  } catch (error) {
    console.error("Nearby Shops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch nearby shops",
    });
  }
};
