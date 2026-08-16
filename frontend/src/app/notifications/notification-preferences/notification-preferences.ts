import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-preferences.html',
  styleUrl: './notification-preferences.css'
})
export class NotificationPreferences {

  email: boolean = true;
  push: boolean = true;
  sms: boolean = false;

  constructor(private http: HttpClient) {}

  save() {

    const data = {
      user_id: 1,
      email_notifications: this.email,
      system_notifications: this.push
    };

    this.http.put(
      'http://127.0.0.1:8000/preferences/1',
      data
    ).subscribe({
      next: () => {
        alert('Preferences Saved Successfully');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to Save Preferences');
      }
    });

  }

}