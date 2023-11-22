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
    'Therefore a man shall leave his father and mother and be joined to his wife, and they shall become one flesh.';

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
      console.log('race has started:');
    }

    if (!this.realTimeWPMTimer) {
      this.startRealTimeWPMTimer();
    }

    const currentWord = this.words[this.currentIndex] + ' ';
    const lastWord = this.words[this.words.length - 1];

    if (
      this.userInput === currentWord ||
      (currentWord.trim() === lastWord && this.userInput === lastWord)
    ) {
      this.totalCorrectChars += 1;
      if (currentWord.trim() === lastWord && this.userInput === lastWord) {
        this.totalCorrectChars -= 1;
      }

      this.moveToNextWord();
      this.calculateRealTimeWPM();
    } else if (
      this.currentIndex <= this.words.length - 1 &&
      this.userInput &&
      this.userInput ===
        this.words[this.currentIndex].slice(0, this.userInput.length)
    ) {
      this.totalCorrectChars += 1;
      console.log('correct:', this.totalCorrectChars);
    } else if (
      this.currentIndex <= this.words.length - 1 &&
      this.userInput &&
      this.userInput !==
        this.words[this.currentIndex].slice(0, this.userInput.length)
    ) {
      this.errors += 1;
      console.log('errors:', this.errors);
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

      console.log('practice completed:');
      console.log(`your WPM: ${this.totalWpm}`);
      console.log(`your real-time WPM: ${this.realTimeWpm}`);
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
