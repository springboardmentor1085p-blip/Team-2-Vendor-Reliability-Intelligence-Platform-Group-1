import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

import { PurchaseOrderService } from '../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, NgClass, RouterLink],
  templateUrl: './purchase-order.html',
  styleUrl: './purchase-order.css'
})
export class PurchaseOrderComponent implements OnInit {

  po: any;

  constructor(
    private route: ActivatedRoute,
    private service: PurchaseOrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    console.log('PO ID:', id);

    this.service.getPO(id).subscribe({

      next: (data: any) => {

        console.log('PO Response:', data);

        this.po = data;

        this.cdr.detectChanges();

      },

      error: (err: any) => {
        console.error(err);
      }

    });

  }

}