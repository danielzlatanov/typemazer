import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import { IRoomUser } from 'src/app/shared/interfaces/user';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomId: string | null;
  username!: string;
  roomUsers: IRoomUser[] = [];

  private unsubscriber: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    history.pushState(null, '');

    fromEvent(window, 'popstate')
      .pipe(takeUntil(this.unsubscriber))
      .subscribe(() => {
        history.pushState(null, '');
      });
  }

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

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }
}
