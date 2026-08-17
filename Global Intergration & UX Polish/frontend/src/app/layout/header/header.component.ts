import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input()  showMenuButton = false;
  @Output() toggleDarkMode  = new EventEmitter<void>();
  @Output() toggleSidenav   = new EventEmitter<void>();

  notificationCount = 4;
  userName = 'Team C User';
}
