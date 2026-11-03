import { TestBed } from '@angular/core/testing';

import { HomeContent } from './home-content';

describe('HomeContent', () => {
  let service: HomeContent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeContent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
