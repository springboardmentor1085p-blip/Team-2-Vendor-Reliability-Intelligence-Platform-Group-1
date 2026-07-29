import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-dashboard.html',
  styleUrl: './report-dashboard.scss',
})
export class ReportDashboard {

  summary = {

    totalReports: 48,

    totalVendors: 150,

    purchaseOrders: 320,

    activeContracts: 112,

    highRiskVendors: 12,

    averageReliability: 91

  };

  recentReports = [

    {
      name: 'Vendor Performance Report',
      date: '24 Jul 2026',
      type: 'Performance'
    },

    {
      name: 'Risk Assessment Report',
      date: '22 Jul 2026',
      type: 'Risk'
    },

    {
      name: 'Contract Expiry Report',
      date: '20 Jul 2026',
      type: 'Contract'
    },

    {
      name: 'Purchase Order Summary',
      date: '18 Jul 2026',
      type: 'Procurement'
    }

  ];

  exportPDF() {
    alert('PDF Export will be integrated with backend.');
  }

  exportExcel() {
    alert('Excel Export will be integrated with backend.');
  }

}