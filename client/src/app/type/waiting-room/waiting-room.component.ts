import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css'],
})
export class WaitingRoomComponent {
  roomId: string | null;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService
  ) {
    this.roomId = this.route.snapshot.paramMap.get('roomId');

    if (this.roomId) {
      this.socketService.joinRoom(this.roomId);
    }
  }
}
