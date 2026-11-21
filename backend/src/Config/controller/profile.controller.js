import Usermodel from "../../model/user.model.js"
export const profile = async (req, res) => {
    const user = await Usermodel.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }
    const profile = await Usermodel.findById(req.user.id)
      .select("username fullName profilePicture bio phoneNumber");

    return res.json(profile);

    res.status(200).json({
        success: true,
        profile
    });

};


