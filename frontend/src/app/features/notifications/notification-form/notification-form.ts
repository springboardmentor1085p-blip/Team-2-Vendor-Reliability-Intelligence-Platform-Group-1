import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Notification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './notification-form.html',
  styleUrl: './notification-form.scss'
})
export class NotificationForm {

  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isSaving = false;

  notification: Notification = {

    title: '',

    message: '',

    recipient: '',

    notification_type: '',

    status: 'Unread'

  };

  saveNotification(): void {

    this.isSaving = true;

    this.notificationService.createNotification(this.notification).subscribe({

      next: () => {

        alert('Notification Created Successfully');

        this.router.navigate(['/notifications']);

      },

      error: err => {

        console.error(err);

        this.isSaving = false;

      }

    });

  }

}