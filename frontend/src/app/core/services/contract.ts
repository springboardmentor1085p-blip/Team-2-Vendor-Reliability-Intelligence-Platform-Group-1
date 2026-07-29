import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract } from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/contracts';

  getAllContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.apiUrl);
  }

  getContractById(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/${id}`);
  }

  createContract(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(this.apiUrl, contract);
  }

  updateContract(id: number, contract: Contract): Observable<Contract> {
    return this.http.put<Contract>(`${this.apiUrl}/${id}`, contract);
  }

  deleteContract(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}