import { Component, OnInit } from '@angular/core';
import { IntegrationService } from '../../services/integration.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  loading = true;
  summary: any = null;
  errorMessage = '';

  constructor(private integrationService: IntegrationService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading = true;
    this.integrationService.getIntegrationSummary().subscribe({
      next: (response) => {
        this.summary = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Unable to load integration data. Please try again later.';
        this.loading = false;
      },
    });
  }
}
