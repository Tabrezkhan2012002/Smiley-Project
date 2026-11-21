import React, { useEffect, useState, useRef } from "react";
import { Settings, Heart, MessageCircle, X, Camera } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Profileui() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  // Like state: { [postId]: true/false }
  const [likedPosts, setLikedPosts] = useState({});

  // Profile upload states
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  // Fetch profile posts
  useEffect(() => {
    const fetchProfilePost = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/testuser/profile-post/${id}`,
          {
            withCredentials: true,
          },
        );

        setPost(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfilePost();
    }
  }, [id]);

  // Upload profile picture
  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate image
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();

      // Must match upload.single("profile")
      formData.append("profile", file);

      const { data } = await axios.post(
        "http://localhost:5000/testuser/upload",
        formData,
        {
          withCredentials: true,
        },
      );

      const uploadedImage = data.profilePicture || data.profile?.profilePicture;

      if (!uploadedImage) {
        throw new Error("Profile picture URL not received from server.");
      }

      // Update profile picture immediately
      setProfilePic(uploadedImage);

      // Also update profile data
      setPost((prev) => ({
        ...prev,
        user: {
          ...prev?.user,
          profilePicture: uploadedImage,
        },
      }));
    } catch (err) {
      console.error("Profile Upload Error:", err);

      setUploadError(
        err.response?.data?.message ||
          err.message ||
          "Profile picture upload failed.",
      );
    } finally {
      setUploading(false);

      // Allow selecting the same image again
      e.target.value = "";
    }
  };

  // Like / Unlike (0 -> 1, click again 1 -> 0)
  const handleLike = (p) => {
    const alreadyLiked = !!likedPosts[p._id];
    const delta = alreadyLiked ? -1 : 1;

    setLikedPosts((prev) => ({ ...prev, [p._id]: !alreadyLiked }));

    // Update count in the grid
    setPost((prev) => ({
      ...prev,
      posts: (prev?.posts || []).map((item) =>
        item._id === p._id
          ? { ...item, likes: Math.max(0, (item.likes ?? 0) + delta) }
          : item,
      ),
    }));

    // Update count in the modal
    setSelectedPost((prev) =>
      prev ? { ...prev, likes: Math.max(0, (prev.likes ?? 0) + delta) } : prev,
    );
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedPost(null);
      }
    };

    if (selectedPost) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [selectedPost]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h1 className="text-xl">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h1 className="text-red-500">{error}</h1>
      </div>
    );
  }

  const posts = post?.posts || [];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      {/* Profile Header */}
      <div className="flex items-start gap-12 w-full max-w-4xl">
        {/* Left Section */}
        <div className="flex flex-col items-center">
          {/* Profile Picture Upload */}
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={
                profilePic ||
                post?.user?.profilePicture ||
                "https://via.placeholder.com/180"
              }
              alt="Profile"
              className="w-44 h-44 rounded-full object-cover border-2 border-gray-500"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera size={30} className="text-white mb-2" />

              <span className="text-white font-semibold text-sm">
                {uploading ? "Uploading..." : "Change Photo"}
              </span>
            </div>

            {/* Upload Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileUpload}
              disabled={uploading}
            />
          </div>

          {/* Uploading Message */}
          {uploading && (
            <p className="mt-3 text-blue-600 text-sm">
              Uploading profile picture...
            </p>
          )}

          {/* Upload Error */}
          {uploadError && (
            <p className="mt-3 text-red-500 text-sm text-center">
              {uploadError}
            </p>
          )}

          <button
            onClick={() => {
              const phone = post?.user?.phoneNumber;

              if (!phone) {
                alert("WhatsApp number is not available");
                return;
              }

              const whatsappURL = `https://wa.me/${phone}`;

              window.open(whatsappURL, "_blank");
            }}
            className="mt-5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            WhatsApp
          </button>
        </div>

        {/* Right Section */}
        <div>
          {/* Username + Settings */}
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-black">
              {post?.user?.username || "Username"}
            </h1>

            <Settings
              size={30}
              className="text-black cursor-pointer hover:text-gray-500"
            />
          </div>

          {/* Full Name */}
          <p className="mt-2 text-lg text-black">
            {post?.user?.fullName || "No Name"}
          </p>

          {/* About */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-black mb-2">About</h2>

            <p className="text-black max-w-md leading-7">
             Explore our collection of everyday essentials, lifestyle products, and more. Quality, value, and customer satisfaction are our priorities.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-4xl border-t border-gray-300 mt-10" />

      {/* Posts Section */}
      <div className="w-full max-w-4xl mt-8">
        <h2 className="text-2xl font-semibold text-black mb-6 tracking-wide">
          Posts
        </h2>

        {posts.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-lg">No posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {posts.map((p) => (
              <div
                key={p._id}
                onClick={() => setSelectedPost(p)}
                className="relative aspect-square overflow-hidden rounded-md cursor-pointer group bg-gray-100"
              >
                <img
                  src={p.image}
                  alt={p.caption || "Post"}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 ease-in-out flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-6 text-white font-semibold">
                    <div className="flex items-center gap-2">
                      <Heart size={22} className="fill-white" />
                      <span>{p.likes ?? 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageCircle size={22} className="fill-white" />
                      <span>{p.comments ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fadeIn"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Image */}
            <div className="md:w-3/5 w-full bg-black flex items-center justify-center">
              <img
                src={selectedPost.image}
                alt={selectedPost.caption || "Post"}
                className="w-full max-h-[50vh] md:max-h-[90vh] object-contain"
              />
            </div>

            {/* Details */}
            <div className="md:w-2/5 w-full p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={
                      profilePic ||
                      post?.user?.profilePicture ||
                      "https://via.placeholder.com/40"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />

                  <span className="font-semibold text-black">
                    {post?.user?.username || "Username"}
                  </span>
                </div>

                <p className="text-black leading-6 mb-6">
                  {selectedPost.caption || "No caption."}
                </p>
              </div>

              <div className="flex items-center gap-6 border-t border-gray-200 pt-4">
                {/* Like button */}
                <button
                  onClick={() => handleLike(selectedPost)}
                  className="flex items-center gap-2 text-black active:scale-90 transition-transform"
                >
                  <Heart
                    size={22}
                    className={
                      likedPosts[selectedPost._id]
                        ? "text-red-500 fill-red-500"
                        : "text-gray-500"
                    }
                  />
                  <span className="font-medium">
                    {selectedPost.likes ?? 0} likes
                  </span>
                </button>

                <div className="flex items-center gap-2 text-black">
                  <MessageCircle size={22} className="text-blue-500" />
                  <span className="font-medium">
                    {selectedPost.comments ?? 0} comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Profileui;