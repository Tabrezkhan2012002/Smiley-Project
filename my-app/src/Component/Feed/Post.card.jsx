import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [popKey, setPopKey] = useState(0); // restarts the heart "pop" animation
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [newComments, setNewComments] = useState([]); // comments added in this session
  const commentInputRef = useRef(null);
  const navigate = useNavigate();

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setPopKey((k) => k + 1);
    // TODO (optional): call your like/unlike API here
  };

  const toggleComments = () => setShowComments((prev) => !prev);

  // Focus the input when the comment box opens
  useEffect(() => {
    if (showComments) commentInputRef.current?.focus();
  }, [showComments]);

  const handleAddComment = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    setNewComments((prev) => [...prev, { text, user: "You" }]);
    setCommentText("");
    // TODO (optional): call your add-comment API here
  };

  const profileImage = post?.user?.profilePicture;
  const postImage = post?.image;

  const baseLikes = post?.likes?.length || 0;
  const likeCount = baseLikes + (liked ? 1 : 0);

  const serverComments = Array.isArray(post?.comments) ? post.comments : [];
  const commentCount = serverComments.length + newComments.length;

  // Only render existing comments that are objects with readable text
  const readableServerComments = serverComments.filter(
    (c) => c && typeof c === "object" && (c.text || c.comment),
  );

  return (
    <article className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-sm shadow-stone-200/60">
      <style>{`
        @keyframes postcard-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .postcard-pop { animation: postcard-pop 0.35s ease-out; }
        @keyframes postcard-slide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .postcard-slide { animation: postcard-slide 0.25s ease-out; }
      `}</style>

      {/* User Info */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => {
          if (post?.user?._id) {
            navigate(`/profile/${post.user._id}`);
          }
        }}
      >
        <img
          src={profileImage || "/default-avatar.png"}
          alt={post?.user?.fullName || "User"}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-100"
        />

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-stone-900 truncate">
            {post?.user?.fullName || "Unknown User"}
          </p>

          <p className="text-sm text-stone-500 truncate">
            {post?.user?.username || ""}
          </p>
        </div>
      </div>

      {/* Caption */}
      {post?.caption && (
        <div className="px-4 pb-4 text-stone-700">{post.caption}</div>
      )}

      {/* Post Image */}
      {postImage && (
        <div className="w-full aspect-[4/5] bg-stone-100">
          <img
            src={postImage}
            alt="Post"
            className="w-full h-full object-cover"
            onDoubleClick={() => {
              if (!liked) toggleLike();
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 px-4 py-3 border-t border-stone-100">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          className={`flex items-center gap-2 transition-colors ${
            liked ? "text-rose-500" : "text-stone-500 hover:text-rose-400"
          }`}
        >
          <Heart
            key={popKey}
            className={`w-6 h-6 ${popKey > 0 ? "postcard-pop" : ""}`}
            fill={liked ? "currentColor" : "none"}
          />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={toggleComments}
          aria-expanded={showComments}
          aria-label="Comments"
          className={`flex items-center gap-2 transition-colors ${
            showComments ? "text-orange-500" : "text-stone-500 hover:text-orange-400"
          }`}
        >
          <MessageCircle
            className="w-6 h-6"
            fill={showComments ? "currentColor" : "none"}
          />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>

        <button
          type="button"
          aria-label="Share"
          className="ml-auto text-stone-500 hover:text-emerald-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comment box */}
      {showComments && (
        <div className="postcard-slide px-4 pb-4 border-t border-stone-100 bg-stone-50/60">
          {(readableServerComments.length > 0 || newComments.length > 0) && (
            <ul className="space-y-3 pt-4 max-h-60 overflow-y-auto">
              {readableServerComments.map((c, i) => (
                <li key={c._id || `s-${i}`} className="text-sm">
                  <span className="font-semibold text-stone-900">
                    {c.user?.username || c.user?.fullName || c.username || "User"}
                  </span>{" "}
                  <span className="text-stone-700">{c.text || c.comment}</span>
                </li>
              ))}

              {newComments.map((c, i) => (
                <li key={`n-${i}`} className="text-sm">
                  <span className="font-semibold text-stone-900">{c.user}</span>{" "}
                  <span className="text-stone-700">{c.text}</span>
                </li>
              ))}
            </ul>
          )}

          {readableServerComments.length === 0 && newComments.length === 0 && (
            <p className="pt-4 text-sm text-stone-500">
              No comments yet. Start the conversation!
            </p>
          )}

          <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-2">
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              aria-label="Add a comment"
              className="flex-1 min-w-0 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              aria-label="Post comment"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white shadow-md shadow-rose-200 transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}