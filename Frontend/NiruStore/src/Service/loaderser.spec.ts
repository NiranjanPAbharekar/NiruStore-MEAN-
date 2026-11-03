import { TestBed } from '@angular/core/testing';
import { LoaderSer } from './loaderser';

describe('LoaderSer', () => {
  let service: LoaderSer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderSer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});