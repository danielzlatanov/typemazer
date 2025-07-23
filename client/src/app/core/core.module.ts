import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [NavComponent, HomeComponent, FooterComponent],
  imports: [CommonModule, RouterModule],
  exports: [NavComponent, FooterComponent],
})
export class CoreModule {}
