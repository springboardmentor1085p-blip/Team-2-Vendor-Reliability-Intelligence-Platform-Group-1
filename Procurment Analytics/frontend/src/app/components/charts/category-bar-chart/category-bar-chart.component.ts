import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexTooltip, ApexDataLabels, ApexPlotOptions, ApexGrid } from 'ng-apexcharts';

export interface CategorySpendItem { category: string; amount: number; purchase_count: number; }

@Component({
  selector: 'app-category-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="chart-wrap">
      <div *ngIf="loading" class="skeleton chart-skeleton"></div>
      <apx-chart *ngIf="!loading && series[0]?.data?.length"
        [series]="series" [chart]="chart" [xaxis]="xaxis" [yaxis]="yaxis"
        [plotOptions]="plotOptions" [dataLabels]="dataLabels"
        [tooltip]="tooltip" [grid]="grid" [colors]="colors">
      </apx-chart>
      <div *ngIf="!loading && !series[0]?.data?.length" class="empty-state">No category data available</div>
    </div>`,
  styles: [`
    .chart-wrap { position: relative; min-height: 240px; }
    .chart-skeleton { height: 240px; border-radius: 8px;
      background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
      background-size: 200% 100%; animation: shimmer 1.4s infinite; }
    .empty-state { display:flex; align-items:center; justify-content:center; height:240px; color:#94a3b8; font-size:0.9rem; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `]
})
export class CategoryBarChartComponent implements OnChanges {
  @Input() data: CategorySpendItem[] = [];
  @Input() loading = false;

  series: ApexAxisChartSeries = [{ name: 'Spend', data: [] }];

  chart: ApexChart = {
    type: 'bar', height: 240, toolbar: { show: false },
    animations: { enabled: true, speed: 600 },
    fontFamily: 'Inter, Roboto, sans-serif',
  };
  plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, horizontal: false, columnWidth: '55%' }
  };
  dataLabels: ApexDataLabels = { enabled: false };
  xaxis: ApexXAxis = { categories: [], labels: { style: { fontSize: '11px' } } };
  yaxis: ApexYAxis = { labels: { formatter: (v: number) => `$${(v / 1000).toFixed(0)}k` } };
  tooltip: ApexTooltip = { y: { formatter: (v: number) => `$${v.toLocaleString()}` } };
  grid: ApexGrid = { borderColor: '#f1f5f9', strokeDashArray: 4 };
  colors = ['#7c3aed'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.series = [{ name: 'Spend ($)', data: this.data.map(d => d.amount) }];
      this.xaxis  = { ...this.xaxis, categories: this.data.map(d => d.category) };
    }
  }
}
