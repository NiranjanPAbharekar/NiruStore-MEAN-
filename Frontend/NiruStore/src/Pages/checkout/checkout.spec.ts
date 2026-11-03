import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Checkuout } from './checkout';

describe('Checkuout', () => {
  let component: Checkuout;
  let fixture: ComponentFixture<Checkuout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkuout],
    }).compileComponents();

    fixture = TestBed.createComponent(Checkuout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
