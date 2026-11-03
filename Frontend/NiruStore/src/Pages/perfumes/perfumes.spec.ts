import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Perfumes } from './perfumes';

describe('Perfumes', () => {
  let component: Perfumes;
  let fixture: ComponentFixture<Perfumes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Perfumes],
    }).compileComponents();

    fixture = TestBed.createComponent(Perfumes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
