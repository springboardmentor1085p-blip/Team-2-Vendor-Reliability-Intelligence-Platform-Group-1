import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

export type ChartType = 'bar' | 'line' | 'pie';

/** Single-series entry — used by bar and pie charts. */
export interface ChartDataItem {
  name: string;
  value: number;
}

/** Multi-series entry — used by the line chart. */
export interface ChartSeriesItem {
  name: string;
  series: ChartDataItem[];
}

@Component({
  selector: 'app-shared-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './shared-chart.component.html',
  styleUrls: ['./shared-chart.component.css'],
})
export class SharedChartComponent implements OnChanges {

  // ── Inputs ────────────────────────────────────────────────────────────────

  /** Which ngx-charts chart to render: 'bar' | 'line' | 'pie' */
  @Input() chartType: ChartType = 'bar';

  /** Data in standard ngx-charts format. */
  @Input() data: ChartDataItem[] | ChartSeriesItem[] = [];

  /** Optional title displayed above the chart. */
  @Input() title = '';

  /** Chart dimensions [width, height] in pixels. */
  @Input() view: [number, number] = [700, 400];

  /** Color scheme. Defaults to a Material-aligned VendorIQ palette. */
  @Input() colorScheme: Color = {
    name: 'vendoriq',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'],
  };

  /** Whether to show the chart legend. */
  @Input() showLegend = true;

  /** Whether to show data labels on bars / pie slices. */
  @Input() showLabels = true;

  // ── Internal state ────────────────────────────────────────────────────────

  hasData = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.hasData = Array.isArray(this.data) && this.data.length > 0;
    }
  }
}
