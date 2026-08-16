import { TestBed } from '@angular/core/testing';

import { VendorAnalytics } from './vendor-analytics';

describe('VendorAnalytics', () => {
  let service: VendorAnalytics;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorAnalytics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
