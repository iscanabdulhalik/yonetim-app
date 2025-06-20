import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Socket events interface
export interface SocketEvents {
  "announcement:read": (data: {
    announcementId: string;
    userId: string;
  }) => void;
  "announcement:new": (data: any) => void;
  "complaint:new": (data: any) => void;
  "complaint:updated": (data: any) => void;
  "payment:completed": (data: any) => void;
  "payment:reminder": (data: any) => void;
  "notification:new": (data: any) => void;
}
