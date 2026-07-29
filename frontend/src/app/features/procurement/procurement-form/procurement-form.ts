import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ProcurementService } from '../../../core/services/procurement';
import { Procurement } from '../../../core/models/procurement.model';

@Component({
  selector: 'app-procurement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './procurement-form.html',
  styleUrls: ['./procurement-form.scss']
})
export class ProcurementForm {

  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);

  procurementForm: FormGroup = this.fb.group({
    request_number: ['', Validators.required],
    title: ['', Validators.required],
    description: [''],
    vendor_id: [0, Validators.required],
    requested_by: ['', Validators.required],
    approved_by: [''],
    request_date: ['', Validators.required],
    expected_delivery: [''],
    total_amount: [0, Validators.required],
    status: ['Pending'],
    invoice_number: [''],
    remarks: ['']
  });

  onSubmit(): void {

    if (this.procurementForm.invalid) {
      this.procurementForm.markAllAsTouched();
      return;
    }

    const procurement = this.procurementForm.value as Procurement;

    this.procurementService.createProcurement(procurement).subscribe({
      next: () => {
        alert('Procurement Created Successfully');
        this.procurementForm.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Unable to save procurement');
      }
    });

  }

}