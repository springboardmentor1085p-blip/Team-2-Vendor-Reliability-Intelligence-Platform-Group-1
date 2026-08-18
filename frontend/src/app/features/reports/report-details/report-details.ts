import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Report } from '../../../core/models/report.model';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-details.html',
  styleUrl: './report-details.scss',
})
export class ReportDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  report?: Report;

  loading = false;

  error = '';

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.loadReport(id);
    }

  }

  loadReport(id: number): void {

    this.loading = true;

    this.reportService.getReportById(id).subscribe({

      next: (data) => {
        this.report = data;
        this.loading = false;
      },

      error: () => {
        this.error = 'Failed to load report.';
        this.loading = false;
      }

    });

  }

}