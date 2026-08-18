import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-chart-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './chart-panel.html',
  styleUrl: './chart-panel.scss'
})
export class ChartPanel {}