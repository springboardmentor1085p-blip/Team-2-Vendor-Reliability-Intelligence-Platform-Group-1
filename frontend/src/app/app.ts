import { Component } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { Chat } from './chat/chat';
import { NotificationSettings } from './notification-settings/notification-settings';
import { ExportStatus } from './export-status/export-status';
import { SharedChart } from './shared-chart/shared-chart';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Chat,
    NotificationSettings,
    ExportStatus,
    SharedChart
  ],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}