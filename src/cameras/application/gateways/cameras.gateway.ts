import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { join } from 'path';
import { promises as fs } from 'fs';
import { createCanvas, loadImage } from 'canvas';
import { RecognitionService } from 'src/recognition/application/services/recognition.service';

@WebSocketGateway()
export class CamerasGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly recognitionService: RecognitionService,
    //private readonly notificationsService: NotificationsService,
  ) {}

  afterInit(server: Server) {
    console.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  //@SubscribeMessage('frame')
  // async handleFrame(client: Socket, payload: Buffer) {
  //   const framePath = join(__dirname, 'frame.jpg');
  //   await fs.writeFile(framePath, payload);

  //   const image = await loadImage(framePath);
  //   const canvas = createCanvas(image.width, image.height);
  //   const ctx = canvas.getContext('2d');
  //   ctx.drawImage(image, 0, 0, image.width, image.height);
  //   const predictions = await this.recognitionService.recognizeFace(
  //     canvas.toBuffer(),
  //   );

  //   const label = predictions?.label || 'unknown';
  //   client.emit('recognition', { label });

  //   if (label === 'unknown') {
  //     console.log('Unknown face detected!');
  //     //   await this.notificationsService.sendNotification(
  //     //     'Unknown face detected!',
  //     //   );
  //   }

  //   await fs.unlink(framePath);
  // }
}
