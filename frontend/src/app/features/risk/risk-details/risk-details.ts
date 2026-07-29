import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-risk-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-details.html',
  styleUrl: './risk-details.scss',
})
export class RiskDetails {

  risk = {

    vendor: 'ABC Technologies',

    category: 'Delivery',

    level: 'High',

    score: 62,

    identifiedDate: '20-07-2026',

    status: 'Open',

    mitigationPlan:
      'Increase delivery monitoring, assign backup logistics partner, and conduct weekly review meetings.',

    description:
      'Vendor has experienced repeated delays in delivering purchase orders over the last quarter.'

  };

  activities = [

    {
      date: '20 Jul 2026',
      action: 'Risk Identified'
    },

    {
      date: '21 Jul 2026',
      action: 'Risk Assessment Completed'
    },

    {
      date: '23 Jul 2026',
      action: 'Mitigation Plan Assigned'
    }

  ];

}