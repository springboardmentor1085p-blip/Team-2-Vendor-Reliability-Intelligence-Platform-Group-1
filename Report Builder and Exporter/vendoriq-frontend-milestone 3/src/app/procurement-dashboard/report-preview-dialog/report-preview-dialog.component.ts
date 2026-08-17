import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule }      from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule }        from '@angular/material/icon';
import { MatTableModule }       from '@angular/material/table';

import { ReportPreview, ReportPreviewRow } from '../po.service';

export interface ReportPreviewDialogData {
  preview:      ReportPreview;
  exportFormat: string;
}

@Component({
  selector: 'app-report-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './report-preview-dialog.component.html',
  styleUrls:   ['./report-preview-dialog.component.css'],
})
export class ReportPreviewDialogComponent {

  readonly displayedColumns = ['po_number', 'vendor_id', 'status', 'order_date', 'total_amount'];

  get preview():      ReportPreview      { return this.data.preview; }
  get exportFormat(): string             { return this.data.exportFormat; }
  get sampleRows():   ReportPreviewRow[] { return this.data.preview.sample_rows; }

  constructor(
    private dialogRef: MatDialogRef<ReportPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReportPreviewDialogData,
  ) {}

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirmExport(): void {
    window.open(
      `http://localhost:8000/reports/purchase-orders?format=${this.exportFormat}`,
      '_blank'
    );
    this.dialogRef.close(true);
  }
}
