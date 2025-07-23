import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: false,
})
export class HomeComponent {
  titleFontSize = '4rem';
  descFontSize = '1rem';

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustFontSize(event.target.innerWidth);
  }

  ngOnInit() {
    this.adjustFontSize(window.innerWidth);
  }

  private adjustFontSize(width: number) {
    if (width >= 1280) {
      this.titleFontSize = '6rem';
      this.descFontSize = '1.1rem';
    } else if (width >= 1024) {
      this.titleFontSize = '5rem';
      this.descFontSize = '1rem';
    } else if (width >= 768) {
      this.titleFontSize = '3.5rem';
      this.descFontSize = '1.1rem';
    } else {
      this.titleFontSize = '3rem';
      this.descFontSize = '1rem';
    }
  }
}
