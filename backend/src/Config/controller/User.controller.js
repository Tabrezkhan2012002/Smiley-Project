
import Usermodel from "../../model/user.model.js";
import transporter from "../../utilities/mailhandler.js";
import crypto from "crypto";

const generateOtp = () => {
  return crypto.randomInt(10000, 100000);
};

const sendOtpEmail = async (email, fullName, otp) => {
  await transporter.sendMail({
    from: `"Smiley" <${process.env.SMTP_EMAIL_USER}>`,
    to: email,
    subject: "Smiley Verification Code",
    text: `Your OTP is: ${otp}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px">
        <h2>Email Verification</h2>
        <p>Hi <b>${fullName}</b>,</p>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:5px">${otp}</h1>
        <p>This OTP will expire in <b>10 minutes</b>.</p>
      </div>
    `,
  });
};

// Convert coordinates into a readable address
const getReadableAddress = async (latitude, longitude) => {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: latitude.toString(),
    lon: longitude.toString(),
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    {
      headers: {
        "User-Agent": "SmileyApp/1.0",
      },
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch shop address.");
  }

  const result = await response.json();

  if (!result.display_name) {
    throw new Error("Address not found for this location.");
  }

  return result.display_name;
};

export const registerController = async (req, res) => {
  try {
    const {
      username,
      fullName,
      phoneNumber,
      email,
      password,
      role = "customer",
      latitude,
      longitude,
    } = req.body;

    if (!username || !fullName || !phoneNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["customer", "shopkeeper"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // Prepare shopkeeper location
    let shopLocation;

    if (role === "shopkeeper") {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        latitude === undefined ||
        longitude === undefined ||
        latitude === "" ||
        longitude === "" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid shop location is required",
        });
      }

      // Get readable address using reverse geocoding
      let address;

      try {
        address = await getReadableAddress(lat, lng);
      } catch (error) {
        console.error("Geocoding Error:", error);

        return res.status(502).json({
          success: false,
          message: "Unable to fetch shop address. Please try again.",
        });
      }

      shopLocation = {
        type: "Point",
        coordinates: [lng, lat],
        address,
      };
    }

    // Validate phone number
    const cleanedNumber = phoneNumber.replace(/[\s\-+()]/g, "");

    if (!/^\d{10,15}$/.test(cleanedNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    const profilePicture = req.file?.path || "";

    const existingByEmail = await Usermodel.findOne({ email });
    const existingByUsername = await Usermodel.findOne({ username });

    if (
      existingByEmail &&
      existingByUsername &&
      existingByEmail._id.toString() !== existingByUsername._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and username already belong to different accounts",
      });
    }

    const existingUser = existingByEmail || existingByUsername;

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email or Username already exists",
      });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user;

    if (existingUser && !existingUser.isVerified) {
      existingUser.username = username;
      existingUser.fullName = fullName;
      existingUser.phoneNumber = cleanedNumber;
      existingUser.email = email;
      existingUser.password = password;
      existingUser.role = role;

      if (role === "shopkeeper") {
        existingUser.shopLocation = shopLocation;
      } else {
        existingUser.shopLocation = undefined;
      }

      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;

      if (profilePicture) {
        existingUser.profilePicture = profilePicture;
      }

      user = await existingUser.save();
    } else {
      user = await Usermodel.create({
        username,
        fullName,
        phoneNumber: cleanedNumber,
        email,
        password,
        profilePicture,
        role,
        shopLocation,
        otp,
        otpExpiry,
      });
    }

    await sendOtpEmail(email, fullName, otp);

    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      user: userObj,
    });

  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
