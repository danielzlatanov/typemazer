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
  userInput = '';
}
