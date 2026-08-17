import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReliabilityScore } from './reliability-score';

describe('ReliabilityScore', () => {
  let component: ReliabilityScore;
  let fixture: ComponentFixture<ReliabilityScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReliabilityScore],
    }).compileComponents();

    fixture = TestBed.createComponent(ReliabilityScore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
