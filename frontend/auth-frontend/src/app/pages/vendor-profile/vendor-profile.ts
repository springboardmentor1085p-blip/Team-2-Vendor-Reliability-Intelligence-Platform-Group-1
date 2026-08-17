import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface Vendor {
  companyName: string;
  status: string;
  approvalStatus: string;
  email: string;
  phone: string;
  address: string;
  vendorType: string;
  reliabilityScore: number;
}

interface VendorDocument {
  documentName: string;
  fileName: string;
}

interface VendorContact {
  type: string;
  icon: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './vendor-profile.html',
  styleUrl: './vendor-profile.css',
})
export class VendorProfile implements OnInit {

  private http = inject(HttpClient);

  showEditForm = false;
  showAddContactForm = false;

  selectedDocumentIndex: number | null = null;

  vendor: Vendor = {
    companyName: '',
    status: '',
    approvalStatus: 'Approved Vendor',
    email: '',
    phone: '',
    address: '',
    vendorType: 'Supplier',
    reliabilityScore: 95
  };

  editVendor: Vendor = { ...this.vendor };

  newContact: VendorContact = {
    type: 'Primary Contact',
    icon: '👤',
    name: '',
    designation: '',
    email: '',
    phone: ''
  };

  documents: VendorDocument[] = [
    {
      documentName: 'GST Certificate',
      fileName: 'gst_certificate.pdf'
    },
    {
      documentName: 'PAN Card',
      fileName: 'pan_card.pdf'
    },
    {
      documentName: 'Business License',
      fileName: 'business_license.pdf'
    }
  ];

  contacts: VendorContact[] = [
    {
      type: 'Primary Contact',
      icon: '👤',
      name: 'Ramesh Kumar',
      designation: 'Procurement Manager',
      email: 'ramesh@abcpvt.com',
      phone: '+91 9876543210'
    },
    {
      type: 'Secondary Contact',
      icon: '👥',
      name: 'Priya Sharma',
      designation: 'Accounts Manager',
      email: 'priya@abcpvt.com',
      phone: '+91 9876500000'
    }
  ];

  contracts = [
    {
      id: 'CTR001',
      title: 'Annual Supply Agreement',
      startDate: '01 Jul 2026',
      endDate: '30 Jun 2027',
      status: 'Active'
    },
    {
      id: 'CTR002',
      title: 'IT Support Contract',
      startDate: '15 Jun 2026',
      endDate: '15 Dec 2026',
      status: 'Pending'
    }
  ];

  ngOnInit(): void {
    this.loadVendorProfile();
  }

  loadVendorProfile(): void {
    this.http
      .get<any>('http://127.0.0.1:8000/vendors/1/profile')
      .subscribe({
        next: (response) => {
          this.vendor = {
            companyName: response.company_name,
            status: response.status,
            approvalStatus: 'Approved Vendor',
            email: response.email,
            phone: response.phone || '',
            address: response.address || '',
            vendorType: 'Supplier',
            reliabilityScore: 95
          };

          this.editVendor = { ...this.vendor };
        },
        error: (error) => {
          console.error('Vendor profile load error:', error);
          alert('Unable to load vendor profile.');
        }
      });
  }

  openEditForm(): void {
    this.editVendor = { ...this.vendor };
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.editVendor = { ...this.vendor };
  }

  saveProfile(): void {
    if (
      !this.editVendor.companyName.trim() ||
      !this.editVendor.email.trim() ||
      !this.editVendor.phone.trim() ||
      !this.editVendor.address.trim() ||
      !this.editVendor.vendorType.trim()
    ) {
      alert('Please fill all required fields.');
      return;
    }

    if (
      this.editVendor.reliabilityScore < 0 ||
      this.editVendor.reliabilityScore > 100
    ) {
      alert('Reliability score must be between 0 and 100.');
      return;
    }

    const requestBody = {
      company_name: this.editVendor.companyName,
      email: this.editVendor.email,
      phone: this.editVendor.phone,
      address: this.editVendor.address,
      status: this.editVendor.status
    };

    this.http
      .put<any>(
        'http://127.0.0.1:8000/vendors/1',
        requestBody
      )
      .subscribe({
        next: (response) => {
          this.vendor = {
            companyName: response.company_name,
            email: response.email,
            phone: response.phone || '',
            address: response.address || '',
            status: response.status,
            approvalStatus: this.editVendor.approvalStatus,
            vendorType: this.editVendor.vendorType,
            reliabilityScore: this.editVendor.reliabilityScore
          };

          this.editVendor = { ...this.vendor };
          this.showEditForm = false;

          alert('Vendor profile updated successfully.');
        },
        error: (error) => {
          console.error('Vendor update error:', error);
          alert('Unable to update vendor profile.');
        }
      });
  }

  openAddContactForm(): void {
    this.newContact = {
      type: 'Primary Contact',
      icon: '👤',
      name: '',
      designation: '',
      email: '',
      phone: ''
    };

    this.showAddContactForm = true;
  }

  closeAddContactForm(): void {
    this.showAddContactForm = false;
  }

  addContact(): void {
    if (
      !this.newContact.name.trim() ||
      !this.newContact.designation.trim() ||
      !this.newContact.email.trim() ||
      !this.newContact.phone.trim()
    ) {
      alert('Please fill all contact details.');
      return;
    }

    this.newContact.icon =
      this.newContact.type === 'Primary Contact'
        ? '👤'
        : '👥';

    this.contacts.push({ ...this.newContact });

    this.showAddContactForm = false;

    alert('Contact added successfully.');
  }

  viewDocument(vendorDocument: VendorDocument): void {
    alert('Viewing document: ' + vendorDocument.fileName);
  }

  downloadDocument(vendorDocument: VendorDocument): void {
    const content =
      `${vendorDocument.documentName}\nFile: ${vendorDocument.fileName}`;

    const blob = new Blob(
      [content],
      { type: 'text/plain' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = vendorDocument.fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  openDocumentSelector(
    index: number,
    fileInput: HTMLInputElement
  ): void {
    this.selectedDocumentIndex = index;
    fileInput.click();
  }

  replaceDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];

    if (
      selectedFile &&
      this.selectedDocumentIndex !== null
    ) {
      this.documents[this.selectedDocumentIndex].fileName =
        selectedFile.name;

      alert('Document replaced successfully.');
    }

    this.selectedDocumentIndex = null;
    input.value = '';
  }

  uploadNewDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];

    if (!selectedFile) {
      return;
    }

    this.documents.push({
      documentName: 'Company Document',
      fileName: selectedFile.name
    });

    alert('New company document added successfully.');

    input.value = '';
  }
}