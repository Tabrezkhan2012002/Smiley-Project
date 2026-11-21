import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import path from "path";

import db from "./src/Config/db.js";
import userRoutes from "./src/Routes/user.routes.js";
import Usermodel from "./src/model/user.model.js";
import {socketAuth} from "./src/Middleware/socket.auth.middleware.js"

dotenv.config();

const app = express();


app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "src", "upload"))
);

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


db();

app.use("/testuser", userRoutes);

// Delete user route
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await Usermodel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Test route
app.get("/hello", (req, res) => {
  res.send("hello world");
});

// ================= HTTP SERVER =================

const server = http.createServer(app);

// ================= SOCKET.IO =================

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});


io.use(socketAuth);

io.on("connection", (socket) => {
  console.log("Authenticated user:", socket.userId);
  console.log("Socket ID:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});


const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("Socket.IO is ready!");
});
