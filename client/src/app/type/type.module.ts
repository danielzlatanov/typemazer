import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeRoutingModule } from './type-routing.module';
import { PracticeComponent } from './practice/practice.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [PracticeComponent],
  imports: [CommonModule, TypeRoutingModule, SharedModule],
})
export class TypeModule {}
