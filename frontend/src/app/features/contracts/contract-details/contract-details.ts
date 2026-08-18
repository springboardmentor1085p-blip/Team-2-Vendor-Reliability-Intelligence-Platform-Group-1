import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { ContractService } from '../../../core/services/contract';
import { Contract } from '../../../core/models/contract.model';

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './contract-details.html',
  styleUrl: './contract-details.scss'
})
export class ContractDetails implements OnInit {
  private contractService = inject(ContractService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  contract: Contract | null = null;

  loading = true;
  error = false;
  errorMessage = '';

  ngOnInit(): void {
    const idParam =
      this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.loadContract(Number(idParam));
    } else {
      this.error = true;
      this.errorMessage =
        'No Contract ID found in route.';
      this.loading = false;
    }
  }

  loadContract(id: number): void {
    this.loading = true;
    this.error = false;

    this.contractService
      .getContractById(id)
      .subscribe({
        next: (data) => {
          this.contract = data;
          this.loading = false;
        },

        error: (err) => {
          console.error(
            'Error fetching contract details:',
            err
          );

          this.error = true;
          this.errorMessage =
            'Could not load contract details.';

          this.loading = false;
        }
      });
  }

  deleteContract(): void {
    if (!this.contract) {
      return;
    }

    if (
      !confirm(
        `Delete contract ${this.contract.contract_number}?`
      )
    ) {
      return;
    }

    this.contractService
      .deleteContract(this.contract.id!)
      .subscribe({
        next: () => {
          this.router.navigate([
            '/contracts'
          ]);
        },

        error: (err) => {
          console.error(
            'Delete error:',
            err
          );

          alert(
            'Failed to delete contract.'
          );
        }
      });
  }
}