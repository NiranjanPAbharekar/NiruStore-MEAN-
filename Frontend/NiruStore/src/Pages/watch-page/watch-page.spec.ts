import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchPage } from './watch-page';

describe('WatchPage', () => {
  let component: WatchPage;
  let fixture: ComponentFixture<WatchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchPage],
    }).compileComponents();

    fixture = TestBed.createComponent(WatchPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
