import { NgModule } from '@angular/core';

/* Angular Material Modules */
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

const MATERIAL_MODULES = [
  MatTableModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatPaginatorModule,
  MatSortModule,
  MatToolbarModule,
  MatCardModule,
  MatSnackBarModule,
  MatDialogModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatDividerModule,
  MatTooltipModule
];

@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES
})
export class MaterialModule {}