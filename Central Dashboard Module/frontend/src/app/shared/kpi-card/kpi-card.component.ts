import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, DecimalPipe],
  template: `
    <div class="kpi-card {{ color }}">
      <mat-icon class="kpi-icon">{{ icon }}</mat-icon>
      <div class="kpi-value">
        <ng-container *ngIf="isPercent">{{ value | number:'1.1-1' }}%</ng-container>
        <ng-container *ngIf="isCurrency">{{ value | number:'1.0-0' | currencyFormat }}</ng-container>
        <ng-container *ngIf="!isPercent && !isCurrency">{{ value | number:'1.0-0' }}</ng-container>
      </div>
      <div class="kpi-label">{{ label }}</div>
      <div class="kpi-sub" *ngIf="subtitle">{{ subtitle }}</div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() label  = '';
  @Input() value: number = 0;
  @Input() icon   = 'info';
  @Input() color  = 'primary';   // primary | success | warning | danger | info | purple
  @Input() isPercent  = false;
  @Input() isCurrency = false;
  @Input() subtitle   = '';
}
