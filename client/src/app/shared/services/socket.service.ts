import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { IRoomUser } from '../interfaces/user';
import { UserStats } from '../models/userStats';
import { IRoomUserStats } from '../interfaces/roomUserStats';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any;

  constructor() {}

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io('http://localhost:8000');

      this.socket.on('connect', () => {
        console.log('Connected to the server with ID: ', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from the server');
      });
    }
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

  sendUserStatsUpdate(roomId: string, userStats: UserStats) {
    this.socket.emit('user-stats-update', { roomId, userStats });
  }

  onUserStatsUpdate(): Observable<IRoomUserStats> {
    return new Observable((observer) => {
      this.socket.on(
        'update-user-stats',
        (updatedUserStats: IRoomUserStats) => {
          observer.next(updatedUserStats);
        }
      );
    });
  }

  onJoinRejected(): Observable<{ reason: string }> {
    return new Observable((observer) => {
      this.socket.on('join-rejected', (data: { reason: string }) => {
        observer.next(data);
      });
    });
  }
}
