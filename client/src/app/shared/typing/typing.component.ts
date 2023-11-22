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
    "How can I just let you walk away, just let you leave without a trace? When I stand here taking every breath with you, you're the only one who really knew me at all.";

  words: string[] = this.dummyText.split(/\s+/);

  currentIndex = 0;
  userInput = '';

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
      this.moveToNextWord();
      this.calculateRealTimeWPM();
    }
  }

  moveToNextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.userInput = '';
    } else {
      this.endTime = Date.now();
      this.calculateTotalWPM();
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

  ngOnDestroy() {
    this.stopRealTimeWPMTimer();
  }
}
