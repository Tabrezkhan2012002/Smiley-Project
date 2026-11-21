import React from "react";
import Navbar from "./Component/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import Register from "./Component/Register.jsx";
import OTP from "./Component/otp.jsx";
import Feedui from "./Component/Feed.ui.jsx";
import Postui from "./Component/Feed/post.ui.jsx";
import ProfileUI from "./Component/Profile.jsx";
import Chat from "./Component/chat/chat.jsx";
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navbar />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/home" element={<Feedui />} />
        <Route path="/post" element={<Postui />} />
        <Route path="/profile/:id" element={<ProfileUI />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
