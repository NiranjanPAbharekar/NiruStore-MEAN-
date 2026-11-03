import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-admin-left-pannel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-left-pannel.html',
  styleUrl: './admin-left-pannel.css',
})
export class AdminLeftPannel {

  // Receive sidebar state from parent
  @Input() sidebarOpen = false;

  // Send selected menu to parent
  @Output() menuSelected = new EventEmitter<string>();

  // Send logout event to parent
  @Output() logoutClicked = new EventEmitter<void>();

  activeMenu = 'Dashboard';


  // ============================================
  // MENU CLICK
  // ============================================



openSidebar(): void {
  this.sidebarOpen = true;
}

closeSidebar(): void {
  this.sidebarOpen = false;
}

setActiveMenu(menu: string): void {
  this.activeMenu = menu;
  this.sidebarOpen = false;
}

logout(): void {
  localStorage.removeItem('user');
  console.log('Admin logged out');
}

}