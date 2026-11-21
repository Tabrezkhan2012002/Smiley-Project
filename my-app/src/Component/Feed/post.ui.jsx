import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";

export default function Postui() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Used to reset the file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // ✅ Allow only images
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    // ✅ Limit file size to 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };


  const handleSubmit = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // ✅ Store image inside FormData
      formData.append("image", image);

      // ✅ Store caption inside FormData
      formData.append("caption", caption);

      // ✅ Correct Axios Syntax
      const res = await axios.post(
        "http://localhost:5000/testuser/post-content",
        formData,
        {
          withCredentials: true,
        },
      );

      console.log(res.data);

      if (res.status === 200 || res.status === 201) {
        alert("Post Uploaded Successfully");

        if (preview) {
          URL.revokeObjectURL(preview);
        }

        setImage(null);
        setPreview("");
        setCaption("");

        // ✅ Reset input field
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        navigate("/home");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  // ───────── UI-only helpers (no new state; reuse existing setters/handlers) ─────────

  const openFilePicker = () => fileInputRef.current?.click();

  // Drag & drop: highlights via a data attribute (no extra state) and
  // feeds the dropped file through the unchanged handleImageChange.
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.dataset.dragging = "true";
  };
  const handleDragLeave = (e) => {
    e.currentTarget.dataset.dragging = "false";
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.dataset.dragging = "false";
    if (!e.dataTransfer.files?.length || !fileInputRef.current) return;
    fileInputRef.current.files = e.dataTransfer.files;
    handleImageChange({ target: fileInputRef.current });
  };

  // Remove image: uses the existing setters; the existing effect revokes the old URL.
  const handleRemoveImage = () => {
    setImage(null);
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-8 sm:py-12">
      <style>{`
        @keyframes postui-fade-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .postui-fade-in { animation: postui-fade-in 0.35s ease-out; }
      `}</style>

      <div className="mx-auto w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-indigo-100/50 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create a New Post
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Share a moment with your followers.
          </p>
        </div>

        {/* Hidden file input (kept always mounted so the ref works) */}
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Upload area / Preview */}
        {!preview ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload an image"
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/70 px-4 py-10 text-center transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/60 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-100 data-[dragging=true]:scale-[1.01] data-[dragging=true]:border-violet-500 data-[dragging=true]:bg-violet-50 sm:py-14 [&>*]:pointer-events-none"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 shadow-sm transition-transform duration-200 group-hover:scale-110">
              <FontAwesomeIcon icon={faImage} className="text-3xl text-indigo-600" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Drag and drop your image here
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              or <span className="font-medium text-indigo-600">browse files</span>
            </p>

            <span className="mt-5 inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-indigo-200 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600">
              Browse Image
            </span>

            <p className="mt-4 text-xs text-gray-400">
              Supported formats: JPG, PNG, WEBP | Maximum size: 5MB
            </p>
          </div>
        ) : (
          <div className="postui-fade-in">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg ring-1 ring-black/5">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto block max-h-[320px] w-auto max-w-full object-contain sm:max-h-[480px]"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={openFilePicker}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-all duration-200 hover:bg-indigo-100 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
                Change Image
              </button>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Caption */}
        <div className="mt-6">
          <label htmlFor="postui-caption" className="mb-2 block text-sm font-medium text-gray-700">
            Caption
          </label>
          <textarea
            id="postui-caption"
            placeholder="Write something about this image..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {caption.length} characters
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300/60 active:translate-y-0 active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-90" />
              </svg>
              Uploading...
            </>
          ) : (
            "Share"
          )}
        </button>
      </div>
    </div>
  );
}