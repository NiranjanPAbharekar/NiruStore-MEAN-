import { TestBed } from '@angular/core/testing';

import { AdminLogins } from './admin-logins';

describe('AdminLogin', () => {
  let service: AdminLogins;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminLogins);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
