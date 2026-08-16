import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-settings.html',
  styleUrl: './notification-settings.css'
})
export class NotificationSettings implements OnInit {

  email_notifications = false;
  sms_notifications = false;
  push_notifications = false;

  constructor(private notificationService: NotificationService) {}
 ngOnInit(): void {
  this.notificationService.getSettings().subscribe((data: any) => {
    this.email_notifications = data.email_notifications;
    this.sms_notifications = data.sms_notifications;
    this.push_notifications = data.push_notifications;
  });
}

  saveSettings() {
    alert('Preferences Saved Successfully');
  }
}