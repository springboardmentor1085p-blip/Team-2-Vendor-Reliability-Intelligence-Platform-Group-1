import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Communication } from '../../../core/models/communication.model';
import { CommunicationService } from '../../../core/services/communication';

@Component({
  selector: 'app-communication-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './communication-details.html',
  styleUrls: ['./communication-details.scss']
})
export class CommunicationDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private communicationService = inject(CommunicationService);

  communication?: Communication;

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.communicationService.getCommunicationById(id).subscribe({
        next: (data) => {
          this.communication = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
    }

  }

}