import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcurementService } from '../../services/procurement.service';

@Component({
  selector: 'app-procurement-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './procurement-management.html',
  styleUrl: './procurement-management.css'
})
export class ProcurementManagement implements OnInit {

  procurement = {
    requestId: '',
    purchaseOrder: '',
    itemName: '',
    quantity: 0,
    vendor: '',
    deliveryDate: '',
    status: 'Pending',
    invoice: ''
  };

  procurements: any[] = [];

  statuses = [
    'Pending',
    'Approved',
    'Ordered',
    'Delivered',
    'Completed',
    'Cancelled'
  ];

  vendors = [
    'ABC Suppliers',
    'Global Traders',
    'Tech Solutions',
    'Prime Industries',
    'Logistics Hub'
  ];

  searchText = '';
  selectedStatus = '';
  editingId: number | null = null;
  message = '';

constructor(
  private procurementService: ProcurementService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.loadProcurements();
  }

  loadProcurements(): void {

    this.procurementService.getProcurements().subscribe({

      next: (data) => {
  console.log('Procurements:', data);

  this.procurements = [...data];

  console.log('procurements length:', this.procurements.length);

  this.cdr.detectChanges();
},

      error: (error) => {
        console.error(
          'Error loading procurements:',
          error
        );
      }

    });
  }

  addProcurement(): void {

  if (
    !this.procurement.requestId ||
    !this.procurement.purchaseOrder ||
    !this.procurement.itemName ||
    !this.procurement.quantity ||
    !this.procurement.vendor ||
    !this.procurement.deliveryDate
  ) {
    this.message = 'Please fill all required fields';
    return;
  }

  const data = {
    request_id: this.procurement.requestId.trim(),
    purchase_order: this.procurement.purchaseOrder.trim(),
    item_name: this.procurement.itemName.trim(),
    quantity: this.procurement.quantity,
    vendor: this.procurement.vendor,
    delivery_date: this.procurement.deliveryDate,
    status: this.procurement.status,
    invoice: this.procurement.invoice
  };

  // EDIT EXISTING PROCUREMENT
  if (this.editingId !== null) {

    this.procurementService
      .updateProcurement(this.editingId, data)
      .subscribe({

        next: (response) => {

          console.log(
            'Procurement Updated:',
            response
          );

          this.message =
            'Procurement Updated Successfully';

          this.editingId = null;

          this.loadProcurements();

          this.resetForm();

          setTimeout(() => {
            this.message = '';
          }, 3000);
        },

        error: (error) => {

          console.error(
            'Error updating procurement:',
            error
          );

          this.message =
            error.status === 400
              ? 'Request ID already exists'
              : 'Failed to update procurement';
        }

      });

    return;
  }

  // CREATE NEW PROCUREMENT
  this.procurementService
    .createProcurement(data)
    .subscribe({

      next: (response) => {

        console.log(
          'Procurement Created:',
          response
        );

        this.message =
          'Procurement Added Successfully';

        this.loadProcurements();

        this.resetForm();

        setTimeout(() => {
          this.message = '';
        }, 3000);
      },

      error: (error) => {

        console.error(
          'Error creating procurement:',
          error
        );

        this.message =
          error.status === 400
            ? 'Request ID already exists'
            : 'Failed to add procurement';
      }

    });
}

 resetForm(): void {

  this.procurement = {
    requestId: '',
    purchaseOrder: '',
    itemName: '',
    quantity: 0,
    vendor: '',
    deliveryDate: '',
    status: 'Pending',
    invoice: ''
  };

  this.editingId = null;
}

  deleteProcurement(index: number): void {

    const procurement = this.procurements[index];

    if (
      !confirm(
        'Are you sure you want to delete this procurement?'
      )
    ) {
      return;
    }

    this.procurementService
      .deleteProcurement(procurement.id)
      .subscribe({

        next: () => {

          this.message =
            'Procurement Deleted Successfully';

          this.loadProcurements();

          setTimeout(() => {
            this.message = '';
          }, 3000);
        },

        error: (error) => {

          console.error(
            'Error deleting procurement:',
            error
          );

          this.message =
            'Failed to delete procurement';
        }

      });
  }

 editProcurement(index: number): void {

  const item = this.procurements[index];

  this.procurement = {
    requestId: item.request_id,
    purchaseOrder: item.purchase_order,
    itemName: item.item_name,
    quantity: item.quantity,
    vendor: item.vendor,
    deliveryDate: item.delivery_date,
    status: item.status,
    invoice: item.invoice || ''
  };

  this.editingId = item.id;

  this.message = 'Editing Procurement Request';
}

  approveOrder(index: number): void {
    this.updateStatus(index, 'Approved');
  }

  orderPlaced(index: number): void {
    this.updateStatus(index, 'Ordered');
  }

  markDelivered(index: number): void {
    this.updateStatus(index, 'Delivered');
  }

  completeOrder(index: number): void {
    this.updateStatus(index, 'Completed');
  }

  cancelOrder(index: number): void {
    this.updateStatus(index, 'Cancelled');
  }

  updateStatus(
    index: number,
    status: string
  ): void {

    const procurement = this.procurements[index];

    this.procurementService
      .updateStatus(procurement.id, status)
      .subscribe({

        next: (response) => {

          console.log(
            'Status Updated:',
            response
          );

          this.procurements[index] = response;

          this.message =
            `Order ${status} Successfully`;

          setTimeout(() => {
            this.message = '';
          }, 3000);
        },

        error: (error) => {

          console.error(
            'Error updating status:',
            error
          );

          this.message =
            'Failed to update status';
        }

      });
  }

  getPendingCount(): number {
    return this.procurements.filter(
      x => x.status === 'Pending'
    ).length;
  }

  getCompletedCount(): number {
    return this.procurements.filter(
      x => x.status === 'Completed'
    ).length;
  }

  getCancelledCount(): number {
    return this.procurements.filter(
      x => x.status === 'Cancelled'
    ).length;
  }
}