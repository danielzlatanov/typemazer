import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PracticeComponent } from './practice/practice.component';
import { NewRoomComponent } from './new-room/new-room.component';
import { LiveRoomComponent } from './live-room/live-room.component';

const routes: Routes = [
  {
    path: 'practice',
    component: PracticeComponent,
  },
  {
    path: 'room',
    component: NewRoomComponent,
  },
  {
    path: 'live/:roomId',
    component: LiveRoomComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypeRoutingModule {}
