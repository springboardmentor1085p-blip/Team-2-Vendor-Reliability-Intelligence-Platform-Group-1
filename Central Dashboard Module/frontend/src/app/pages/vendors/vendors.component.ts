import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { VendorService } from '../../services/vendor.service';
import {
  Vendor, VendorDetail, VendorStats,
  VENDOR_CATEGORIES, VENDOR_STATUSES,
} from '../../models/vendor.model';

@Component({
  selector: 'app-vendors',
  standalone: true,
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe, CurrencyPipe, DecimalPipe,
    MatButtonModule, MatIconModule, MatTableModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule, MatSnackBarModule,
    SidebarComponent, TopbarComponent,
  ],
})
export class VendorsComponent implements OnInit {
  sidebarCollapsed = signal(false);
  loading    = signal(false);
  addLoading = signal(false);
  showAddDialog = signal(false);

  vendors       = signal<Vendor[]>([]);
  stats         = signal<VendorStats | null>(null);
  selectedVendor = signal<Vendor | null>(null);
  detailData    = signal<VendorDetail | null>(null);

  searchCtrl   = new FormControl('');
  categoryCtrl = new FormControl('');
  statusCtrl   = new FormControl('');

  categories = VENDOR_CATEGORIES;
  statuses   = VENDOR_STATUSES;

  columns = ['name', 'category', 'contact', 'score', 'status', 'created_at', 'actions'];

  addForm!: FormGroup;

  // Computed filtered list
  filtered = computed(() => {
    const search = (this.searchCtrl.value ?? '').toLowerCase();
    const cat    = this.categoryCtrl.value ?? '';
    const status = this.statusCtrl.value ?? '';

    return this.vendors().filter(v => {
      const matchSearch = !search ||
        v.name.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search) ||
        (v.contact_person ?? '').toLowerCase().includes(search);
      const matchCat    = !cat    || v.category === cat;
      const matchStatus = !status || v.status   === status;
      return matchSearch && matchCat && matchStatus;
    });
  });

  constructor(
    private vendorSvc: VendorService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.addForm = this.fb.group({
      name:           ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      category:       ['', Validators.required],
      phone:          [''],
      contact_person: [''],
      website:        [''],
      address:        [''],
      tax_id:         [''],
    });

    this.loadAll();

    // Re-filter on input change (client-side only)
    this.searchCtrl.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(() => {});
    this.categoryCtrl.valueChanges.subscribe(() => {});
    this.statusCtrl.valueChanges.subscribe(() => {});
  }

  loadAll(): void {
    this.loading.set(true);
    this.vendorSvc.list({ limit: 500 }).subscribe({
      next: vs => { this.vendors.set(vs); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Failed to load vendors', 'Close', { duration: 3000 }); },
    });
    this.vendorSvc.getStats().subscribe({ next: s => this.stats.set(s) });
  }

  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.categoryCtrl.setValue('');
    this.statusCtrl.setValue('');
  }

  openAddDialog(): void { this.addForm.reset(); this.showAddDialog.set(true); }
  closeDialog():    void { this.showAddDialog.set(false); }

  submitAdd(): void {
    this.addForm.markAllAsTouched();
    if (this.addForm.invalid) return;
    this.addLoading.set(true);
    this.vendorSvc.create(this.addForm.value).subscribe({
      next: () => {
        this.addLoading.set(false);
        this.showAddDialog.set(false);
        this.snack.open('Vendor registered successfully', 'Close', { duration: 3000 });
        this.loadAll();
      },
      error: err => {
        this.addLoading.set(false);
        this.snack.open(err?.error?.detail ?? 'Failed to add vendor', 'Close', { duration: 4000 });
      },
    });
  }

  viewDetail(v: Vendor): void {
    this.selectedVendor.set(v);
    this.detailData.set(null);
    this.vendorSvc.getDetail(v.id).subscribe({ next: d => this.detailData.set(d) });
  }

  doAction(action: 'approve' | 'suspend' | 'reject', v: Vendor): void {
    const call = action === 'approve' ? this.vendorSvc.approve(v.id)
               : action === 'suspend' ? this.vendorSvc.suspend(v.id)
               : this.vendorSvc.reject(v.id);

    call.subscribe({
      next: updated => {
        this.snack.open(`Vendor ${action}d successfully`, 'Close', { duration: 3000 });
        this.vendors.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.vendorSvc.getStats().subscribe({ next: s => this.stats.set(s) });
      },
      error: err => this.snack.open(err?.error?.detail ?? `Failed to ${action} vendor`, 'Close', { duration: 4000 }),
    });
  }

  recalcScore(id: number): void {
    this.vendorSvc.recalculateScore(id).subscribe({
      next: res => {
        this.snack.open(`Score updated: ${res.reliability_score}`, 'Close', { duration: 3000 });
        this.loadAll();
      },
    });
  }

  isInvalid(field: string): boolean {
    const c = this.addForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  scoreClass(s: number): string {
    return s >= 70 ? 'risk-low' : s >= 50 ? 'risk-medium' : 'risk-high';
  }

  statusBadge(status: string): string {
    const m: Record<string, string> = {
      approved: 'badge-success', pending: 'badge-warning',
      suspended: 'badge-danger', rejected: 'badge-danger', inactive: 'badge-default',
    };
    return m[status] ?? 'badge-default';
  }

  categoryLabel(val: string): string {
    return VENDOR_CATEGORIES.find(c => c.value === val)?.label ?? val;
  }

  avatarBg(category: string): string {
    const m: Record<string, string> = {
      raw_material: '#4f46e5', equipment: '#f59e0b', it: '#06b6d4',
      service: '#10b981', logistics: '#8b5cf6', maintenance: '#ef4444',
    };
    return m[category] ?? '#64748b';
  }
}
