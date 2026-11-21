const STORIES = [
  { id: 1, name: "Meera", avatar: "https://i.pravatar.cc/128?img=32" },
  { id: 2, name: "Rohan", avatar: "https://i.pravatar.cc/128?img=5" },
  { id: 3, name: "Priya", avatar: "https://i.pravatar.cc/128?img=47" },
  { id: 4, name: "Kabir", avatar: "https://i.pravatar.cc/128?img=15" },
  { id: 5, name: "Ishaan", avatar: "https://i.pravatar.cc/128?img=25" },
  { id: 6, name: "Diya", avatar: "https://i.pravatar.cc/128?img=9" },
];

const RING_GRADIENT = {
  background: "conic-gradient(from 180deg, #6366f1, #a855f7, #ec4899, #6366f1)",
};

export function StoryBubble({ story, seen, onOpen }) {
  return (
    <button
      onClick={() => onOpen(story.id)}
      className="relative shrink-0 w-28 h-44 rounded-xl overflow-hidden"
    >
      {/* Background Image */}
      <img
        src={story.avatar}
        alt={story.name}
        className={`absolute inset-0 w-full h-full object-cover transition duration-300 ${
          seen ? "opacity-60" : ""
        }`}
      />

      {/* Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Profile Picture */}
      <div className="absolute top-3 left-3">
        <img
          src={story.avatar}
          alt={story.name}
          className={`w-10 h-10 rounded-full border-4 ${
            seen ? "border-gray-500" : "border-blue-500"
          } object-cover`}
        />
      </div>

      {/* Username */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white font-semibold text-sm truncate">
          {story.name}
        </p>
      </div>
    </button>
  );
}

import { Plus } from "lucide-react";

export function YourStoryBubble({ avatar }) {
  return (
    <button className="relative shrink-0 w-28 h-44 rounded-xl overflow-hidden bg-slate-800">
      {/* Background */}
      <img
        src={avatar}
        alt="Your Story"
        className="absolute top-0 left-0 w-full h-28 object-cover"
      />

      {/* Bottom White Section */}
      <div className="absolute bottom-0 w-full h-16 bg-white flex flex-col justify-center items-center">
        {/* Plus Button */}
        <div className="absolute -top-5 bg-blue-500 rounded-full p-2 border-4 border-white">
          <Plus className="w-4 h-4 text-white" />
        </div>

        <p className="text-sm font-semibold mt-3">Post a Story</p>
      </div>
    </button>
  );
}
