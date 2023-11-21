import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeRoutingModule } from './type-routing.module';
import { PracticeComponent } from './practice/practice.component';

@NgModule({
  declarations: [PracticeComponent],
  imports: [CommonModule, TypeRoutingModule],
})
export class TypeModule {}
