import { StoryBubble, YourStoryBubble } from "./Story";
import { PostCard } from "./Post.card";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";

import {
  Home,
  Users,
  Plus,
  MoreHorizontal,
  Menu,
  Image,
  Video,
  CalendarDays,
  Smile,
  X,
  MapPin,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home },
  { label: "Message", icon: Users },
];

// Fashion-themed story images (shirts, tees, streetwear, minimal fashion).
const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=256&h=256&q=80`;

const STORIES = [
  { id: 1, name: "Oversized", avatar: img("photo-1521572163474-6864f9cf17ab") },
  { id: 2, name: "Streetwear", avatar: img("photo-1523381210434-271e8be1f52b") },
  { id: 3, name: "Casuals", avatar: img("photo-1596755094514-f87e34085b2c") },
  { id: 4, name: "Minimal", avatar: img("photo-1562157873-818bc0726f68") },
  { id: 5, name: "New Drop", avatar: img("photo-1489987707025-afc232f7ea0f") },
  { id: 6, name: "Basics", avatar: img("photo-1576566588028-4147f3842f27") },
];

// Skeleton shown while posts are being fetched
function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-gray-200" />
          <div className="h-3 w-1/4 rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-4 aspect-[4/3] w-full rounded-xl bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seenStories, setSeenStories] = useState({});
  const [POSTS, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Feed error (for the retry UI)
  const [postsError, setPostsError] = useState("");

  // Customer location states
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [detecting, setDetecting] = useState(false);

  // Nearby shops states
  const [nearbyShops, setNearbyShops] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

  // Message authentication loading
  const [checkingAuth, setCheckingAuth] = useState(false);

  const navigate = useNavigate();

  // ---- Infinite scroll helpers (refs avoid stale closures / duplicate requests) ----
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false); // synchronous in-flight guard
  const pageRef = useRef(1); // latest successfully loaded page
  const initialFetchRef = useRef(false); // prevents double first-page fetch
  const loadMoreRef = useRef(() => {});

  // =====================================
  // FETCH NEARBY SHOPS
  // =====================================
  const fetchNearbyShops = async (latitude, longitude) => {
    try {
      setNearbyLoading(true);
      setNearbyError("");

      const { data } = await axios.get(
        "http://localhost:5000/testuser/nearby-shops",
        {
          params: {
            latitude,
            longitude,
          },
          withCredentials: true,
        },
      );

      setNearbyShops(data.shops || data.nearbyShops || []);
    } catch (err) {
      console.error("Nearby shops error:", err.response?.data || err.message);

      setNearbyShops([]);
      setNearbyError(
        err.response?.data?.message ||
          "Unable to fetch nearby shops. Please try again.",
      );
    } finally {
      setNearbyLoading(false);
    }
  };

  // =====================================
  // DETECT CUSTOMER LOCATION
 
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError("");
    setNearbyError("");
    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        setLocation({ latitude, longitude, accuracy });
        setDetecting(false);

        await fetchNearbyShops(latitude, longitude);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied.");
            break;

          case err.POSITION_UNAVAILABLE:
            setError("Location information unavailable.");
            break;

          case err.TIMEOUT:
            setError("Location request timed out.");
            break;

          default:
            setError("Something went wrong.");
        }

        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const markSeen = (id) => setSeenStories((prev) => ({ ...prev, [id]: true }));

  // =====================================
  // FETCH POSTS
  // Returns true on success, false on failure/skip.
  // =====================================
  const fetchPosts = async (pageNumber) => {
    // Never run two requests at once
    if (loadingRef.current) return false;
    loadingRef.current = true;

    try {
      setLoading(true);
      setPostsError("");

      const { data } = await axios.get(
        `http://localhost:5000/testuser/getallpost?page=${pageNumber}`,
      );

      const incoming = data.posts || [];

      if (pageNumber === 1) {
        setPosts(incoming);
      } else {
        // Append without duplicates
        setPosts((prevPosts) => {
          const existing = new Set(prevPosts.map((p) => p._id));
          return [...prevPosts, ...incoming.filter((p) => !existing.has(p._id))];
        });
      }

      setHasMore(data.hasMore);
      return true;
    } catch (err) {
      console.error("Fetch posts error:", err);
      setPostsError("Couldn't load posts. Please try again.");
      return false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // =====================================
  // FETCH LOGGED-IN USER PROFILE
  // =====================================
  const userprofile = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/testuser/profile",
        { withCredentials: true },
      );

      setUser(data);
    } catch (err) {
      console.error("Profile error:", err);
    }
  };

  useEffect(() => {
    if (initialFetchRef.current) return; // guards StrictMode / re-mount double fetch
    initialFetchRef.current = true;

    fetchPosts(1);
    userprofile();
  }, []);

  // Loads the next page (called automatically by the IntersectionObserver)
  const loadMore = async () => {
    if (loadingRef.current || !hasMore) return;

    const nextPage = pageRef.current + 1;
    const ok = await fetchPosts(nextPage);

    if (ok) {
      pageRef.current = nextPage;
      setPage(nextPage);
    }
  };

  // Always point to the latest loadMore so the observer never uses stale state
  loadMoreRef.current = loadMore;

  // Retry after an error (first page or next page)
  const handleRetry = async () => {
    if (pageRef.current === 1 && POSTS.length === 0) {
      await fetchPosts(1);
    } else {
      await loadMore();
    }
  };

  // =====================================
  // INFINITE SCROLL OBSERVER
  // Re-created when loading finishes so a still-visible sentinel triggers the next page.
  // =====================================
  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMore || loading || postsError || POSTS.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, loading, postsError, POSTS.length, page]);

  // =====================================
  // MESSAGE NAVIGATION + LOGIN CHECK
  // =====================================
  const handleMessageClick = async () => {
    try {
      setCheckingAuth(true);

      await axios.get("http://localhost:5000/testuser/profile", {
        withCredentials: true,
      });

      navigate("/chat");
    } catch (err) {
      console.error("Authentication error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        alert("Please login first!");
        navigate("/login");
      } else {
        alert("Unable to verify login. Please try again.");
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  const gradientBtn =
    "bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
            S
          </div>
          <span className="font-semibold text-base text-gray-900">Smiley</span>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden"
        />
      )}

      <div className="lg:flex">
        {/* Sidebar */}
        <aside
          className={
            "fixed lg:sticky z-50 top-0 left-0 h-full lg:h-screen w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-out " +
            (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
            " lg:translate-x-0"
          }
        >
          <div className="flex items-center justify-between px-6 h-16 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-indigo-200">
                S
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                Smiley
              </span>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="lg:hidden text-gray-800 p-1.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === 0;

              return (
                <button
                  key={item.label}
                  disabled={item.label === "Message" && checkingAuth}
                  onClick={() => {
                    if (item.label === "Message") {
                      handleMessageClick();
                    } else {
                      navigate("/");
                    }

                    setSidebarOpen(false);
                  }}
                  className={
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 " +
                    (active
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold ring-1 ring-indigo-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900") +
                    (checkingAuth && item.label === "Message"
                      ? " opacity-50 cursor-wait"
                      : "")
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />

                  {checkingAuth && item.label === "Message"
                    ? "Checking..."
                    : item.label}
                </button>
              );
            })}
          </nav>

          {/* Profile */}
          <div
            className="m-3 p-3 rounded-xl border border-gray-200 flex items-center gap-3 shrink-0 cursor-pointer transition-colors hover:bg-gray-50"
            onClick={() => {
              if (!user?._id) {
                console.error("User ID is missing!");
                return;
              }

              navigate(`/profile/${user._id}`);
            }}
          >
            <img
              src={user?.profilePicture || "/default-avatar.png"}
              alt="Profile"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/default-avatar.png";
              }}
              className="w-10 h-10 rounded-full ring-2 ring-indigo-100 object-cover"
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.fullName}</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 min-h-screen">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {/* Customer Location */}
            <div className="mb-6">
              <button
                onClick={detectLocation}
                disabled={detecting || nearbyLoading}
                className={gradientBtn}
              >
                {detecting || nearbyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}

                {detecting
                  ? "Detecting..."
                  : nearbyLoading
                    ? "Finding Nearby Shops..."
                    : "Detect My Location"}
              </button>

              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

              {location && (
                <div className="mt-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm text-gray-700 space-y-1">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    Detected Location
                  </h3>

                  <p>Latitude: {location.latitude}</p>
                  <p>Longitude: {location.longitude}</p>
                  <p>Accuracy: {Math.round(location.accuracy)} metres</p>
                </div>
              )}
            </div>

            {/* Nearby Shops */}
            {location && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Shops Near You
                </h2>

                {nearbyLoading && (
                  <p className="text-sm text-gray-500">
                    Finding nearby shops...
                  </p>
                )}

                {nearbyError && (
                  <p className="text-sm text-red-500">{nearbyError}</p>
                )}

                {!nearbyLoading && !nearbyError && nearbyShops.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No nearby shops found.
                  </p>
                )}

                <div className="space-y-3">
                  {nearbyShops.map((shop) => (
                    <div
                      key={shop._id}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200"
                      onClick={() => {
                        if (!user?._id) {
                          console.error("User ID is missing!");
                          return;
                        }

                        navigate(`/profile/${user._id}`);
                      }}
                    >
                      <img
                        src={shop.profilePicture || "/default-avatar.png"}
                        alt={shop.fullName || shop.username || "Shop"}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
                      />

                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {shop.fullName || shop.username}
                        </h3>

                        <p className="text-xs text-gray-500 truncate">
                          @{shop.username}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {shop.shopLocation?.address || "Address unavailable"}
                        </p>

                        {typeof shop.distance === "number" && (
                          <p className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1.5">
                            {(shop.distance / 1000).toFixed(2)} km away
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Catch up on what your teams shared today
                </p>
              </div>

              <button className={gradientBtn} onClick={() => navigate("/post")}>
                <Plus className="w-4 h-4" />
                New post
              </button>
            </div>

            {/* Stories */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
              <div className="flex gap-4 sm:gap-5 overflow-x-auto px-1 py-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="shrink-0 snap-start transition-transform duration-200 hover:scale-105 active:scale-95">
                  <YourStoryBubble
                    avatar={
                      user?.profilePicture || "https://i.pravatar.cc/128?img=12"
                    }
                  />
                </div>

                {STORIES.map((story) => (
                  <div
                    key={story.id}
                    className="shrink-0 snap-start transition-transform duration-200 hover:scale-105 active:scale-95"
                  >
                    <StoryBubble
                      story={story}
                      seen={!!seenStories[story.id]}
                      onOpen={markSeen}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Create Post */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm w-full">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={user?.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-indigo-100 cursor-pointer shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <textarea
                    rows="2"
                    placeholder="Share your thoughts..."
                    className="w-full bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl p-3 sm:p-4 resize-none outline-none border border-gray-200 transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              <div className="flex justify-between items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition active:scale-95">
                    <Image size={18} className="text-green-500" />
                    <span className="text-gray-700 text-sm font-medium">
                      Photo
                    </span>
                  </button>

                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition active:scale-95">
                    <Video size={18} className="text-blue-500" />
                    <span className="text-gray-700 text-sm font-medium">
                      Video
                    </span>
                  </button>

                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition active:scale-95">
                    <CalendarDays size={18} className="text-red-500" />
                    <span className="text-gray-700 text-sm font-medium">
                      Event
                    </span>
                  </button>

                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition active:scale-95">
                    <Smile size={18} className="text-yellow-500" />
                    <span className="text-gray-700 text-sm font-medium">
                      Feeling / Activity
                    </span>
                  </button>
                </div>

                <button
                  aria-label="More options"
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition active:scale-95 shrink-0"
                >
                  <MoreHorizontal size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Feed */}
            <div className="mt-8 space-y-8">
              {POSTS.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Infinite scroll sentinel (observed by IntersectionObserver) */}
            <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

            {/* Loading skeletons (first load shows 2, next pages show 1) */}
            {loading && (
              <div className="space-y-8 mt-8" role="status" aria-live="polite">
                <PostSkeleton />
                {POSTS.length === 0 && <PostSkeleton />}
                <span className="sr-only">Loading posts…</span>
              </div>
            )}

            {/* Error + retry */}
            {postsError && !loading && (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center">
                <p className="text-sm text-red-600">{postsError}</p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 shadow-sm transition hover:bg-red-100 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            )}

            {/* Empty feed */}
            {!loading && !postsError && !hasMore && POSTS.length === 0 && (
              <p className="mt-10 text-center text-sm text-gray-500">
                No posts yet. Be the first to share something!
              </p>
            )}

            {/* End of feed */}
            {!hasMore && POSTS.length > 0 && (
              <div className="mt-10 mb-4 flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                  <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  You're all caught up!
                </p>
                <p className="text-xs text-gray-500">
                  You've seen all the latest posts.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;