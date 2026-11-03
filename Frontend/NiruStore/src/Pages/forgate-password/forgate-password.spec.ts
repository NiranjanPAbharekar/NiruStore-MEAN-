import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgatePassword } from './forgate-password';

describe('ForgatePassword', () => {
  let component: ForgatePassword;
  let fixture: ComponentFixture<ForgatePassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgatePassword],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgatePassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
