import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IRoomUser } from '../interfaces/user';
import { UserStats } from '../models/userStats';
import { SocketService } from '../services/socket.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-typing',
  templateUrl: './typing.component.html',
  styleUrls: ['./typing.component.css'],
})
export class TypingComponent implements OnInit, OnDestroy, OnChanges {
  dummyText: string = "Some dummy text I've typed just now.";

  words: string[] = this.dummyText.split(/\s+/);

  userInput = '';
  currentIndex = 0;
  totalCorrectChars = 0;
  errors = 0;

  totalAccuracy!: number;
  startTime!: number;
  endTime!: number;
  totalElapsedTime!: number;
  grossWpm!: number;
  netWpm!: number;
  realTimeWpm!: number;
  private realTimeWPMTimer: any;
  private intervalSubscription: any;

  constructor(private socketService: SocketService) {}

  @Input() countdown!: number;
  @Input() practiceCountdown!: number;
  @Input() waitingMode: boolean = false;
  @Input() roomUsers: IRoomUser[] = [];
  @Input() roomId: string | null = null;
  @ViewChild('textInput') textInput!: ElementRef;

  userStats: UserStats = new UserStats();

  ngOnInit(): void {
    if (this.practiceCountdown) {
      this.startPracticeCountdown();
      this.countdown = this.practiceCountdown;
    }

    this.sendUserStatsUpdate();
    this.intervalSubscription = interval(2000).subscribe(() => {
      this.sendUserStatsUpdate();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('waitingMode' in changes) {
      this.callStartRace();
    }
  }

  private callStartRace() {
    if (!this.waitingMode) {
      this.startRace();
    }
  }

  startRace() {
    if (!this.startTime) {
      this.startTime = Date.now();
    }

    if (!this.realTimeWPMTimer) {
      this.startRealTimeWPMTimer();
    }

    this.enableInputField();
  }

  startPracticeCountdown() {
    const practiceCountdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(practiceCountdownInterval);
        this.userInput = '';
        if (!this.startTime) {
          this.startTime = Date.now();
          console.log('practice has started');
        }
        if (!this.realTimeWPMTimer) {
          this.startRealTimeWPMTimer();
        }
        this.enableInputField();
      }
    }, 1000);
  }

  enableInputField() {
    if (this.textInput) {
      this.textInput.nativeElement.removeAttribute('disabled');
      this.textInput.nativeElement.focus();
    }
  }

  startRealTimeWPMTimer() {
    this.realTimeWPMTimer = setInterval(() => {
      this.calculateRealTimeWPM();
    }, 2000);
  }

  stopRealTimeWPMTimer() {
    clearInterval(this.realTimeWPMTimer);
    this.realTimeWPMTimer = null;
  }

  onInputChange() {
    const currentWord = this.words[this.currentIndex] + ' ';
    const lastWord = this.words[this.words.length - 1];
    const isLastWord = this.currentIndex === this.words.length - 1;

    if (
      this.userInput === currentWord ||
      (isLastWord && this.userInput === lastWord)
    ) {
      this.totalCorrectChars += currentWord.length;
      if (isLastWord) {
        this.totalCorrectChars--;
      }

      this.moveToNextWord();
      this.userStats.realTimeWordProgress = this.getWordProgress();
      this.calculateRealTimeWPM();
    } else if (
      this.currentIndex <= this.words.length - 1 &&
      this.userInput &&
      this.userInput !==
        this.words[this.currentIndex].slice(0, this.userInput.length)
    ) {
      this.errors++;
    }
  }

  moveToNextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.userInput = '';
    } else {
      this.textInput.nativeElement.setAttribute('disabled', 'true');

      this.endTime = Date.now();
      this.totalElapsedTime = this.calculateElapsedTime();
      this.calculateGrossWPM(this.totalElapsedTime);
      this.calculateNetWPM(this.totalElapsedTime);
      this.calculateTotalAccuracy();
      this.stopRealTimeWPMTimer();

      this.userStats.hasFinished = true;
      this.sendUserStatsUpdate();
      // console.log('User has finished:', this.userStats.hasFinished);
    }
  }

  sendUserStatsUpdate() {
    if (this.roomId) {
      this.socketService.sendUserStatsUpdate(this.roomId, this.userStats);
    }
  }

  onSpaceKey(event: Event) {
    if (this.userInput == '') {
      event.preventDefault();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
  }

  calculateGrossWPM(elapsedTime: number) {
    const allTypedEntries = this.totalCorrectChars + this.errors;
    this.grossWpm = this.calculateWPM(allTypedEntries, elapsedTime);
  }

  calculateNetWPM(elapsedTime: number) {
    this.userStats.netWpm = this.calculateWPM(
      this.totalCorrectChars,
      elapsedTime
    );
    this.netWpm = this.calculateWPM(this.totalCorrectChars, elapsedTime);
  }

  calculateRealTimeWPM() {
    const elapsedTime = this.calculateElapsedTime(true);
    this.realTimeWpm = this.calculateWPM(this.totalCorrectChars, elapsedTime);
    this.userStats.realTimeWpm = this.calculateWPM(
      this.totalCorrectChars,
      elapsedTime
    );
  }

  calculateTotalAccuracy() {
    const allTypedEntries = this.totalCorrectChars + this.errors;
    this.totalAccuracy = (this.totalCorrectChars / allTypedEntries) * 100;
  }

  calculateWPM(totalChars: number, elapsedTime: number): number {
    return Math.round(totalChars / 5 / elapsedTime);
  }

  calculateElapsedTime(useCurrentTime: boolean = false): number {
    const currentTime = useCurrentTime ? Date.now() : this.endTime;
    return (currentTime - this.startTime) / 60000;
  }

  formatElapsedTime(elapsedTime: number): string {
    const minutes = Math.floor(elapsedTime);
    const seconds = Math.round((elapsedTime - minutes) * 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${formattedSeconds}`;
  }

  getWordProgress(): number {
    const baseProgress = (this.currentIndex / this.words.length) * 100;

    const isLastWordCompleted =
      this.currentIndex === this.words.length - 1 &&
      this.userInput === this.words[this.currentIndex];

    return isLastWordCompleted ? 100 : Math.round(baseProgress);
  }

  ngOnDestroy() {
    this.stopRealTimeWPMTimer();
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
