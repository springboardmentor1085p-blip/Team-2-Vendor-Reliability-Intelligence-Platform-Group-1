import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingVendors } from './pending-vendors';

describe('PendingVendors', () => {
  let component: PendingVendors;
  let fixture: ComponentFixture<PendingVendors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingVendors],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingVendors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
