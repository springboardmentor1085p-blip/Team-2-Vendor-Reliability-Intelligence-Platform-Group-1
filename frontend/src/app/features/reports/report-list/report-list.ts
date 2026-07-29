import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-list.html',
  styleUrl: './report-list.scss',
})
export class ReportList {

  searchText = '';

  reports = [

    {
      id: 1,
      name: 'Vendor Performance Report',
      type: 'Performance',
      generatedBy: 'Admin',
      date: '24-07-2026',
      status: 'Completed'
    },

    {
      id: 2,
      name: 'Risk Assessment Report',
      type: 'Risk',
      generatedBy: 'Manager',
      date: '23-07-2026',
      status: 'Completed'
    },

    {
      id: 3,
      name: 'Contract Expiry Report',
      type: 'Contract',
      generatedBy: 'Admin',
      date: '22-07-2026',
      status: 'Pending'
    },

    {
      id: 4,
      name: 'Purchase Order Summary',
      type: 'Procurement',
      generatedBy: 'System',
      date: '21-07-2026',
      status: 'Completed'
    }

  ];

  downloadReport(report: any) {

    alert(`Downloading "${report.name}"...`);

  }

  deleteReport(id: number) {

    if (confirm('Delete this report?')) {

      this.reports = this.reports.filter(r => r.id !== id);

    }

  }

}