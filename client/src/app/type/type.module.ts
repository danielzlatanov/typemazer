import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeRoutingModule } from './type-routing.module';
import { PracticeComponent } from './practice/practice.component';
import { SharedModule } from '../shared/shared.module';
import { CreateRoomComponent } from './create-room/create-room.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PracticeComponent, CreateRoomComponent],
  imports: [
    CommonModule,
    TypeRoutingModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
  ],
})
export class TypeModule {}
