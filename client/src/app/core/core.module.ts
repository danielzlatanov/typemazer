import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [NavComponent, HomeComponent],
  imports: [CommonModule],
  exports: [NavComponent],
})
export class CoreModule {}
