import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  isMobile = false;
  isDarkMode = false;

  private sub!: Subscription;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.sub = this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }
}
