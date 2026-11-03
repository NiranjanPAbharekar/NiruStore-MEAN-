import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AdminTopBar } from '../../Components/admin-top-bar/admin-top-bar';
import { AdminLeftPannel } from '../../Components/admin-left-pannel/admin-left-pannel';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    AdminTopBar,
    AdminLeftPannel
  ],

  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {

  sidebarOpen = false;

  openSidebar(): void {
    this.sidebarOpen = true;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  setActiveMenu(menu: string): void {
    console.log('Selected menu:', menu);
  }

  logout(): void {
    console.log('Logout clicked');
  }

}