import {
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class FaceRecognitionGateway {
  @WebSocketServer()
  server: Server;

  sendDetectionResult(result: any) {
    this.server.emit('detectionResult', result);
  }
}
