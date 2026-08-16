import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-notifications.html',
  styleUrl: './all-notifications.css'
})
export class AllNotificationsComponent implements OnInit {

  notifications: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {

    this.notificationService.getAllNotifications().subscribe({

      next: (data: any[]) => {

        this.notifications = [...data];

        this.notifications.sort((a, b) => b.id - a.id);

        console.log("ALL Notifications =", this.notifications);

        this.cdr.detectChanges();

      },

      error: (err) => {
        console.log(err);
      }

    });

  }

  openOrder(notification: any): void {

    this.notificationService.markAsRead(notification.id).subscribe();

    this.router.navigate([
      '/purchase-order',
      notification.purchase_order_id
    ]);

  }

}