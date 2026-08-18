import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Report } from '../../../core/models/report.model';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './report-form.html',
  styleUrl: './report-form.scss'
})
export class ReportForm {

  private reportService = inject(ReportService);
  private router = inject(Router);

  isSaving = false;

  report: Report = {

    report_name: '',

    report_type: '',

    generated_by: '',

    file_format: '',

    status: 'Generated'

  };

  saveReport(): void {

    this.isSaving = true;

    this.reportService.createReport(this.report).subscribe({

      next: () => {

        alert('Report Created Successfully');

        this.router.navigate(['/reports/list']);

      },

      error: err => {

        console.error(err);

        this.isSaving = false;

      }

    });

  }

}