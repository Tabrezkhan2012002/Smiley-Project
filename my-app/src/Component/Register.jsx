import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User, Phone, Mail, Lock, AtSign } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    type: "",
  });
  const [role, setRole] = useState("customer");

  // Clean up image preview URL
  useEffect(() => {
    if (!profileFile) {
      setPreview(null);
      return;
    }

    const imageUrl = URL.createObjectURL(profileFile);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [profileFile]);

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        text: "Please select a valid image.",
        type: "error",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: "Image size must be less than 5MB.",
        type: "error",
      });

      e.target.value = "";
      return;
    }

    setProfileFile(file);
    setMessage({ text: "", type: "" });
  };

  // Submit registration

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let position = null;

      // Get location only for shopkeepers
      if (role === "shopkeeper") {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser.");
        }

        position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        });
      }

      const data = new FormData();

      data.append("username", formData.username);
      data.append(
        "fullName",
        `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      );
      data.append("phoneNumber", formData.phoneNumber);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", role);

      // Send shopkeeper coordinates
      if (position) {
        data.append("latitude", position.coords.latitude);
        data.append("longitude", position.coords.longitude);
      }

      if (profileFile) {
        data.append("profile", profileFile);
      }

      const response = await axios.post(
        "http://localhost:5000/testuser/users",
        data,
        {
          withCredentials: true,
        },
      );

      console.log("Registration Success:", response.data);

      setMessage({
        text: "Account created successfully!",
        type: "success",
      });

      setFormData({
        username: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
      });

      setProfileFile(null);
      setRole("customer");

      navigate("/otp");
    } catch (error) {
      console.error("Registration Error:", error);

      let errorMessage = error.response?.data?.message || error.message;

      if (error.code === 1) {
        errorMessage =
          "Location permission denied. Please allow location access.";
      } else if (error.code === 2) {
        errorMessage = "Unable to determine your location.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      }

      setMessage({
        text: errorMessage || "Registration failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400";

  return (
    <Fragment>
      <div
        className="isolate bg-white min-h-screen py-12 px-4 flex justify-center relative"
        data-aos="zoom-in-left"
      >
        {/* Background */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-1/2 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 w-[60rem] h-[35rem]"
          />
        </div>

        {/* Registration Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-7">
          {/* Heading */}
          <div className="text-center mb-7">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>

            <p className="mt-2 text-sm text-gray-500"></p>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-7">
            <label className="relative cursor-pointer group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={45} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 border-2 border-white">
                <Camera size={18} className="text-white" />
              </div>

              <input
                type="file"
                name="profile"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="text-sm text-gray-500 mt-3">Add Profile Picture</p>
          </div>

          {/* Success / Error Message */}
          {message.text && (
            <div
              className={`mb-5 px-4 py-3 rounded-lg text-sm text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Username
              </label>

              <div className="relative">
                <AtSign
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose username"
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                WhatsApp Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="919876543210"
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>

              <p className="text-xs text-gray-400 mt-1">
                Include country code, e.g. 91 for India.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                  minLength={6}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Submit */}
            {/* Account Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Register As
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              >
                <option value="customer">Customer</option>
                <option value="shopkeeper">Shopkeeper</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            By creating an account, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </Fragment>
  );
}

export default Register;
