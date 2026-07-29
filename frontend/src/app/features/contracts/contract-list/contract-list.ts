import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Contract } from '../../../core/models/contract.model';
import { ContractService } from '../../../core/services/contract';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './contract-list.html',
  styleUrls: ['./contract-list.scss']
})
export class ContractList implements OnInit {

  private contractService = inject(ContractService);

  contracts: Contract[] = [];

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.contractService.getAllContracts().subscribe({
      next: (data) => {
        this.contracts = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteContract(id: number): void {

    if (!confirm('Delete this contract?')) {
      return;
    }

    this.contractService.deleteContract(id).subscribe({
      next: () => {
        this.loadContracts();
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

}