import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexNonAxisChartSeries, ApexChart, ApexLegend, ApexTooltip, ApexDataLabels, ApexResponsive } from 'ng-apexcharts';

export interface VendorSpendItem { vendor: string; amount: number; }

@Component({
  selector: 'app-vendor-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="chart-wrap">
      <div *ngIf="loading" class="skeleton chart-skeleton"></div>
      <apx-chart *ngIf="!loading && series.length"
        [series]="series" [chart]="chart" [labels]="labels"
        [legend]="legend" [tooltip]="tooltip"
        [dataLabels]="dataLabels" [responsive]="responsive" [colors]="colors">
      </apx-chart>
      <div *ngIf="!loading && !series.length" class="empty-state">No vendor data available</div>
    </div>`,
  styles: [`
    .chart-wrap { position: relative; min-height: 260px; }
    .chart-skeleton { height: 260px; border-radius: 8px;
      background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
      background-size: 200% 100%; animation: shimmer 1.4s infinite; }
    .empty-state { display:flex; align-items:center; justify-content:center; height:260px; color:#94a3b8; font-size:0.9rem; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `]
})
export class VendorPieChartComponent implements OnChanges {
  @Input() data: VendorSpendItem[] = [];
  @Input() loading = false;

  series: ApexNonAxisChartSeries = [];
  labels: string[] = [];

  chart: ApexChart = {
    type: 'donut', height: 260, toolbar: { show: false },
    animations: { enabled: true, speed: 600 },
    fontFamily: 'Inter, Roboto, sans-serif',
  };
  legend: ApexLegend = { position: 'bottom', fontSize: '12px' };
  tooltip: ApexTooltip = { y: { formatter: (v: number) => `$${v.toLocaleString()}` } };
  dataLabels: ApexDataLabels = { enabled: false };
  responsive: ApexResponsive[] = [{ breakpoint: 600, options: { chart: { height: 220 }, legend: { position: 'bottom' } } }];
  colors = ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#ea580c', '#dc2626', '#d97706', '#4f46e5'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.series = this.data.map(d => d.amount);
      this.labels = this.data.map(d => d.vendor);
    }
  }
}
