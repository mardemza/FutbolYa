import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { NotificationNewEvent } from './notification.types';

type JwtPayload = {
  sub: string;
  email: string;
};

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const room = this.userRoom(payload.sub);
      await client.join(room);
      client.data.userId = payload.sub;
    } catch {
      this.logger.warn(`Rejected WS connection: invalid token (${client.id})`);
      client.disconnect(true);
    }
  }

  emitToUser(userId: string, event: NotificationNewEvent): void {
    this.server.to(this.userRoom(userId)).emit('notification:new', event);
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
