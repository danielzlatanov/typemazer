import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IRoomUser } from '../interfaces/user';

@Component({
  selector: 'app-race-animation',
  templateUrl: './race-animation.component.html',
  styleUrls: ['./race-animation.component.css'],
})
export class RaceAnimationComponent {
  @Input() wordProgress: number = 0;
  @Input() roomUsers: IRoomUser[] = [];

  @ViewChild('myCharacter') myCharacterRef!: ElementRef;

  updateCharacterAnimation() {
    const characterElement = this.myCharacterRef.nativeElement;
    characterElement.style.left = Math.round(this.wordProgress) + '%';
  }
}
