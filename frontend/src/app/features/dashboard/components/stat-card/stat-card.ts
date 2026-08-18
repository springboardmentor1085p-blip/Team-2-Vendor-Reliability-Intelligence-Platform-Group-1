import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCard {

  @Input() title = '';

  @Input() value: number | string = 0;

  @Input() icon = 'dashboard';

  @Input() color = '#2563EB';

}