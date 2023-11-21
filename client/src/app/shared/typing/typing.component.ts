import { Component } from '@angular/core';

@Component({
  selector: 'app-typing',
  templateUrl: './typing.component.html',
  styleUrls: ['./typing.component.css'],
})
export class TypingComponent {
  dummyText: string =
    "This is some dummy text I've typed just now. Type it as fast as possible.";
  words: string[] = this.dummyText.split(/\s+/);

  currentIndex = 0;
  userInput = '';

  onInputChange() {
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
      alert('practice completed');
    }
  }

  onSpaceKey(event: Event) {
    if (this.userInput == '') {
      event.preventDefault();
    }
  }
}
