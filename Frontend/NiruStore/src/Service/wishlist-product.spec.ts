import { TestBed } from '@angular/core/testing';

import { WishlistProduct } from './wishlist-product';

describe('WishlistProduct', () => {
  let service: WishlistProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WishlistProduct);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
