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
  totalWpm!: number;
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
      this.calculateTotalWPM();
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

  calculateTotalWPM() {
    const minutesElapsed = (this.endTime - this.startTime) / 60000;
    this.totalWpm = Math.round(this.words.length / minutesElapsed);
  }

  calculateRealTimeWPM() {
    const minutesElapsed = (Date.now() - this.startTime) / 60000;
    this.realTimeWpm = Math.round((this.currentIndex + 1) / minutesElapsed);
  }

  calculateTotalAccuracy() {
    const totalEntries = this.totalCorrectChars + this.errors;
    this.totalAccuracy = (this.totalCorrectChars / totalEntries) * 100;
  }

  ngOnDestroy() {
    this.stopRealTimeWPMTimer();
  }
}
