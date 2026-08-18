import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';

import { VendorPerformance } from '../../../core/models/vendor-performance.model';
import { VendorPerformanceService } from '../../../core/services/vendor-performance.service';

@Component({
  selector: 'app-vendor-performance-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  templateUrl: './vendor-performance-list.html',
  styleUrl: './vendor-performance-list.scss'
})
export class VendorPerformanceList implements OnInit, AfterViewInit {

  private vendorPerformanceService = inject(VendorPerformanceService);
  private router = inject(Router);

  displayedColumns: string[] = [
    'id',
    'vendor',
    'score',
    'quality',
    'response',
    'service',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<VendorPerformance>([]);

  searchText = '';

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  ngOnInit(): void {
    this.loadVendorPerformance();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadVendorPerformance(): void {

    this.vendorPerformanceService
      .getAllVendorPerformance()
      .subscribe({

        next: (data) => {
          this.dataSource.data = data;
        },

        error: (err) => {
          console.error(err);
        }

      });

  }

  applyFilter(event: Event): void {

    const value = (event.target as HTMLInputElement).value;

    this.dataSource.filter = value.trim().toLowerCase();

  }

  addPerformance(): void {

    this.router.navigate(['/vendor-performance/add']);

  }

  editPerformance(id: number): void {

    this.router.navigate(['/vendor-performance/edit', id]);

  }

  deletePerformance(id: number): void {

    if (confirm('Delete this performance record?')) {

      this.vendorPerformanceService
        .deleteVendorPerformance(id)
        .subscribe({

          next: () => this.loadVendorPerformance(),

          error: (err) => console.error(err)

        });

    }

  }

  getStatus(score: number): string {

    if (score >= 90) return 'Excellent';

    if (score >= 75) return 'Good';

    if (score >= 60) return 'Average';

    return 'Poor';

  }

}