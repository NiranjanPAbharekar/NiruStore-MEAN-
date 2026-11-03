import { TestBed } from '@angular/core/testing';

import { CartProduct } from './cart-product';

describe('CartProduct', () => {
  let service: CartProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartProduct);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
