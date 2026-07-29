import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Communication } from '../../../core/models/communication.model';
import { CommunicationService } from '../../../core/services/communication';

@Component({
  selector: 'app-communication-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './communication-list.html',
  styleUrls: ['./communication-list.scss']
})
export class CommunicationList implements OnInit {

  private communicationService = inject(CommunicationService);

  communications: Communication[] = [];

  ngOnInit(): void {
    this.loadCommunications();
  }

  loadCommunications(): void {
    this.communicationService.getAllCommunications().subscribe({
      next: (data) => {
        this.communications = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteCommunication(id: number): void {

    if (!confirm('Delete this communication?')) {
      return;
    }

    this.communicationService.deleteCommunication(id).subscribe({
      next: () => {
        this.loadCommunications();
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

}