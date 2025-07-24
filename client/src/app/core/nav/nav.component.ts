import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  animations: [
    trigger('dropdownAnim', [
      transition(':enter', [
        style({
          opacity: 0,
          clipPath: 'inset(0 0 100% 0)',
        }),
        animate(
          '200ms ease-out',
          style({
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({
            opacity: 0,
            clipPath: 'inset(0 0 100% 0)',
          })
        ),
      ]),
    ]),
  ],
  standalone: false,
})
export class NavComponent {
  isDropdownOpen = false;

  @ViewChild('dropdownBtn') dropdownBtn!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedInsideButton = this.dropdownBtn?.nativeElement.contains(
      event.target
    );
    const clickedInsideMenu = this.dropdownMenu?.nativeElement.contains(
      event.target
    );

    if (!clickedInsideButton && !clickedInsideMenu) {
      this.isDropdownOpen = false;
    }
  }
}
