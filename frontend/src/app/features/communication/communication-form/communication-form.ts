import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommunicationService } from '../../../core/services/communication';
import { Communication } from '../../../core/models/communication.model';

@Component({
  selector: 'app-communication-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './communication-form.html',
  styleUrls: ['./communication-form.scss']
})
export class CommunicationForm {

  private fb = inject(FormBuilder);
  private communicationService = inject(CommunicationService);

  communicationForm: FormGroup = this.fb.group({
    vendor_id: [0, Validators.required],
    subject: ['', Validators.required],
    message: ['', Validators.required],
    communication_type: ['Email', Validators.required],
    status: ['Sent'],
    communication_date: ['']
  });

  onSubmit(): void {

    if (this.communicationForm.invalid) {
      this.communicationForm.markAllAsTouched();
      return;
    }

    const communication = this.communicationForm.value as Communication;

    this.communicationService.createCommunication(communication).subscribe({
      next: () => {
        alert('Communication Created Successfully');
        this.communicationForm.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to create communication');
      }
    });

  }

}