import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ContractService } from '../../../core/services/contract';
import { Contract } from '../../../core/models/contract.model';

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './contract-form.html',
  styleUrls: ['./contract-form.scss']
})
export class ContractForm {

  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);

  contractForm: FormGroup = this.fb.group({
    contract_number: ['', Validators.required],
    vendor_id: [0, Validators.required],
    contract_title: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    contract_value: [0, Validators.required],
    status: ['Active'],
    terms_conditions: ['']
  });

  onSubmit(): void {

    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();
      return;
    }

    const contract = this.contractForm.value as Contract;

    this.contractService.createContract(contract).subscribe({
      next: () => {
        alert('Contract Created Successfully');
        this.contractForm.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to create contract');
      }
    });

  }

}