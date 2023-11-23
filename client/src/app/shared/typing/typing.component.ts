import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-typing',
  templateUrl: './typing.component.html',
  styleUrls: ['./typing.component.css'],
})
export class TypingComponent implements OnDestroy {
  // dummyText: string =
  //   "This is some dummy text I've typed just now. Type it as fast as possible.";
  dummyText: string =
    "The gods may throw a dice, their minds as cold as ice. And someone way down here loses someone dear. The winner takes it all, the loser has to fall. It's simple and it's plain, why should I complain?";

  words: string[] = this.dummyText.split(/\s+/);

  userInput = '';
  currentIndex = 0;
  totalCorrectChars = 0;
  errors = 0;

  totalAccuracy!: number;
  startTime!: number;
  endTime!: number;
  grossWpm!: number;
  netWpm!: number;
  realTimeWpm!: number;
  private realTimeWPMTimer: any;

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
    if (!this.startTime) {
      this.startTime = Date.now();
      console.log('race has started');
    }

    if (!this.realTimeWPMTimer) {
      this.startRealTimeWPMTimer();
    }

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
    } else {
      this.endTime = Date.now();
      this.calculateGrossWPM();
      this.calculateNetWPM();
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

  calculateGrossWPM() {
    const allTypedEntries = this.totalCorrectChars + this.errors;
    const elapsedTime = this.calculateElapsedTime();
    this.grossWpm = this.calculateWPM(allTypedEntries, elapsedTime);
  }

  calculateNetWPM() {
    const elapsedTime = this.calculateElapsedTime();
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

  ngOnDestroy() {
    this.stopRealTimeWPMTimer();
  }
}
