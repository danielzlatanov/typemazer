import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-race-animation',
  templateUrl: './race-animation.component.html',
  styleUrls: ['./race-animation.component.css'],
})
export class RaceAnimationComponent {
  @Input() wordProgress: number = 0;
  @ViewChild('myAnimation', { static: true }) characterElementRef!: ElementRef;

  updateCharacterAnimation() {
    const characterElement = this.characterElementRef.nativeElement;
    characterElement.style.left = Math.round(this.wordProgress) + '%';
  }
}
