import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BagPage } from './bag-page';

describe('BagPage', () => {
  let component: BagPage;
  let fixture: ComponentFixture<BagPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BagPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BagPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
