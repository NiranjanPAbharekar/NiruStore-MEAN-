import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderSer {

  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();

  private navigationLoading = false;
  private pageLoading = false;
  private pendingImages = 0;

  startNavigation(): void {
    this.navigationLoading = true;
    this.updateLoader();
  }

  finishNavigation(): void {
    this.navigationLoading = false;
    this.updateLoader();
  }

  startPage(): void {
    this.pageLoading = true;
    this.updateLoader();
  }

  finishPage(): void {
    this.pageLoading = false;
    this.updateLoader();
  }

  startImages(count: number): void {
    this.pendingImages = Math.max(0, count);
    this.updateLoader();
  }

  imageLoaded(): void {
    if (this.pendingImages > 0) {
      this.pendingImages--;
    }

    this.updateLoader();
  }

  private updateLoader(): void {
    const shouldShow =
      this.navigationLoading ||
      this.pageLoading ||
      this.pendingImages > 0;

    this.loadingSubject.next(shouldShow);
  }
}