import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { IRoomUser } from '../interfaces/user';

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

  onUpdateUsers(): Observable<IRoomUser[]> {
    return new Observable((observer) => {
      this.socket.on('update-users', (users: IRoomUser[]) => {
        observer.next(users);
      });
    });
  }
}
