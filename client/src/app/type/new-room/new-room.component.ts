import { Component } from '@angular/core';
import { SocketService } from 'src/app/shared/services/socket.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.css'],
})
export class NewRoomComponent {
  roomId!: string;
  username: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private socketService: SocketService
  ) {}

  createRoom() {
    this.http
      .post('http://localhost:8000/create-room', {})
      .subscribe((data: any) => {
        this.roomId = data.roomId;
          this.handleRoomNavigation(this.roomId, this.username);
      });
  }

  joinRoom(inputRoomId: string) {
      this.handleRoomNavigation(inputRoomId, this.username);
  }

  private handleRoomNavigation(roomId: string, username: string) {
    this.socketService.connect();
    const navigationExtras = { state: { username } };
    this.router.navigate(['/type/waiting-room', roomId], navigationExtras);
  }
}
