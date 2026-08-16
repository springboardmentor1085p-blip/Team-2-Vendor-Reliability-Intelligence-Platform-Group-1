import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { POStatus } from '../../../models/purchase-order.model';

const TRANSITIONS: Record<POStatus, POStatus[]> = {
  Pending:    ['Approved', 'Cancelled'],
  Approved:   ['Dispatched', 'Cancelled'],
  Dispatched: ['Delivered', 'Cancelled'],
  Delivered:  ['Completed'],
  Completed:  [],
  Cancelled:  [],
};

@Component({
  selector: 'app-status-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title class="d-flex align-items-center gap-2">
      <mat-icon>swap_horiz</mat-icon> Update PO Status
    </h2>

    <mat-dialog-content>
      <p class="text-muted small mb-3">
        PO: <strong>{{ data.poNumber }}</strong> &nbsp;|&nbsp;
        Current: <span [class]="'status-badge s-' + data.currentStatus.toLowerCase()">{{ data.currentStatus }}</span>
      </p>

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>New Status *</mat-label>
          <mat-select formControlName="status">
            @for (s of allowed; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
            @if (!allowed.length) { <mat-option disabled>No transitions available</mat-option> }
          </mat-select>
          <mat-icon matPrefix>swap_horiz</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>Remarks (optional)</mat-label>
          <textarea matInput formControlName="remarks" rows="3"
            placeholder="Reason for status change…"></textarea>
          <mat-icon matPrefix>comment</mat-icon>
        </mat-form-field>

        @if (form.get('status')?.value === 'Dispatched') {
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Tracking Number</mat-label>
            <input matInput formControlName="tracking_number" placeholder="e.g. TRK-123456" />
            <mat-icon matPrefix>local_shipping</mat-icon>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
        [disabled]="!form.get('status')?.value || !allowed.length"
        (click)="confirm()">
        <mat-icon>check</mat-icon> Confirm
      </button>
    </mat-dialog-actions>
  `,
})
export class StatusDialogComponent {
  form: FormGroup;
  allowed: POStatus[];

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<StatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStatus: POStatus; poNumber: string },
  ) {
    this.allowed = TRANSITIONS[data.currentStatus] ?? [];
    this.form = this.fb.group({
      status:          [this.allowed[0] ?? ''],
      remarks:         [''],
      tracking_number: [''],
    });
  }

  confirm(): void {
    const v = this.form.value;
    this.ref.close({
      status:          v.status,
      remarks:         v.remarks         || undefined,
      tracking_number: v.tracking_number || undefined,
    });
  }
}
