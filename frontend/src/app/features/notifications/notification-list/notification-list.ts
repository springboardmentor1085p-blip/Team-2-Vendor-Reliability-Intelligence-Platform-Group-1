import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.scss',
})
export class NotificationList {

  notifications = [

    {
      id: 1,
      title: 'Vendor Approved',
      message: 'ABC Technologies has been approved.',
      priority: 'High',
      time: '5 mins ago',
      read: false
    },

    {
      id: 2,
      title: 'Purchase Order Created',
      message: 'PO-1024 has been generated successfully.',
      priority: 'Medium',
      time: '30 mins ago',
      read: false
    },

    {
      id: 3,
      title: 'Contract Expiring',
      message: 'XYZ Solutions contract expires in 15 days.',
      priority: 'High',
      time: '1 hour ago',
      read: true
    },

    {
      id: 4,
      title: 'Risk Score Updated',
      message: 'Vendor reliability score recalculated.',
      priority: 'Low',
      time: 'Yesterday',
      read: true
    }

  ];

  markAsRead(notification: any) {

    notification.read = true;

  }

  deleteNotification(id: number) {

    if (confirm('Delete this notification?')) {

      this.notifications =
        this.notifications.filter(n => n.id !== id);

    }

  }

}