import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IRoomUser } from '../interfaces/user';

@Component({
  selector: 'app-race-animation',
  templateUrl: './race-animation.component.html',
  styleUrls: ['./race-animation.component.css'],
})
export class RaceAnimationComponent implements OnInit {
  @Input() userProgress: number = 0;
  @Input() roomUser: IRoomUser | undefined;

  @ViewChild('myCharacter') myCharacterRef!: ElementRef;

  ngOnInit(): void {
    setInterval(() => {
      this.updateCharacterAnimation();
    }, 1000);
  }

  updateCharacterAnimation() {
    const characterElement = this.myCharacterRef.nativeElement;
    characterElement.style.left = Math.round(this.userProgress) + '%';
  }
}
