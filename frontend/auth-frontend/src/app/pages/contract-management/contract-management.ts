import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface Contract {
  id: string;
  databaseId: number;
  vendorName: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  document: string;
}

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './contract-management.html',
  styleUrl: './contract-management.css',
})
export class ContractManagement implements OnInit {

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'http://127.0.0.1:8000/contracts';

  searchText = '';
  statusFilter = 'All';

  showUploadForm = false;
  selectedContract: Contract | null = null;

  isLoading = false;
  isSaving = false;

  newContract = {
    vendorName: '',
    title: '',
    startDate: '',
    endDate: '',
    status: 'Pending',
    document: ''
  };

  contracts: Contract[] = [];

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading = true;

    this.http
      .get<any[]>(`${this.apiUrl}/`)
      .subscribe({
        next: (response) => {
          this.contracts = response.map(contract => ({
            id: `CTR-${String(contract.id).padStart(3, '0')}`,
            databaseId: contract.id,
            vendorName: `Vendor ${contract.vendor_id}`,
            title: contract.contract_name,
            startDate: contract.start_date,
            endDate: contract.end_date,
            status: contract.status,
            document: contract.file_url || 'No document'
          }));

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Contract loading failed:', error);
          this.isLoading = false;
          alert('Unable to load contracts.');
        }
      });
  }

  get filteredContracts(): Contract[] {
    const search = this.searchText.toLowerCase().trim();

    return this.contracts.filter(contract => {
      const matchesSearch =
        contract.vendorName.toLowerCase().includes(search) ||
        contract.title.toLowerCase().includes(search) ||
        contract.status.toLowerCase().includes(search) ||
        contract.id.toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter === 'All' ||
        contract.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get totalContracts(): number {
    return this.contracts.length;
  }

  get activeContracts(): number {
    return this.contracts.filter(
      contract => contract.status === 'Active'
    ).length;
  }

  get pendingContracts(): number {
    return this.contracts.filter(
      contract => contract.status === 'Pending'
    ).length;
  }

  get expiredContracts(): number {
    return this.contracts.filter(
      contract => contract.status === 'Expired'
    ).length;
  }

  openUploadForm(): void {
    this.showUploadForm = true;
  }

  closeUploadForm(): void {
    this.showUploadForm = false;

    this.newContract = {
      vendorName: '',
      title: '',
      startDate: '',
      endDate: '',
      status: 'Pending',
      document: ''
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];

    if (selectedFile) {
      this.newContract.document = selectedFile.name;
    }
  }

  addContract(): void {
    if (
      !this.newContract.vendorName.trim() ||
      !this.newContract.title.trim() ||
      !this.newContract.startDate ||
      !this.newContract.endDate
    ) {
      alert('Please fill all required fields.');
      return;
    }

    if (
      new Date(this.newContract.endDate) <
      new Date(this.newContract.startDate)
    ) {
      alert('End date must be after start date.');
      return;
    }

    const requestBody = {
      contract_name: this.newContract.title,
      vendor_id: 1,
      status: this.newContract.status,
      start_date: this.newContract.startDate,
      end_date: this.newContract.endDate,
      file_url: this.newContract.document || 'No document'
    };

    this.isSaving = true;

    this.http
      .post(`${this.apiUrl}/`, requestBody)
      .subscribe({
        next: () => {
          this.isSaving = false;
          alert('Contract added successfully.');
          this.closeUploadForm();
          this.loadContracts();
        },
        error: (error) => {
          console.error('Contract creation failed:', error);
          this.isSaving = false;
          alert('Unable to add contract.');
        }
      });
  }

  deleteContract(contractId: number): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete this contract?'
    );

    if (!confirmDelete) {
      return;
    }

    this.http
      .delete(`${this.apiUrl}/${contractId}`)
      .subscribe({
        next: () => {
          alert('Contract deleted successfully.');
          this.loadContracts();
        },
        error: (error) => {
          console.error('Contract deletion failed:', error);
          alert('Unable to delete contract.');
        }
      });
  }

  viewContract(contract: Contract): void {
    this.selectedContract = contract;
  }

  closeContractDetails(): void {
    this.selectedContract = null;
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = 'All';
  }
}