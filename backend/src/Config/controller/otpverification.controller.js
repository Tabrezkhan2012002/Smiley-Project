import registeruser from "../../model/user.model.js";

const otpvarification = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: " OTP are required" });
    }

    const otpRecord = await registeruser.findOne({ otp });

    if (!otpRecord) {
      return res.status(404).json({ error: "otp not found" });
    }

    if (Date.now() > otpRecord.otpExpiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (String(otpRecord.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default otpvarification;