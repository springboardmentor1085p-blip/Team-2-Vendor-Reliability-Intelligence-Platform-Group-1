import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-risk-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-list.html',
  styleUrl: './risk-list.scss',
})
export class RiskList {

  risks = [

    {
      id: 1,
      vendor: 'ABC Technologies',
      category: 'Delivery',
      level: 'High',
      score: 62,
      status: 'Open'
    },

    {
      id: 2,
      vendor: 'XYZ Solutions',
      category: 'Quality',
      level: 'Medium',
      score: 78,
      status: 'Monitoring'
    },

    {
      id: 3,
      vendor: 'Tech Systems',
      category: 'Compliance',
      level: 'Low',
      score: 95,
      status: 'Resolved'
    }

  ];

  addRisk() {
    console.log('Add Risk');
  }

  editRisk(id: number) {
    console.log('Edit Risk', id);
  }

  deleteRisk(id: number) {

    if (confirm('Delete this risk record?')) {
      this.risks = this.risks.filter(risk => risk.id !== id);
    }

  }

}