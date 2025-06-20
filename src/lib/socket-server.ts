import { Server } from "socket.io";

declare global {
  var io: Server | undefined;
}

export function getSocketServer(): Server | null {
  return global.io || null;
}

export function setSocketServer(io: Server): void {
  global.io = io;
}

// Socket event emitters
export class SocketEmitter {
  private static instance: SocketEmitter;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketEmitter {
    if (!SocketEmitter.instance) {
      SocketEmitter.instance = new SocketEmitter();
    }
    return SocketEmitter.instance;
  }

  public setServer(io: Server): void {
    this.io = io;
  }

  // Emit to specific site
  public emitToSite(siteId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`site:${siteId}`).emit(event, data);
    }
  }

  // Emit to specific role
  public emitToRole(role: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`role:${role}`).emit(event, data);
    }
  }

  // Emit to specific user
  public emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Emit to all connected clients
  public emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Announcement events
  public emitNewAnnouncement(siteId: string, announcement: any): void {
    this.emitToSite(siteId, "announcement:new", announcement);
  }

  public emitAnnouncementUpdated(siteId: string, announcement: any): void {
    this.emitToSite(siteId, "announcement:updated", announcement);
  }

  // Complaint events
  public emitNewComplaint(siteId: string, complaint: any): void {
    this.emitToRole("site_admin", "complaint:new", { ...complaint, siteId });
  }

  public emitComplaintUpdated(siteId: string, complaint: any): void {
    this.emitToSite(siteId, "complaint:updated", complaint);
  }

  // Payment events
  public emitPaymentCompleted(siteId: string, payment: any): void {
    this.emitToSite(siteId, "payment:completed", payment);
  }

  public emitPaymentReminder(userId: string, payment: any): void {
    this.emitToUser(userId, "payment:reminder", payment);
  }

  // Voting events
  public emitNewVoting(siteId: string, voting: any): void {
    this.emitToSite(siteId, "voting:new", voting);
  }

  public emitVotingUpdated(siteId: string, voting: any): void {
    this.emitToSite(siteId, "voting:updated", voting);
  }

  // Notification events
  public emitNotification(userId: string, notification: any): void {
    this.emitToUser(userId, "notification:new", notification);
  }
}
