import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReliabilityService } from '../../services/reliability.service';

interface DashboardCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend: string;
}

interface Activity {
  title: string;
  description: string;
  time: string;
  icon: string;
}

interface ExpiringContract {
  contractName: string;
  vendorName: string;
  expiryDate: string;
  daysLeft: number;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private reliabilityService = inject(ReliabilityService);
  private clockInterval?: ReturnType<typeof setInterval>;

  userName = 'Admin';
  userEmail = 'admin@vendor.com';
  currentDateTime = '';
  isRefreshing = false;

  dashboardCards: DashboardCard[] = [
    {
      title: 'Total Vendors',
      value: 24,
      subtitle: 'Registered vendors',
      icon: 'bi bi-people-fill',
      trend: '+8% this month',
    },
    {
      title: 'Active Contracts',
      value: 18,
      subtitle: 'Currently active',
      icon: 'bi bi-file-earmark-text-fill',
      trend: '+3 new contracts',
    },
    {
      title: 'Purchase Orders',
      value: 32,
      subtitle: 'Orders processed',
      icon: 'bi bi-cart-check-fill',
      trend: '+12% this month',
    },
    {
      title: 'Reliability Score',
      value: '92%',
      subtitle: 'Overall vendor score',
      icon: 'bi bi-bar-chart-fill',
      trend: '+4% improvement',
    },
  ];

  recentActivities: Activity[] = [
    {
      title: 'New vendor registered',
      description: 'TechNova Solutions joined the platform.',
      time: '10 minutes ago',
      icon: 'bi bi-person-plus-fill',
    },
    {
      title: 'Contract approved',
      description: 'Annual Supply Agreement was approved.',
      time: '1 hour ago',
      icon: 'bi bi-check-circle-fill',
    },
    {
      title: 'Purchase order created',
      description: 'PO-2026-118 was created successfully.',
      time: '3 hours ago',
      icon: 'bi bi-cart-plus-fill',
    },
    {
      title: 'Vendor profile updated',
      description: 'Global Logistics updated company documents.',
      time: 'Yesterday',
      icon: 'bi bi-pencil-square',
    },
  ];

  expiringContracts: ExpiringContract[] = [
    {
      contractName: 'IT Support Agreement',
      vendorName: 'TechNova Solutions',
      expiryDate: '28 Jul 2026',
      daysLeft: 7,
      status: 'Urgent',
    },
    {
      contractName: 'Logistics Service Contract',
      vendorName: 'Global Logistics',
      expiryDate: '05 Aug 2026',
      daysLeft: 15,
      status: 'Upcoming',
    },
    {
      contractName: 'Office Supplies Contract',
      vendorName: 'Prime Office Mart',
      expiryDate: '12 Aug 2026',
      daysLeft: 22,
      status: 'Upcoming',
    },
  ];

  reliabilityScore = 92;
  onTimeDelivery = 89;
  contractCompliance = 95;
  qualityRating = 91;

  get reliabilityStatus(): string {
    const score = this.reliabilityScore;

    if (score >= 90) {
      return 'Excellent';
    } else if (score >= 75) {
      return 'Good';
    } else if (score >= 60) {
      return 'Average';
    } else {
      return 'High Risk';
    }
  }

  ngOnInit(): void {
    this.loadReliabilityDashboard();
    this.loadLoggedInUser();
    this.updateDateTime();

    this.clockInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  loadReliabilityDashboard(): void {
    this.reliabilityService.getDashboard().subscribe({
      next: (data) => {
        this.reliabilityScore = data.average_score;

        const reliabilityCard = this.dashboardCards.find(
          (card) => card.title === 'Reliability Score'
        );

        if (reliabilityCard) {
          reliabilityCard.value = `${this.reliabilityScore}%`;
        }
      },
      error: (error) => {
        console.error(
          'Failed to load reliability score',
          error
        );
      },
    });
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  loadLoggedInUser(): void {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      this.userName =
        user.name ||
        user.full_name ||
        user.email?.split('@')[0] ||
        'Admin';

      this.userEmail = user.email || 'admin@vendor.com';
    } catch (error) {
      console.error(
        'Unable to read user details',
        error
      );
    }
  }

  updateDateTime(): void {
    this.currentDateTime = new Date().toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
    );
  }

  refreshDashboard(): void {
    this.isRefreshing = true;
    this.updateDateTime();

    this.loadReliabilityDashboard();

    setTimeout(() => {
      this.isRefreshing = false;
    }, 200);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}