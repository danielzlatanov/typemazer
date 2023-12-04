import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IRoomUser } from 'src/app/shared/interfaces/user';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css'],
})
export class WaitingRoomComponent {
  roomId: string | null;
  username!: string;
  roomUsers: IRoomUser[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {
    this.roomId = this.route.snapshot.paramMap.get('roomId');

    const navigationState = this.router.getCurrentNavigation()?.extras.state;
    if (navigationState) {
      this.username = navigationState['username'];
    }

    if (this.roomId && this.username) {
      this.socketService.connect();

      this.socketService.joinRoom(this.roomId, this.username);
      this.subscribeToUpdatedUsers();
    } else {
      this.router.navigate(['/type/new-room']);
    }
  }

  private subscribeToUpdatedUsers() {
    this.socketService.onUpdateUsers().subscribe((updatedUsers) => {
      this.roomUsers = updatedUsers;
      console.log('updated users: ', updatedUsers);
    });
  }
}
