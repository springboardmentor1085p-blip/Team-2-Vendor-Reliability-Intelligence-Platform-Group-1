import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Risk } from '../../../core/models/risk.model';
import { RiskService } from '../../../core/services/risk.service';

@Component({
  selector: 'app-risk-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './risk-form.html',
  styleUrl: './risk-form.scss'
})
export class RiskForm {

  private riskService = inject(RiskService);
  private router = inject(Router);

  isSaving = false;

  risk: Risk = {

    vendor_id: 0,

    risk_type: '',

    risk_level: '',

    risk_score: 0,
    severity: '',
    impact_score: 0,
    issue: '',

    description: '',

    status: 'Open'

  };

  saveRisk(): void {

    this.isSaving = true;

    this.riskService.createRisk(this.risk).subscribe({

      next: () => {

        alert('Risk Created Successfully');

        this.router.navigate(['/risk/list']);

      },

      error: err => {

        console.error(err);

        this.isSaving = false;

      }

    });

  }

}