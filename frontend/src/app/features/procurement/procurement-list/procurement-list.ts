import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Procurement } from '../../../core/models/procurement.model';
import { ProcurementService } from '../../../core/services/procurement';

@Component({
  selector: 'app-procurement-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procurement-list.html',
  styleUrls: ['./procurement-list.scss']
})
export class ProcurementList implements OnInit {

  procurements: Procurement[] = [];

  private procurementService = inject(ProcurementService);

  ngOnInit(): void {
    this.loadProcurements();
  }

  loadProcurements() {
    this.procurementService
      .getAllProcurements()
      .subscribe({
        next: (data) => {
          this.procurements = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  delete(id: number) {

    if (!confirm('Delete Procurement?')) {
      return;
    }

    this.procurementService
      .deleteProcurement(id)
      .subscribe(() => {

        this.loadProcurements();

      });

  }

}