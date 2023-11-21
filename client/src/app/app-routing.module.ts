import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'type',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'type',
    loadChildren: () => import('./type/type.module').then((m) => m.TypeModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
