import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ReliabilityService } from '../services/reliability.service';import {
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartType
} from 'chart.js';

interface ScoreItem {
  title: string;
  shortName: string;
  score: number;
  trend: number;
  icon: string;
  description: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  read: boolean;
}

interface Vendor {
  id: number;
  name: string;
  code: string;
  category: string;
  location: string;
  joinedDate: string;
  rank: number;
  totalVendors: number;
  overallScore: number;
  riskLevel: string;
}

interface KpiItem {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: string;
  subtitle: string;
}

interface RiskItem {
  title: string;
  value: number;
  level: string;
}

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: string;
  status: string;
}

@Component({
  selector: 'app-reliability-score',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective
  ],
  templateUrl: './reliability-score.html',
  styleUrl: './reliability-score.css'
})
export class ReliabilityScore {

  private reliabilityService = inject(ReliabilityService);

  selectedPeriod = '6 Months';
  selectedNotificationFilter = 'All';

  showNotifications = false;
  showVendorMenu = false;
  showActionsMenu = false;
  isDarkMode = false;
  isLoading = false;

  lastUpdated = '30 July 2026, 7:25 PM';

  recalculateMessage = '';
  refreshMessage = '';

  showAnalysis = false;
  showAllActivities = false;
  showEditVendor = false;

  vendors: Vendor[] = [
    {
      id: 1,
      name: 'Global Supplies Pvt Ltd',
      code: 'VEN-2048',
      category: 'Raw Materials Supplier',
      location: 'Hyderabad, India',
      joinedDate: 'March 2023',
      rank: 3,
      totalVendors: 42,
      overallScore: 92,
      riskLevel: 'Low Risk'
    },
    {
      id: 2,
      name: 'Prime Logistics India',
      code: 'VEN-1845',
      category: 'Logistics Partner',
      location: 'Chennai, India',
      joinedDate: 'August 2022',
      rank: 7,
      totalVendors: 42,
      overallScore: 86,
      riskLevel: 'Medium Risk'
    },
    {
      id: 3,
      name: 'TechNova Solutions',
      code: 'VEN-3167',
      category: 'Technology Services',
      location: 'Bengaluru, India',
      joinedDate: 'January 2024',
      rank: 2,
      totalVendors: 42,
      overallScore: 95,
      riskLevel: 'Low Risk'
    }
  ];

  selectedVendor: Vendor = this.vendors[0];

  scores: ScoreItem[] = [
    {
      title: 'Product Quality',
      shortName: 'Quality',
      score: 95,
      trend: 3.2,
      icon: '✦',
      description: 'Product acceptance and defect control'
    },
    {
      title: 'Delivery Performance',
      shortName: 'Delivery',
      score: 88,
      trend: -1.4,
      icon: '➜',
      description: 'On-time shipment and order fulfilment'
    },
    {
      title: 'Contract Compliance',
      shortName: 'Compliance',
      score: 91,
      trend: 2.1,
      icon: '✓',
      description: 'Policy, document and SLA compliance'
    },
    {
      title: 'Communication',
      shortName: 'Communication',
      score: 94,
      trend: 4.5,
      icon: '◎',
      description: 'Response quality and issue resolution'
    }
  ];

  kpis: KpiItem[] = [
    {
      title: 'On-Time Delivery',
      value: '96.4%',
      trend: '+2.8%',
      trendDirection: 'up',
      icon: '◷',
      subtitle: 'Across 128 deliveries'
    },
    {
      title: 'Quality Acceptance',
      value: '98.1%',
      trend: '+1.6%',
      trendDirection: 'up',
      icon: '◆',
      subtitle: 'Only 3 rejected batches'
    },
    {
      title: 'Average Response',
      value: '1.8 hrs',
      trend: '-22 min',
      trendDirection: 'up',
      icon: '⚡',
      subtitle: 'Faster than SLA target'
    },
    {
      title: 'Open Issues',
      value: '03',
      trend: '+1',
      trendDirection: 'down',
      icon: '!',
      subtitle: 'One high-priority issue'
    },
    {
      title: 'Active Contracts',
      value: '08',
      trend: 'Stable',
      trendDirection: 'neutral',
      icon: '▣',
      subtitle: 'Two renewals approaching'
    },
    {
      title: 'SLA Compliance',
      value: '97.2%',
      trend: '+3.1%',
      trendDirection: 'up',
      icon: '◉',
      subtitle: 'Above company target'
    }
  ];

  risks: RiskItem[] = [
    {
      title: 'Financial Risk',
      value: 24,
      level: 'Low'
    },
    {
      title: 'Delivery Risk',
      value: 38,
      level: 'Moderate'
    },
    {
      title: 'Compliance Risk',
      value: 16,
      level: 'Low'
    },
    {
      title: 'Operational Risk',
      value: 29,
      level: 'Low'
    }
  ];

  activities: ActivityItem[] = [
    {
      title: 'Reliability score recalculated',
      description: 'Overall score increased from 90% to 92%.',
      time: '10 minutes ago',
      icon: '↗',
      status: 'success'
    },
    {
      title: 'Compliance document approved',
      description: 'ISO certification was reviewed and approved.',
      time: '1 hour ago',
      icon: '✓',
      status: 'success'
    },
    {
      title: 'Delivery delay reported',
      description: 'Shipment PO-1849 was delayed by six hours.',
      time: 'Yesterday',
      icon: '!',
      status: 'warning'
    },
    {
      title: 'Contract terms updated',
      description: 'Annual supply agreement terms were modified.',
      time: '2 days ago',
      icon: '▣',
      status: 'info'
    }
  ];

  notifications: NotificationItem[] = [
    {
      id: 1,
      title: 'Delivery performance alert',
      message: 'Delivery score dropped below 90%. Review delayed shipments.',
      time: '5 minutes ago',
      type: 'warning',
      read: false
    },
    {
      id: 2,
      title: 'Compliance verified',
      message: 'The latest compliance documents were approved successfully.',
      time: '20 minutes ago',
      type: 'success',
      read: false
    },
    {
      id: 3,
      title: 'New score generated',
      message: 'The vendor reliability score was updated to 92%.',
      time: '1 hour ago',
      type: 'info',
      read: true
    },
    {
      id: 4,
      title: 'Contract renewal approaching',
      message: 'Annual Supply Agreement expires in 28 days.',
      time: 'Yesterday',
      type: 'danger',
      read: false
    }
  ];

  periodOptions: string[] = [
    '7 Days',
    '30 Days',
    '3 Months',
    '6 Months',
    '1 Year'
  ];

  notificationFilters: string[] = [
    'All',
    'Unread',
    'Warning',
    'Success'
  ];

  performanceChartType: ChartType = 'line';

  performanceChartData: ChartData<'line'> = {
    labels: [
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
    ],
    datasets: [
      {
        label: 'Reliability Score',
        data: [78, 82, 85, 88, 90, 92],
        fill: true,
        tension: 0.42,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3
      },
      {
        label: 'Industry Benchmark',
        data: [80, 80, 81, 81, 82, 82],
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [6, 6]
      }
    ]
  };

  performanceChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20
        }
      },
      tooltip: {
        enabled: true,
        padding: 12,
        callbacks: {
          label: context => {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: value => `${value}%`
        },
        grid: {
          display: true
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  comparisonChartType: ChartType = 'bar';

  comparisonChartData: ChartData<'bar'> = {
    labels: [
      'Quality',
      'Delivery',
      'Compliance',
      'Communication'
    ],
    datasets: [
      {
        label: 'Current Vendor',
        data: [95, 88, 91, 94],
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 22
      },
      {
        label: 'Vendor Average',
        data: [85, 82, 86, 84],
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 22
      }
    ]
  };

  comparisonChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20
        }
      },
      tooltip: {
        padding: 12,
        callbacks: {
          label: context => {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: value => `${value}%`
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  get overallScore(): number {
    return this.selectedVendor.overallScore;
  }

  get unreadCount(): number {
    return this.notifications.filter(
      notification => !notification.read
    ).length;
  }

  get filteredNotifications(): NotificationItem[] {
    switch (this.selectedNotificationFilter) {
      case 'Unread':
        return this.notifications.filter(item => !item.read);

      case 'Warning':
        return this.notifications.filter(
          item => item.type === 'warning' || item.type === 'danger'
        );

      case 'Success':
        return this.notifications.filter(
          item => item.type === 'success'
        );

      default:
        return this.notifications;
    }
  }

  get scoreCircumference(): number {
    return 2 * Math.PI * 72;
  }

  get scoreOffset(): number {
    return this.scoreCircumference -
      (this.overallScore / 100) * this.scoreCircumference;
  }

  getScoreLabel(score: number): string {
    if (score >= 90) {
      return 'Excellent';
    }

    if (score >= 75) {
      return 'Good';
    }

    if (score >= 60) {
      return 'Average';
    }

    return 'Risk';
  }

  getScoreClass(score: number): string {
    if (score >= 90) {
      return 'excellent';
    }

    if (score >= 75) {
      return 'good';
    }

    if (score >= 60) {
      return 'average';
    }

    return 'risk';
  }

  getRiskClass(value: number): string {
    if (value <= 25) {
      return 'low-risk';
    }

    if (value <= 50) {
      return 'medium-risk';
    }

    return 'high-risk';
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';

      case 'warning':
        return '!';

      case 'danger':
        return '×';

      default:
        return 'i';
    }
  }

  selectVendor(vendor: Vendor): void {
    this.selectedVendor = vendor;
    this.showVendorMenu = false;
    this.simulateVendorData(vendor.id);
  }

  private simulateVendorData(vendorId: number): void {

    if (vendorId === 1) {
      this.scores = [
        {
          title: 'Product Quality',
          shortName: 'Quality',
          score: 95,
          trend: 3.2,
          icon: '✦',
          description: 'Product acceptance and defect control'
        },
        {
          title: 'Delivery Performance',
          shortName: 'Delivery',
          score: 88,
          trend: -1.4,
          icon: '➜',
          description: 'On-time shipment and order fulfilment'
        },
        {
          title: 'Contract Compliance',
          shortName: 'Compliance',
          score: 91,
          trend: 2.1,
          icon: '✓',
          description: 'Policy, document and SLA compliance'
        },
        {
          title: 'Communication',
          shortName: 'Communication',
          score: 94,
          trend: 4.5,
          icon: '◎',
          description: 'Response quality and issue resolution'
        }
      ];

      this.performanceChartData = {
        ...this.performanceChartData,
        datasets: [
          {
            ...this.performanceChartData.datasets[0],
            data: [78, 82, 85, 88, 90, 92]
          },
          {
            ...this.performanceChartData.datasets[1],
            data: [80, 80, 81, 81, 82, 82]
          }
        ]
      };
    }

    if (vendorId === 2) {
      this.scores = [
        {
          title: 'Product Quality',
          shortName: 'Quality',
          score: 87,
          trend: 1.2,
          icon: '✦',
          description: 'Product acceptance and defect control'
        },
        {
          title: 'Delivery Performance',
          shortName: 'Delivery',
          score: 82,
          trend: -3.4,
          icon: '➜',
          description: 'On-time shipment and order fulfilment'
        },
        {
          title: 'Contract Compliance',
          shortName: 'Compliance',
          score: 89,
          trend: 0.8,
          icon: '✓',
          description: 'Policy, document and SLA compliance'
        },
        {
          title: 'Communication',
          shortName: 'Communication',
          score: 86,
          trend: 2.1,
          icon: '◎',
          description: 'Response quality and issue resolution'
        }
      ];

      this.performanceChartData = {
        ...this.performanceChartData,
        datasets: [
          {
            ...this.performanceChartData.datasets[0],
            data: [81, 83, 82, 85, 88, 86]
          },
          {
            ...this.performanceChartData.datasets[1],
            data: [80, 80, 81, 81, 82, 82]
          }
        ]
      };
    }

    if (vendorId === 3) {
      this.scores = [
        {
          title: 'Product Quality',
          shortName: 'Quality',
          score: 97,
          trend: 4.6,
          icon: '✦',
          description: 'Product acceptance and defect control'
        },
        {
          title: 'Delivery Performance',
          shortName: 'Delivery',
          score: 93,
          trend: 3.2,
          icon: '➜',
          description: 'On-time shipment and order fulfilment'
        },
        {
          title: 'Contract Compliance',
          shortName: 'Compliance',
          score: 96,
          trend: 2.8,
          icon: '✓',
          description: 'Policy, document and SLA compliance'
        },
        {
          title: 'Communication',
          shortName: 'Communication',
          score: 94,
          trend: 1.7,
          icon: '◎',
          description: 'Response quality and issue resolution'
        }
      ];

      this.performanceChartData = {
        ...this.performanceChartData,
        datasets: [
          {
            ...this.performanceChartData.datasets[0],
            data: [86, 88, 89, 92, 94, 95]
          },
          {
            ...this.performanceChartData.datasets[1],
            data: [80, 80, 81, 81, 82, 82]
          }
        ]
      };
    }

    this.updateComparisonChart();
  }

  updateComparisonChart(): void {
    this.comparisonChartData = {
      ...this.comparisonChartData,
      datasets: [
        {
          ...this.comparisonChartData.datasets[0],
          data: this.scores.map(item => item.score)
        },
        {
          ...this.comparisonChartData.datasets[1],
          data: [85, 82, 86, 84]
        }
      ]
    };
  }

  // BACKEND CONNECTED CALCULATE SCORE
  calculateScore(): void {

    const data = {
      vendor_id: this.selectedVendor.id,
      quality_score: this.scores[0].score,
      delivery_score: this.scores[1].score,
      compliance_score: this.scores[2].score,
      communication_score: this.scores[3].score
    };

    this.reliabilityService.calculateScore(data).subscribe({
      next: (response) => {

        console.log('Backend Reliability Score:', response);
        this.isLoading = false;
        const calculatedScore =
          response.overall_score ??
          response.reliability_score ??
          response.score;

        if (calculatedScore !== undefined) {
          this.selectedVendor = {
            ...this.selectedVendor,
            overallScore: Math.round(Number(calculatedScore))
          };
        }

        this.notifications.unshift({
          id: Date.now(),
          title: 'Reliability score updated',
          message: `The score for ${this.selectedVendor.name} was recalculated successfully.`,
          time: 'Just now',
          type: 'success',
          read: false
        });

        this.activities.unshift({
          title: 'Score recalculated manually',
          description: `The latest reliability score is ${this.overallScore}%.`,
          time: 'Just now',
          icon: '↻',
          status: 'success'
        });

        this.lastUpdated = new Date().toLocaleString();

        this.recalculateMessage =
          '✓ Score recalculated successfully';

        this.updateComparisonChart();
      },

      error: (error) => {

        console.error('Reliability Score API Error:', error);

        this.recalculateMessage =
          '✕ Failed to calculate reliability score';

        this.isLoading = false;
      },


      complete: () => {
        this.isLoading = false;
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showVendorMenu = false;
    this.showActionsMenu = false;
  }

  toggleVendorMenu(): void {
    this.showVendorMenu = !this.showVendorMenu;
    this.showNotifications = false;
    this.showActionsMenu = false;
  }

  toggleActionsMenu(): void {
    this.showActionsMenu = !this.showActionsMenu;
    this.showNotifications = false;
    this.showVendorMenu = false;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  markNotificationAsRead(
    notification: NotificationItem
  ): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map(
      notification => ({
        ...notification,
        read: true
      })
    );
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  refreshDashboard(): void {
    this.calculateScore();

    this.refreshMessage =
      '✓ Intelligence refreshed successfully';

    this.lastUpdated =
      new Date().toLocaleString();
  }

  exportReport(): void {

    const report = [
      'VENDOR RELIABILITY REPORT',
      '',
      `Vendor: ${this.selectedVendor.name}`,
      `Vendor Code: ${this.selectedVendor.code}`,
      `Overall Score: ${this.overallScore}%`,
      `Risk Level: ${this.selectedVendor.riskLevel}`,
      `Rank: ${this.selectedVendor.rank} of ${this.selectedVendor.totalVendors}`,
      '',
      'SCORE BREAKDOWN',
      ...this.scores.map(
        item => `${item.title}: ${item.score}%`
      ),
      '',
      `Generated: ${new Date().toLocaleString()}`
    ].join('\n');

    const reportBlob = new Blob(
      [report],
      { type: 'text/plain;charset=utf-8' }
    );

    const downloadUrl =
      URL.createObjectURL(reportBlob);

    const downloadLink =
      document.createElement('a');

    downloadLink.href = downloadUrl;

    downloadLink.download =
      `${this.selectedVendor.code}-reliability-report.txt`;

    downloadLink.click();

    URL.revokeObjectURL(downloadUrl);
  }

  printReport(): void {
    window.print();
  }

  viewFullAnalysis(): void {
    this.showAnalysis = true;
  }

  closeAnalysis(): void {
    this.showAnalysis = false;
  }

  viewAllActivities(): void {
    this.showAllActivities =
      !this.showAllActivities;
  }

  editVendorProfile(): void {
    this.showEditVendor = true;
  }

  closeEditVendor(): void {
    this.showEditVendor = false;
  }

  saveVendorProfile(): void {
    this.showEditVendor = false;

    this.notifications.unshift({
      id: Date.now(),
      title: 'Vendor profile updated',
      message: `${this.selectedVendor.name} profile was updated successfully.`,
      time: 'Just now',
      type: 'success',
      read: false
    });
  }

  changePeriod(): void {

    const chartValues: Record<string, number[]> = {
      '7 Days': [87, 88, 89, 88, 90, 91, 92],
      '30 Days': [82, 84, 85, 87, 89, 90, 92],
      '3 Months': [80, 83, 86, 89, 92],
      '6 Months': [78, 82, 85, 88, 90, 92],
      '1 Year': [72, 75, 78, 81, 84, 87, 89, 92]
    };

    const chartLabels: Record<string, string[]> = {
      '7 Days': [
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sun'
      ],

      '30 Days': [
        'Week 1',
        'Week 2',
        'Week 3',
        'Week 4',
        'Today'
      ],

      '3 Months': [
        'May',
        'June',
        'July',
        'August',
        'September'
      ],

      '6 Months': [
        'February',
        'March',
        'April',
        'May',
        'June',
        'July'
      ],

      '1 Year': [
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
        'Jan',
        'Feb',
        'Mar'
      ]
    };

    this.performanceChartData = {
      ...this.performanceChartData,

      labels:
        chartLabels[this.selectedPeriod],

      datasets: [
        {
          ...this.performanceChartData.datasets[0],
          data:
            chartValues[this.selectedPeriod]
        },

        {
          ...this.performanceChartData.datasets[1],
          data:
            chartValues[this.selectedPeriod]
              .map(() => 82)
        }
      ]
    };
  }
}