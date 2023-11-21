import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypingComponent } from './typing/typing.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TypingComponent],
  imports: [CommonModule, FormsModule],
  exports: [TypingComponent],
})
export class SharedModule {}
