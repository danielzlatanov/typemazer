import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
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
