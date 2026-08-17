import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [BreadcrumbComponent, LoadingSpinnerComponent],
  imports: [CommonModule, RouterModule, MatCardModule, MatProgressSpinnerModule, MatIconModule],
  exports: [BreadcrumbComponent, LoadingSpinnerComponent, MatCardModule, MatIconModule],
})
export class SharedModule {}
