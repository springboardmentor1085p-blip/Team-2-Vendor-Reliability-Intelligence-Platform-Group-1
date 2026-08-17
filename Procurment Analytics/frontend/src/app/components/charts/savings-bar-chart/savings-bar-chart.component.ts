import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis,
  ApexTooltip, ApexDataLabels, ApexPlotOptions, ApexGrid
} from 'ng-apexcharts';

export interface SavingsTrendItem { month: string; savings: number; }

@Component({
  selector: 'app-savings-bar-chart',
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
      <div *ngIf="!loading && !series[0]?.data?.length" class="empty-state">No savings data available</div>
    </div>`,
  styles: [`
    .chart-wrap { position: relative; min-height: 220px; }
    .chart-skeleton { height: 220px; border-radius: 8px;
      background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
      background-size: 200% 100%; animation: shimmer 1.4s infinite; }
    .empty-state { display:flex;align-items:center;justify-content:center;height:220px;color:#94a3b8;font-size:.9rem; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `]
})
export class SavingsBarChartComponent implements OnChanges {
  @Input() data: SavingsTrendItem[] = [];
  @Input() loading = false;

  series: ApexAxisChartSeries = [{ name: 'Savings', data: [] }];
  chart: ApexChart = {
    type: 'bar', height: 220, toolbar: { show: false },
    animations: { enabled: true, speed: 600 },
    fontFamily: 'Inter, Roboto, sans-serif'
  };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 5, columnWidth: '60%' } };
  dataLabels: ApexDataLabels = { enabled: false };
  xaxis: ApexXAxis = { categories: [], labels: { style: { fontSize: '10px' } } };
  yaxis: ApexYAxis = { labels: { formatter: (v: number) => `$${(v / 1000).toFixed(0)}k` } };
  tooltip: ApexTooltip = { y: { formatter: (v: number) => `$${v.toLocaleString()}` } };
  grid: ApexGrid = { borderColor: '#f1f5f9', strokeDashArray: 4 };
  colors = ['#16a34a'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.series = [{ name: 'Procurement Savings ($)', data: this.data.map(d => d.savings) }];
      this.xaxis  = { ...this.xaxis, categories: this.data.map(d => d.month) };
    }
  }
}
