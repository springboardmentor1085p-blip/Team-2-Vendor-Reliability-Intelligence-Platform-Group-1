import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { VendorListItem, VendorStatus } from '../../models/vendor.model';

export interface DialogData {
  vendor: VendorListItem;
  action: VendorStatus;
}

@Component({
  selector: 'app-status-action-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
  ],
  template: `
    <div class="dialog-header" [ngClass]="data.action">
      <mat-icon class="dialog-icon">{{ iconFor(data.action) }}</mat-icon>
      <h2 mat-dialog-title class="mb-0">{{ titleFor(data.action) }}</h2>
    </div>

    <mat-dialog-content class="mt-3">
      <p class="mb-1">
        You are about to <strong>{{ data.action }}</strong> the following vendor:
      </p>
      <div class="vendor-summary mb-3">
        <div class="fw-semibold">{{ data.vendor.company_name }}</div>
        <div class="text-muted small">{{ data.vendor.email }}</div>
        <div class="text-muted small">{{ formatCategory(data.vendor.category) }}</div>
      </div>

      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Remarks / Reason (optional)</mat-label>
        <textarea matInput [formControl]="remarksCtrl" rows="3"
                  placeholder="Add a note for this decision…"></textarea>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-3 pe-3">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button [color]="colorFor(data.action)" (click)="confirm()">
        <mat-icon>{{ iconFor(data.action) }}</mat-icon>
        Confirm {{ data.action | titlecase }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 24px 12px; border-bottom: 3px solid transparent;
    }
    .dialog-header.approved { border-color: #198754; }
    .dialog-header.rejected { border-color: #dc3545; }
    .dialog-header.suspended{ border-color: #fd7e14; }
    .dialog-icon { font-size: 28px; width: 28px; height: 28px; }
    .approved .dialog-icon { color: #198754; }
    .rejected  .dialog-icon { color: #dc3545; }
    .suspended .dialog-icon { color: #fd7e14; }
    .vendor-summary {
      background: #f8f9fa; border-radius: 8px; padding: 12px 16px;
      border-left: 4px solid #3f51b5;
    }
  `]
})
export class StatusActionDialogComponent {
  remarksCtrl: FormControl;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StatusActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.remarksCtrl = this.fb.control('');
  }

  confirm(): void {
    this.dialogRef.close(this.remarksCtrl.value ?? '');
  }

  iconFor(action: VendorStatus): string {
    const map: Record<VendorStatus, string> = {
      approved: 'check_circle', rejected: 'cancel',
      suspended: 'block', pending: 'hourglass_empty'
    };
    return map[action] ?? 'info';
  }

  titleFor(action: VendorStatus): string {
    const map: Record<VendorStatus, string> = {
      approved: 'Approve Vendor', rejected: 'Reject Vendor',
      suspended: 'Suspend Vendor', pending: 'Pending'
    };
    return map[action] ?? '';
  }

  colorFor(action: VendorStatus): string {
    const map: Record<VendorStatus, string> = {
      approved: 'primary', rejected: 'warn',
      suspended: 'accent', pending: ''
    };
    return map[action] ?? 'primary';
  }

  formatCategory(cat: string): string {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
