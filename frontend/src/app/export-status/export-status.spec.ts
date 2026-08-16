import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportStatus } from './export-status';

describe('ExportStatus', () => {
  let component: ExportStatus;
  let fixture: ComponentFixture<ExportStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
