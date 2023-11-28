import { Component } from '@angular/core';
import { SocketService } from 'src/app/shared/services/socket.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css'],
})
export class CreateRoomComponent {
  roomId!: string;
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
        this.socketService.joinRoom(data.roomId);
      });
  }

  joinRoom(inputRoomId: string) {
    this.socketService.joinRoom(inputRoomId);
  }
}
