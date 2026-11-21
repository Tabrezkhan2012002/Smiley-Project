
import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Geospatial Index
shopSchema.index({ location: "2dsphere" });

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
