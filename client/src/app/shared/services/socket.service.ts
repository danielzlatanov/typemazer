import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any;

  constructor() {}

  connect() {
    this.socket = io('http://localhost:8000');

    this.socket.on('connect', () => {
      console.log('Connected to the server with ID: ', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });
  }

  joinRoom(roomId: string) {
    this.socket.emit('join-room', roomId);
  }
}
