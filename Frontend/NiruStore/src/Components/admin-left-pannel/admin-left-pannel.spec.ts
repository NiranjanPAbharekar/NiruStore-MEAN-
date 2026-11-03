import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLeftPannel } from './admin-left-pannel';

describe('AdminLeftPannel', () => {
  let component: AdminLeftPannel;
  let fixture: ComponentFixture<AdminLeftPannel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLeftPannel],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLeftPannel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
