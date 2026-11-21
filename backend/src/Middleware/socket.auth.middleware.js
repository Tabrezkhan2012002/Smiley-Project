
import jwt from "jsonwebtoken";
import cookie from "cookie";

export const socketAuth = (socket, next) => {
  try {
    const cookies = cookie.parse(
      socket.handshake.headers.cookie || ""
    );

    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.userId = decoded.id;

    next();

  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};
