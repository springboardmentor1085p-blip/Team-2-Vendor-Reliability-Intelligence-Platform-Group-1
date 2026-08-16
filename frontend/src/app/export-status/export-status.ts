import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-status.html',
  styleUrl: './export-status.css'
})
export class ExportStatus {

  exportStatus = 'Processing';

  setCompleted() {
    this.exportStatus = 'Completed';
  }

  setFailed() {
    this.exportStatus = 'Failed';
  }

}