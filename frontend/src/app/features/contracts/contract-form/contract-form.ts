import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { ContractService } from '../../../core/services/contract';
import { Contract } from '../../../core/models/contract.model';

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './contract-form.html',
  styleUrl: './contract-form.scss'
})
export class ContractForm implements OnInit {
  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  contractForm!: FormGroup;

  isEditMode = false;
  contractId: number | null = null;

  submitting = false;
  errorMessage = '';

  /*
   * The existing project does not have a Vendor model/service
   * available in the expected path.
   *
   * Keep the vendor selector functional using vendor IDs.
   * These can be replaced with real vendor data later without
   * changing the contract architecture.
   */
  vendors: Array<{
    id: number;
    company_name: string;
  }> = [];

  ngOnInit(): void {
    this.initForm();

    const idParam =
      this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.contractId = Number(idParam);

      this.loadExistingContract(this.contractId);
    }
  }

  private initForm(): void {
    const today =
      new Date().toISOString().split('T')[0];

    const nextYear = new Date();

    nextYear.setFullYear(
      nextYear.getFullYear() + 1
    );

    const endDate =
      nextYear.toISOString().split('T')[0];

    this.contractForm = this.fb.group({
      contract_number: [
        '',
        Validators.required
      ],

      vendor_id: [
        null,
        Validators.required
      ],

      contract_title: [
        '',
        Validators.required
      ],

      contract_value: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      start_date: [
        today,
        Validators.required
      ],

      end_date: [
        endDate,
        Validators.required
      ],

      status: [
        'active',
        Validators.required
      ],

      terms_conditions: ['']
    });
  }

  private loadExistingContract(
    id: number
  ): void {
    this.contractService
      .getContractById(id)
      .subscribe({
        next: (contract: Contract) => {
          this.contractForm.patchValue({
            contract_number:
              contract.contract_number,

            vendor_id:
              contract.vendor_id,

            contract_title:
              contract.contract_title,

            contract_value:
              contract.contract_value,

            start_date:
              contract.start_date
                ? contract.start_date.split('T')[0]
                : '',

            end_date:
              contract.end_date
                ? contract.end_date.split('T')[0]
                : '',

            status:
              contract.status || 'active',

            terms_conditions:
              contract.terms_conditions || ''
          });
        },

        error: (err) => {
          console.error(
            'Error loading contract:',
            err
          );

          this.errorMessage =
            'Could not load contract details.';
        }
      });
  }

  onSubmit(): void {
    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const value =
      this.contractForm.value;

    const payload: Contract = {
      contract_number:
        value.contract_number,

      vendor_id:
        Number(value.vendor_id),

      contract_title:
        value.contract_title,

      contract_value:
        Number(value.contract_value),

      start_date:
        value.start_date,

      end_date:
        value.end_date,

      status:
        value.status,

      terms_conditions:
        value.terms_conditions || ''
    };

    if (
      this.isEditMode &&
      this.contractId !== null
    ) {
      this.contractService
        .updateContract(
          this.contractId,
          payload
        )
        .subscribe({
          next: () => {
            this.router.navigate([
              '/contracts/details',
              this.contractId
            ]);
          },

          error: (err) => {
            console.error(
              'Update failed:',
              err
            );

            this.errorMessage =
              err?.error?.detail ||
              'Failed to update contract.';

            this.submitting = false;
          }
        });

      return;
    }

    this.contractService
      .createContract(payload)
      .subscribe({
        next: () => {
          this.router.navigate([
            '/contracts'
          ]);
        },

        error: (err) => {
          console.error(
            'Creation failed:',
            err
          );

          this.errorMessage =
            err?.error?.detail ||
            'Failed to create contract.';

          this.submitting = false;
        }
      });
  }
}