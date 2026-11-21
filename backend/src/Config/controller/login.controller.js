import Usermodel from "../../model/user.model.js";
import verifyHash from "../../utilities/verifyhash.js";
import jwt from "jsonwebtoken";

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        // Check if user exists
        const user = await Usermodel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify password
        const isPasswordValid = await verifyHash(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Cookie options
        const options = {
            httpOnly: true,                        
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };


        const { password: __, ...userData } = user.toObject();

        // Send cookie
        return res
            .status(200)
            .cookie("token", token, options)
            .json({
                success: true,
                message: "Login successful",
                user: userData
            });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export default loginController;