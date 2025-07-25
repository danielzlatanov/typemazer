import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import { IRoomUserStats } from 'src/app/shared/interfaces/roomUserStats';
import { IRoomUser } from 'src/app/shared/interfaces/user';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-live-room',
  templateUrl: './live-room.component.html',
  styleUrls: ['./live-room.component.css'],
  standalone: false,
})
export class LiveRoomComponent implements OnInit, OnDestroy {
  roomId: string | null;
  username!: string;
  roomUsers: IRoomUser[] = [];
  countdown!: number;
  totalRaceTime!: number;
  waitingMode: boolean = true;
  roomUserStats!: IRoomUserStats;
  raceText: string = '';

  private unsubscriber: Subject<void> = new Subject<void>();
  private isCountdownFinished: boolean = false;

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
      this.socketService.joinRoom(this.roomId, this.username);
      this.subscribeToUpdatedUsers();
    } else {
      this.router.navigate(['/type/room']);
    }
  }

  ngOnInit(): void {
    this.socketService
      .onJoinRejected()
      .subscribe((data: { reason: string }) => {
        if (data.reason === 'countdown-finished') {
          console.log('User rejected to join due to countdown finished');
          this.isCountdownFinished = true;
          this.router.navigate(['/type/room']);
        }
      });

    history.pushState(null, '');

    fromEvent(window, 'popstate')
      .pipe(takeUntil(this.unsubscriber))
      .subscribe(() => {
        history.pushState(null, '');
      });

    this.socketService.onRaceText().subscribe((text: string) => {
      this.raceText = text;
    });

    this.socketService.onCountdownTimerStarted().subscribe(() => {
      console.log('Countdown timer started');
    });

    this.socketService.onCountdownUpdate().subscribe((countdown: number) => {
      this.countdown = countdown;
    });

    this.socketService.onCountdownTimerFinished().subscribe(() => {
      console.log('Countdown timer finished');
      this.waitingMode = false;
    });

    this.socketService
      .onUpdateTotalRaceTime()
      .subscribe((totalRaceTime: number) => {
        this.totalRaceTime = totalRaceTime;
      });

    this.socketService.onRaceTimeFinished().subscribe(() => {
      console.log('Race finished due to `race-time`');
      if (this.totalRaceTime <= 0) {
        this.router.navigate(['/type/room']); //! to be changed
      }
    });

    this.socketService
      .onUserStatsUpdate()
      .subscribe((updatedUserStats: IRoomUserStats) => {
        const { countdownTimerActive, ...userStatsWithoutTimer } =
          updatedUserStats;
        this.roomUserStats = userStatsWithoutTimer;
        // console.log('room user stats updated', this.roomUserStats);
      });

    this.socketService.onUserFinished().subscribe((data) => {
      const { userId, place } = data;
      const userIndex = this.roomUsers.findIndex((user) => user.id === userId);

      if (userIndex !== -1) {
        this.roomUsers[userIndex].place = place;
      }
    });
  }

  isLiveRoomVisible(): boolean {
    return !this.isCountdownFinished && this.roomUsers.length > 0;
  }

  getPlaceSuffix(place: number): string {
    const lastDigit = place % 10;
    const secondLastDigit = Math.floor((place % 100) / 10);

    if (lastDigit === 1 && secondLastDigit !== 1) {
      return 'st';
    } else if (lastDigit === 2 && secondLastDigit !== 1) {
      return 'nd';
    } else if (lastDigit === 3 && secondLastDigit !== 1) {
      return 'rd';
    } else {
      return 'th';
    }
  }

  getUserStatsValue(userId: string, property: string): number {
    return this.roomUserStats && this.roomUserStats[userId]
      ? this.roomUserStats[userId][property]
      : 0;
  }

  private subscribeToUpdatedUsers() {
    this.socketService.onUpdateUsers().subscribe((updatedUsers) => {
      this.roomUsers = this.sortUsers(updatedUsers, this.username);
      console.log('updated users: ', updatedUsers);
    });
  }

  private sortUsers(users: IRoomUser[], currentUsername: string): IRoomUser[] {
    const currentUserIndex = users.findIndex(
      (user) => user.username === currentUsername
    );

    if (currentUserIndex !== -1) {
      const currentUser = users.splice(currentUserIndex, 1)[0];
      users.unshift(currentUser);
    }

    return users;
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }
}
