import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeRoutingModule } from './type-routing.module';
import { PracticeComponent } from './practice/practice.component';
import { SharedModule } from '../shared/shared.module';
import { NewRoomComponent } from './new-room/new-room.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LiveRoomComponent } from './live-room/live-room.component';
import { RouterModule } from '@angular/router';

@NgModule({ declarations: [PracticeComponent, NewRoomComponent, LiveRoomComponent], imports: [CommonModule,
        TypeRoutingModule,
        SharedModule,
        FormsModule,
        RouterModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class TypeModule {}
