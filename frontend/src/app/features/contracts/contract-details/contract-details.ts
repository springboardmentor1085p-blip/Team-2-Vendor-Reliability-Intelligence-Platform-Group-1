import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Contract } from '../../../core/models/contract.model';
import { ContractService } from '../../../core/services/contract';

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './contract-details.html',
  styleUrls: ['./contract-details.scss']
})
export class ContractDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private contractService = inject(ContractService);

  contract?: Contract;

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.contractService.getContractById(id).subscribe({
        next: (data) => {
          this.contract = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
    }

  }

}