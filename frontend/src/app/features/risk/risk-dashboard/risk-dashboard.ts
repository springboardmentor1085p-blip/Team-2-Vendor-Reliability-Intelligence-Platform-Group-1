import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-risk-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-dashboard.html',
  styleUrl: './risk-dashboard.scss',
})
export class RiskDashboard {

  summary = {

    totalVendors: 150,

    highRisk: 12,

    mediumRisk: 38,

    lowRisk: 100,

    averageScore: 91

  };

  recentAlerts = [

    {
      vendor: 'ABC Technologies',
      risk: 'High',
      issue: 'Delayed Deliveries',
      score: 62
    },

    {
      vendor: 'XYZ Solutions',
      risk: 'Medium',
      issue: 'Quality Complaints',
      score: 78
    },

    {
      vendor: 'Tech Systems',
      risk: 'Low',
      issue: 'Minor Documentation Delay',
      score: 95
    }

  ];

}