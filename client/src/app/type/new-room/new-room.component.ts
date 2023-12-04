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
}
