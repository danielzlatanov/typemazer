import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RaceAnimationComponent } from '../race-animation/race-animation.component';
import { IRoomUser } from '../interfaces/user';

@Component({
  selector: 'app-typing',
  templateUrl: './typing.component.html',
  styleUrls: ['./typing.component.css'],
})
export class TypingComponent implements OnInit, OnDestroy {
  dummyText: string =
    "This is some dummy text I've typed just now. Type it as fast as possible.";
  // dummyText: string =
  //   "The gods may throw a dice, their minds as cold as ice. And someone way down here loses someone dear. The winner takes it all, the loser has to fall. It's simple and it's plain, why should I complain?";

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

  @Input() countdownDuration: number = 0;
  @Input() waitingMode: boolean = false;
  @Input() roomUsers: IRoomUser[] = [];
  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild(RaceAnimationComponent)
  raceAnimationComponent!: RaceAnimationComponent;

  ngOnInit(): void {
    if (!this.waitingMode) {
      this.startCountdown();
    }
  }

  startCountdown() {
    const countdownInterval = setInterval(() => {
      this.countdownDuration--;

      if (this.countdownDuration <= 0) {
        clearInterval(countdownInterval);
        this.userInput = '';
        if (!this.startTime) {
          this.startTime = Date.now();
          console.log('race has started');
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

      this.raceAnimationComponent.updateCharacterAnimation();
    } else {
      this.raceAnimationComponent.updateCharacterAnimation();
      this.textInput.nativeElement.setAttribute('disabled', 'true');

      this.endTime = Date.now();
      this.totalElapsedTime = this.calculateElapsedTime();
      this.calculateGrossWPM(this.totalElapsedTime);
      this.calculateNetWPM(this.totalElapsedTime);
      this.calculateTotalAccuracy();
      this.stopRealTimeWPMTimer();

      console.log('practice completed');
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
    this.netWpm = this.calculateWPM(this.totalCorrectChars, elapsedTime);
  }

  calculateRealTimeWPM() {
    const elapsedTime = this.calculateElapsedTime(true);
    this.realTimeWpm = this.calculateWPM(this.totalCorrectChars, elapsedTime);
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
  }
}
