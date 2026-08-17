import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexTooltip, ApexDataLabels, ApexFill, ApexGrid } from 'ng-apexcharts';

export interface MonthlyTrendItem { month: string; amount: number; }

@Component({
  selector: 'app-spend-trend-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="chart-wrap">
      <div *ngIf="loading" class="skeleton chart-skeleton"></div>
      <apx-chart *ngIf="!loading && series[0]?.data?.length"
        [series]="series" [chart]="chart" [xaxis]="xaxis"
        [stroke]="stroke" [fill]="fill" [tooltip]="tooltip"
        [dataLabels]="dataLabels" [grid]="grid" [colors]="colors">
      </apx-chart>
      <div *ngIf="!loading && !series[0]?.data?.length" class="empty-state">
        <span>No spend data available</span>
      </div>
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
export class SpendTrendChartComponent implements OnChanges {
  @Input() data: MonthlyTrendItem[] = [];
  @Input() loading = false;

  series: ApexAxisChartSeries = [{ name: 'Spend', data: [] }];

  chart: ApexChart = {
    type: 'area', height: 240, toolbar: { show: false },
    animations: { enabled: true, speed: 600 },
    fontFamily: 'Inter, Roboto, sans-serif',
  };
  stroke: ApexStroke = { curve: 'smooth', width: 3 };
  fill: ApexFill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } };
  xaxis: ApexXAxis = { categories: [], labels: { style: { fontSize: '11px' } } };
  tooltip: ApexTooltip = { y: { formatter: (v: number) => `$${v.toLocaleString()}` } };
  dataLabels: ApexDataLabels = { enabled: false };
  grid: ApexGrid = { borderColor: '#f1f5f9', strokeDashArray: 4 };
  colors = ['#2563eb'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.series = [{ name: 'Spend ($)', data: this.data.map(d => d.amount) }];
      this.xaxis  = { ...this.xaxis, categories: this.data.map(d => d.month) };
    }
  }
}
