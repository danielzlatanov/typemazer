import { Component } from '@angular/core';
import { SocketService } from 'src/app/shared/services/socket.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.css'],
  standalone: false,
})
export class NewRoomComponent {
  roomId!: string;
  username: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private socketService: SocketService,
  ) {}

  createRoom() {
    this.http
      .post('http://localhost:8000/create-room', {})
      .subscribe((data: any) => {
        this.roomId = data.roomId;
        if (this.username) {
          this.handleRoomNavigation(this.roomId, this.username);
        } else {
          this.router.navigate(['/type/room']);
        }
      });
  }

  joinRoom(inputRoomId: string) {
    if (inputRoomId && this.username) {
      this.handleRoomNavigation(inputRoomId, this.username);
    } else {
      this.router.navigate(['/type/room']);
    }
  }

  private handleRoomNavigation(roomId: string, username: string) {
    this.socketService.connect();
    const navigationExtras = { state: { username } };
    this.router.navigate(['/type/live', roomId], navigationExtras);
  }
}
