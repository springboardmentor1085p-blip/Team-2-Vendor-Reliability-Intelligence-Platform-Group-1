import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderTracking } from './purchase-order-tracking';

describe('PurchaseOrderTracking', () => {
  let component: PurchaseOrderTracking;
  let fixture: ComponentFixture<PurchaseOrderTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
