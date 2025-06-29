import { SocketEmitter } from "./socket-server";

export interface Notification {
  _id?: string;
  userId: string;
  siteId: string;
  type: "announcement" | "complaint" | "payment" | "voting" | "system";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  private socketEmitter: SocketEmitter;

  private constructor() {
    this.socketEmitter = SocketEmitter.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Send notification to user
  public async sendNotification(
    notification: Omit<Notification, "_id" | "createdAt" | "isRead">
  ): Promise<void> {
    try {
      // Save to database (implement your notification model)
      // const savedNotification = await NotificationModel.create({
      //   ...notification,
      //   isRead: false,
      //   createdAt: new Date()
      // });

      // Emit via socket
      this.socketEmitter.emitNotification(notification.userId, {
        ...notification,
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  // Send notification to multiple users
  public async sendBulkNotification(
    userIds: string[],
    notification: Omit<Notification, "_id" | "createdAt" | "isRead" | "userId">
  ): Promise<void> {
    const promises = userIds.map((userId) =>
      this.sendNotification({ ...notification, userId })
    );

    await Promise.all(promises);
  }

  // Send notification to all site users
  public async sendSiteNotification(
    siteId: string,
    notification: Omit<
      Notification,
      "_id" | "createdAt" | "isRead" | "userId" | "siteId"
    >
  ): Promise<void> {
    try {
      // Get all users in site (implement your user query)
      // const users = await User.find({ siteId, isActive: true });
      // const userIds = users.map(user => user._id.toString());

      // For now, emit to site room
      this.socketEmitter.emitToSite(siteId, "notification:site", {
        ...notification,
        siteId,
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to send site notification:", error);
    }
  }
}
