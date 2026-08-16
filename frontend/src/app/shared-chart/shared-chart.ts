import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  BaseChartDirective
} from 'ng2-charts';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

Chart.register(...registerables);

import { AnalyticsService } from '../services/analytics';


@Component({
  selector: 'app-shared-chart',
  standalone: true,

  imports: [
    CommonModule,
    BaseChartDirective
  ],

  templateUrl: './shared-chart.html',
  styleUrl: './shared-chart.css'
})
export class SharedChart implements OnInit {

  public barChartData: ChartConfiguration<'bar'>['data'] = {

    labels: [
      'Total Vendors',
      'Completed Orders',
      'Pending Orders'
    ],

    datasets: [
      {
        label: 'Analytics',
        data: [0, 0, 0]
      }
    ]
  };


  public barChartOptions: ChartConfiguration<'bar'>['options'] = {

    responsive: true,

    scales: {
      y: {
        beginAtZero: true
      }
    }

  };


  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.analyticsService.getAnalytics().subscribe({

      next: (data: any) => {

        console.log('ANALYTICS DATA:', data);


        this.barChartData = {

          labels: [
            'Total Vendors',
            'Completed Orders',
            'Pending Orders'
          ],

          datasets: [
            {
              label: 'Analytics',

              data: [
                Number(data.total_vendors),
                Number(data.completed_orders),
                Number(data.pending_orders)
              ]
            }
          ]

        };


        console.log(
          'CHART DATA:',
          this.barChartData
        );


        this.cdr.detectChanges();

      },


      error: (err) => {

        console.error(
          'ANALYTICS ERROR:',
          err
        );

      }

    });

  }

}