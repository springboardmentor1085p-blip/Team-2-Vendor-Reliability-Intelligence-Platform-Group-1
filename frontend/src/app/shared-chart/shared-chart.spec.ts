import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedChart } from './shared-chart';

describe('SharedChart', () => {
  let component: SharedChart;
  let fixture: ComponentFixture<SharedChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedChart],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
