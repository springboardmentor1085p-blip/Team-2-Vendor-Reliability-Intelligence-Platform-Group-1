import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ContractService } from '../../../core/services/contract';
import { Contract } from '../../../core/models/contract.model';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-list.html',
  styleUrl: './contract-list.scss'
})
export class ContractList implements OnInit {
  private contractService = inject(ContractService);
  private router = inject(Router);

  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];

  loading = true;
  error = false;
  errorMessage = '';

  searchTerm = '';
  statusFilter = 'all';

  ngOnInit(): void {
    this.loadContracts();
  }

  loadData(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.error = false;

    this.contractService.getAllContracts().subscribe({
      next: (data) => {
        this.contracts = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load contracts:', err);
        this.error = true;
        this.errorMessage = 'Could not load contract records.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let list = [...this.contracts];

    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      list = list.filter((contract) =>
        contract.contract_number?.toLowerCase().includes(term) ||
        contract.contract_title?.toLowerCase().includes(term) ||
        this.getVendorName(contract).toLowerCase().includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      list = list.filter(
        (contract) =>
          (contract.status || 'active').toLowerCase() ===
          this.statusFilter.toLowerCase()
      );
    }

    this.filteredContracts = list;
  }

  getVendorName(contract: Contract): string {
    return `Vendor #${contract.vendor_id}`;
  }

  isExpiringSoon(endDateStr: string): boolean {
    if (!endDateStr) {
      return false;
    }

    const endDate = new Date(endDateStr);
    const today = new Date();

    const difference =
      endDate.getTime() - today.getTime();

    const thirtyDays =
      30 * 24 * 60 * 60 * 1000;

    return difference >= 0 && difference <= thirtyDays;
  }

  viewDetails(id: number): void {
    this.router.navigate(['/contracts/details', id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/contracts/add']);
  }

  deleteContract(event: Event, id: number): void {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    this.contractService.deleteContract(id).subscribe({
      next: () => {
        this.contracts = this.contracts.filter(
          (contract) => contract.id !== id
        );

        this.applyFilters();
      },
      error: (err) => {
        console.error('Error deleting contract:', err);
        alert('Failed to delete contract.');
      }
    });
  }
}