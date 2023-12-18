import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypingComponent } from './typing/typing.component';
import { FormsModule } from '@angular/forms';
import { RaceAnimationComponent } from './race-animation/race-animation.component';

@NgModule({
  declarations: [TypingComponent, RaceAnimationComponent],
  imports: [CommonModule, FormsModule],
  exports: [TypingComponent, RaceAnimationComponent],
})
export class SharedModule {}
