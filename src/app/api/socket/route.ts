import { Server } from "socket.io";
import { NextRequest } from "next/server";
import { NextApiResponseServerIO } from "@/lib/socket";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...");

    const io = new Server(res.socket.server as any, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error("Authentication error"));
      }

      socket.userId = decoded.userId;
      socket.siteId = decoded.siteId;
      socket.role = decoded.role;

      next();
    });

    io.on("connection", (socket) => {
      console.log(`User ${socket.userId} connected to site ${socket.siteId}`);

      // Join site-specific room
      socket.join(`site:${socket.siteId}`);

      // Join role-specific room
      socket.join(`role:${socket.role}`);

      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
      });

      // Custom events
      socket.on("announcement:read", (data) => {
        socket.to(`site:${socket.siteId}`).emit("announcement:read", {
          announcementId: data.announcementId,
          userId: socket.userId,
        });
      });

      socket.on("complaint:new", (data) => {
        socket.to(`role:site_admin`).emit("complaint:new", {
          ...data,
          userId: socket.userId,
          siteId: socket.siteId,
        });
      });

      socket.on("payment:completed", (data) => {
        socket.to(`site:${socket.siteId}`).emit("payment:completed", {
          ...data,
          userId: socket.userId,
        });
      });
    });

    res.socket.server.io = io;
  }

  return new Response("Socket.io server initialized", { status: 200 });
}
