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
  onInputChange() {
    if (!this.startTime) {
      this.startTime = Date.now();
      console.log('race has started:');
      console.log('start time: ', this.startTime);
    }

    const currentWord = this.words[this.currentIndex] + ' ';
    const lastWord = this.words[this.words.length - 1];

    if (
      this.userInput === currentWord ||
      (currentWord.trim() === lastWord && this.userInput === lastWord)
    ) {
      this.moveToNextWord();
    }
  }

  moveToNextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.userInput = '';
    } else {
      this.endTime = Date.now();
      this.calculateTotalWPM();

      console.log('Practice completed:');
      console.log(`your WPM: ${this.totalWpm}`);
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
}
