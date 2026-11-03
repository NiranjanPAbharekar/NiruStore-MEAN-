import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './admin-top-bar.html',
  styleUrl: './admin-top-bar.css',
})
export class AdminTopBar {

  @Output() menuClicked = new EventEmitter<void>();


  openMenu(): void {

    this.menuClicked.emit();

  }

}