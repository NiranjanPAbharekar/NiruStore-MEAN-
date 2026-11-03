import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTopBar } from './admin-top-bar';

describe('AdminTopBar', () => {
  let component: AdminTopBar;
  let fixture: ComponentFixture<AdminTopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTopBar],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTopBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
