import { Component, inject, signal } from '@angular/core';

import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { LoaderSer } from '../Service/loaderser';
import { Loader } from '../Pages/loader/loader';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    Loader
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('NiruStore');

  public loaderService = inject(LoaderSer);

  private router = inject(Router);

  constructor() {

    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {
        this.loaderService.startNavigation();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loaderService.finishNavigation();
      }

    });

  }
}