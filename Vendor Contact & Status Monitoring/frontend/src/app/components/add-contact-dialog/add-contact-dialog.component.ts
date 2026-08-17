import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { VendorContact } from '../../models/vendor-contact.model';

@Component({
  selector: 'app-add-contact-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Contact' : 'Add Contact' }}</h2>
    <form [formGroup]="contactForm" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contact Name</mat-label>
          <input matInput formControlName="contact_name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Designation</mat-label>
          <input matInput formControlName="designation">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone">
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="contactForm.invalid">Save</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class AddContactDialogComponent {
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VendorContact | null
  ) {
    this.contactForm = this.fb.group({
      contact_name: [data?.contact_name || '', [Validators.required, Validators.minLength(2)]],
      designation: [data?.designation || '', [Validators.required, Validators.minLength(2)]],
      email: [data?.email || '', [Validators.required, Validators.email]],
      phone: [data?.phone || '', [Validators.required, Validators.minLength(7)]],
    });
  }

  save(): void {
    if (this.contactForm.valid) {
      this.dialogRef.close(this.contactForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
