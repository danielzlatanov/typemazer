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
      if (this.socket.id) {
        console.log('Connected to the server with ID: ', this.socket.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });
  }

  joinRoom(roomId: string, username: string) {
    this.socket.emit('join-room', { roomId, username });
  }

  onUpdateUsers(): Observable<IRoomUser[]> {
    return new Observable((observer) => {
      this.socket.on('update-users', (users: IRoomUser[]) => {
        observer.next(users);
      });
    });
  }

  onCountdownTimerStarted(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('countdown-timer-started', () => {
        observer.next();
      });
    });
  }

  onCountdownUpdate(): Observable<number> {
    return new Observable((observer) => {
      this.socket.on('countdown-update', (countdown: number) => {
        observer.next(countdown);
      });
    });
  }

  onCountdownTimerFinished(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('countdown-timer-finished', () => {
        observer.next();
      });
    });
  }
}
