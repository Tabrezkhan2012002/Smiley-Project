
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["customer", "shopkeeper"],
      default: "customer",
    },

    shopLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: undefined,
        validate: {
          validator: function (coordinates) {
            return (
              !coordinates ||
              (coordinates.length === 2 &&
                Number.isFinite(coordinates[0]) &&
                Number.isFinite(coordinates[1]) &&
                coordinates[0] >= -180 &&
                coordinates[0] <= 180 &&
                coordinates[1] >= -90 &&
                coordinates[1] <= 90)
            );
          },
          message: "Invalid longitude or latitude",
        },
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: Number,
    },

    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.index({ shopLocation: "2dsphere" });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Usermodel = mongoose.model("User", userSchema);

export default Usermodel;
