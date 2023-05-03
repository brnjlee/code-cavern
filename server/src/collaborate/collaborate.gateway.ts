import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { URLSearchParams } from 'url';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { HocusPocusService } from './hocuspocus.service';

@WebSocketGateway({ path: '/collaborate/' })
export class CollaborateGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private hocuspocus: HocusPocusService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}
  @WebSocketServer() server;
  users: number = 0;

  async handleConnection(socket, req) {
    const params = Object.fromEntries(
      new URLSearchParams(
        new URL(`http:localhost:${process.env.PORT}${req.url}`).search,
      ).entries(),
    );
    const decoded = await this.authService.validateJWT(req);
    if (!decoded) throw new WsException('Invalid token.');
    // UPDATE TO SPACEMEMBERS
    const user = await this.prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });
    console.log(user);
    if (!user) throw new WsException('Invalid credentials.');
    this.users++;
    // Notify connected clients of current users
    this.server.emit('users', this.users);
    const context = {
      user: {
        id: 1,
        name: 'TEST',
      },
    };
    this.hocuspocus.handleConnection(socket, req, params.id, context);
  }

  async handleDisconnect() {
    // A client has disconnected
    this.users--;
    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }
  // @SubscribeMessage('chat')
  // async onChat(client, message) {
  //   client.broadcast.emit('chat', message);
  // }
}
