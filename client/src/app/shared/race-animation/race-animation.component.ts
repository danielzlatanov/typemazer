import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-race-animation',
  templateUrl: './race-animation.component.html',
  styleUrls: ['./race-animation.component.css'],
})
export class RaceAnimationComponent {
  @Input() wordProgress: number = 0;
}
