import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { ChangeDetectorRef } from '@angular/core';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html'
})
export class OrderListComponent implements OnInit {

  orders: any[] = [];
  title = 'All Orders';

  constructor(
  private route: ActivatedRoute,
  private service: PurchaseOrderService,
  private cdr: ChangeDetectorRef
) {}

changeStatus(po: any, status: string): void {

  this.service.updateStatus(po.id, status).subscribe({

    next: () => {
      po.status = status;
    },

    error: (err) => {
      console.error(err);
    }

  });

}

  ngOnInit(): void {

    const vendor = this.route.snapshot.queryParamMap.get('vendor');
    const status = this.route.snapshot.paramMap.get('status');

    console.log('Vendor Param =', vendor);
    console.log('Status Param =', status);

    this.service.getAllPurchaseOrders().subscribe((data: any[]) => {

      console.log('All Orders =', data);

      if (vendor && vendor.trim() !== '') {

        this.title = `${vendor} Orders`;

       this.orders = [...data.filter(o => o.vendor_name?.trim().toLowerCase() === vendor.trim().toLowerCase() )];

      } else if (status && status.trim() !== '') {

        this.title = `${status} Orders`;

        this.orders = data.filter(o =>
          (o.status || '').trim().toLowerCase() ===
          status.trim().toLowerCase()
        );

      } else {

        this.title = 'All Orders';
        this.orders = [...data]; 
        this.cdr.detectChanges();

      }

      console.log('Filtered Orders =', this.orders); 
      this.cdr.detectChanges();

    });

  }

}