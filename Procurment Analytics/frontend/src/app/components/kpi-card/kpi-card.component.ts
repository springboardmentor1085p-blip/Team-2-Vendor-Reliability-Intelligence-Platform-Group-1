import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
})
export class KpiCardComponent implements OnChanges {
  /** Display label shown above the value */
  @Input() label = '';
  /** Primary numeric value */
  @Input() value: number | string = 0;
  /** Material icon name */
  @Input() icon = 'trending_up';
  /** Accent colour key: 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'red' */
  @Input() color: 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'red' = 'blue';
  /** Percentage change vs prior period (positive = up, negative = down) */
  @Input() trendPct: number | null = null;
  /** Prefix prepended to value, e.g. '$' */
  @Input() prefix = '';
  /** Suffix appended to value, e.g. '%' */
  @Input() suffix = '';
  /** Optional tooltip text */
  @Input() tooltip = '';
  /** Show loading skeleton */
  @Input() loading = false;

  trendUp = false;
  trendDown = false;
  trendLabel = '';

  ngOnChanges(): void {
    if (this.trendPct !== null && this.trendPct !== undefined) {
      this.trendUp   = this.trendPct > 0;
      this.trendDown = this.trendPct < 0;
      this.trendLabel = `${this.trendPct > 0 ? '+' : ''}${this.trendPct}%`;
    }
  }

  get formattedValue(): string {
    if (this.loading) return '';
    const n = typeof this.value === 'number' ? this.value : parseFloat(String(this.value));
    const formatted = isNaN(n) ? String(this.value) : n.toLocaleString('en-US', { maximumFractionDigits: 1 });
    return `${this.prefix}${formatted}${this.suffix}`;
  }
}
