import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [NavComponent, HomeComponent],
  imports: [CommonModule, RouterModule],
  exports: [NavComponent],
})
export class CoreModule {}
