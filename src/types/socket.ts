import { Socket as SocketIOSocket } from "socket.io";
import { DefaultEventsMap } from "socket.io";

// Socket.io type augmentation
declare module "socket.io" {
  interface Socket {
    userId?: string;
    siteId?: string;
    role?: string;
  }
}

export interface ExtendedSocket
  extends SocketIOSocket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  > {
  userId: string;
  siteId: string;
  role: string;
}
