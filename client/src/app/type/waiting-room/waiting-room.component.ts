import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IRoomUser } from 'src/app/shared/interfaces/user';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css'],
})
export class WaitingRoomComponent {
  roomId: string | null;
  roomUsers: IRoomUser[] = [];

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService
  ) {
    this.roomId = this.route.snapshot.paramMap.get('roomId');

    if (this.roomId) {
      this.socketService.connect();
      this.socketService.joinRoom(this.roomId);
      this.subscribeToUpdatedUsers();
    }
  }

  private subscribeToUpdatedUsers() {
    this.socketService.onUpdateUsers().subscribe((updatedUsers) => {
      console.log('updated users: ', updatedUsers);
      this.roomUsers = updatedUsers;
    });
  }
}
