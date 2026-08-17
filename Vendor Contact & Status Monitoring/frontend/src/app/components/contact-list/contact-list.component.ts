import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VendorContactService } from '../../services/vendor-contact.service';
import { VendorContact, VendorProfile, VendorStatus } from '../../models/vendor-contact.model';
import { AddContactDialogComponent } from '../add-contact-dialog/add-contact-dialog.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatCardModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-title>Vendor Profile Dashboard</mat-card-title>
        <mat-card-content>
          <div *ngIf="profile">
            <p><strong>Name:</strong> {{ profile.name }}</p>
            <p><strong>Code:</strong> {{ profile.code }}</p>
            <p><strong>Category:</strong> {{ profile.category || 'N/A' }}</p>
            <p><strong>Status:</strong> <span class="status-chip" [ngClass]="profile.status === 'Active' ? 'status-active' : 'status-inactive'">{{ profile.status }}</span></p>
            <p><strong>Reliability Score:</strong> {{ profile.reliability_score }}</p>
          </div>
          <div *ngIf="status">
            <p><strong>Current Status:</strong> {{ status.status }}</p>
            <p><strong>Reliability Score:</strong> {{ status.reliability_score }}</p>
            <p><strong>Last Verified:</strong> {{ status.last_verified_at | date:'medium' }}</p>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card style="margin-top: 20px;">
        <mat-card-title>Contacts</mat-card-title>
        <mat-card-actions align="end">
          <button mat-raised-button color="primary" (click)="openDialog()">Add Contact</button>
        </mat-card-actions>
        <mat-card-content>
          <table mat-table [dataSource]="contacts" class="mat-elevation-z0 full-width">
            <ng-container matColumnDef="contact_name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let c">{{ c.contact_name }}</td>
            </ng-container>
            <ng-container matColumnDef="designation">
              <th mat-header-cell *matHeaderCellDef>Designation</th>
              <td mat-cell *matCellDef="let c">{{ c.designation }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let c">{{ c.email }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let c">{{ c.phone }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let c">
                <button mat-button color="primary" (click)="editContact(c)">Edit</button>
                <button mat-button color="warn" (click)="deleteContact(c.id)">Delete</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ContactListComponent implements OnInit {
  displayedColumns = ['contact_name', 'designation', 'email', 'phone', 'actions'];
  contacts: VendorContact[] = [];
  profile: VendorProfile | null = null;
  status: VendorStatus | null = null;
  vendorId = 1;

  constructor(
    private vendorService: VendorContactService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.vendorService.getVendorProfile(this.vendorId).subscribe({
      next: (profile) => (this.profile = profile),
      error: () => this.showMessage('Unable to load vendor profile'),
    });

    this.vendorService.getVendorStatus(this.vendorId).subscribe({
      next: (status) => (this.status = status),
      error: () => this.showMessage('Unable to load vendor status'),
    });

    this.vendorService.getContacts(this.vendorId).subscribe({
      next: (contacts) => (this.contacts = contacts),
      error: () => this.showMessage('Unable to load contacts'),
    });
  }

  openDialog(contact?: VendorContact): void {
    const dialogRef = this.dialog.open(AddContactDialogComponent, { width: '480px', data: contact || null });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      if (contact) {
        this.vendorService.updateContact(contact.id, result).subscribe({
          next: () => {
            this.showMessage('Contact updated successfully');
            this.loadData();
          },
          error: () => this.showMessage('Failed to update contact'),
        });
      } else {
        this.vendorService.addContact(this.vendorId, result).subscribe({
          next: () => {
            this.showMessage('Contact added successfully');
            this.loadData();
          },
          error: () => this.showMessage('Failed to add contact'),
        });
      }
    });
  }

  editContact(contact: VendorContact): void {
    this.openDialog(contact);
  }

  deleteContact(contactId: number): void {
    this.vendorService.deleteContact(contactId).subscribe({
      next: () => {
        this.showMessage('Contact deleted successfully');
        this.loadData();
      },
      error: () => this.showMessage('Failed to delete contact'),
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
