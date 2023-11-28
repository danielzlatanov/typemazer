import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PracticeComponent } from './practice/practice.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { WaitingRoomComponent } from './waiting-room/waiting-room.component';

const routes: Routes = [
  {
    path: 'practice',
    component: PracticeComponent,
  },
  {
    path: 'create-room',
    component: CreateRoomComponent,
  },
  {
    path: 'waiting-room/:roomId',
    component: WaitingRoomComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypeRoutingModule {}
