import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { VendorAnalyticsService } from '../../services/vendor-analytics.service';

import { Chart, registerables } from 'chart.js';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);



@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-analytics.html',
  styleUrls: ['./vendor-analytics.css']
})
export class VendorAnalyticsComponent implements OnInit {

  vendorData: any[] = [];
  trendData: any[] = [];
  filteredOrders: any[] = [];
  originalOrders:any[] = [];
  allOrders: any[] = [];
  auditLogs: any[] = [];
  
  totalOrders = 0;
  pendingOrders = 0; 
  deliveredOrders = 0; 
  unreadOrders = 0;
  fromDate = '';
  toDate = '';

  constructor( private analyticsService: VendorAnalyticsService, private poService: PurchaseOrderService, private router: Router, private cdr: ChangeDetectorRef ) {}

  lastArchive: any = null; 

  ngOnInit(): void {

  this.loadVendorReliability();
  this.loadHistoricalTrends();
  this.loadOrderCounts();
  this.loadAuditLogs();

  // auto refresh every 5 seconds
  setInterval(() => {
    this.loadAuditLogs();
  }, 5000);
}
  loadVendorReliability(): void {

    this.analyticsService
      .getVendorReliability()
      .subscribe({

        next: (data: any[]) => {

          console.log(data);

          this.vendorData = [...data];

          this.cdr.detectChanges();

        },

        error: (err: any) => {

          console.error(err);

        }

      });

  }

  loadAuditLogs(): void {

  this.analyticsService.getAuditLogs().subscribe({

    next: (data: any[]) => {

      console.log('Audit Logs', data);

      this.auditLogs = [...data];

      this.cdr.detectChanges();

    },

    error: (err: any) => {

      console.error(err);

    }

  });

}

openOrder(id:number):void{ this.router.navigate(['/purchase-order',id]); }

  applyDateFilter(): void {

  if (!this.fromDate || !this.toDate) return;

  const from = new Date(this.fromDate);
  const to = new Date(this.toDate);
  to.setHours(23,59,59,999);

  this.filteredOrders = this.originalOrders.filter((o:any) => {
    const d = new Date(o.target_date);
    return d >= from && d <= to;
  });

  // Update cards
  this.totalOrders = this.filteredOrders.length;
  this.pendingOrders = this.filteredOrders.filter(
    x => x.status?.toLowerCase().includes('pending')
  ).length;

  this.deliveredOrders = this.filteredOrders.filter(
    x => x.status?.toLowerCase() === 'delivered'
  ).length;

  // Update vendor table
  const map = new Map<string, any[]>();

  this.filteredOrders.forEach((o:any)=>{
    if(!map.has(o.vendor_name)) map.set(o.vendor_name,[]);
    map.get(o.vendor_name)!.push(o);
  });

  this.vendorData = Array.from(map.entries()).map(([vendor,orders])=>({
    vendor,
    total_orders: orders.length,
    reliability_score: Math.round(
      orders.reduce((s,o)=>
        s + (o.status==='Delivered'?100:
             o.status==='In Progress'?70:
             o.status?.includes('Pending')?40:50),0
      ) / orders.length
    )
  }));

  // Update chart
  this.trendData = this.filteredOrders.map((o:any)=>({
    month: o.target_date,
    total_orders: 1,
    delivered_orders: o.status==='Delivered'?1:0
  }));

  this.createTrendChart();
  this.cdr.detectChanges();
}
  loadOrderCounts(): void { 
    this.poService.getAllPurchaseOrders().subscribe((data: any[]) => {
      this.allOrders = data; 
      this.originalOrders = [...data];
      this.filteredOrders = [...data];
      this.totalOrders = data.length; 
      this.pendingOrders = data.filter(o => 
        o.status?.trim().toLowerCase() === ('pending') 
      ).length; 
      this.deliveredOrders = data.filter(o => 
        o.status?.toLowerCase() === 'delivered' 
      ).length; 
      this.unreadOrders = 0;
      this.filteredOrders = [...data]; 
      this.cdr.detectChanges(); 
    }); 
  }

  loadHistoricalTrends(): void { this.analyticsService .getHistoricalTrends(this.fromDate, this.toDate) .subscribe({ next: (data: any[]) => { this.trendData = data; setTimeout(() => { this.createTrendChart(); }, 100); }, error: (err: any) => { console.error(err); } }); }

 createTrendChart(): void { 
  const canvas = document.getElementById('trendChart') as HTMLCanvasElement | null; 
  if (!canvas) { return; } Chart.getChart(canvas)?.destroy(); 
  new Chart(canvas, { type: 'line', 
    data: { labels: this.trendData.map(x => x.month), 
      datasets: [ { label: 'Total', data: this.trendData.map(x => x.total_orders), borderColor: '#2563EB', backgroundColor: '#2563EB22', tension: 0.35 }, { label: 'Delivered', data: this.trendData.map(x => x.delivered_orders), borderColor: '#059669', backgroundColor: '#05966922', tension: 0.35 }, { label: 'Pending', data: this.trendData.map(x => x.pending_orders), borderColor: '#F59E0B', backgroundColor: '#F59E0B22', tension: 0.35 }, { label: 'In Progress', data: this.trendData.map(x => x.in_progress_orders), borderColor: '#EA580C', backgroundColor: '#EA580C22', tension: 0.35 }, { label: 'Approved', data: this.trendData.map(x => x.approved_orders), borderColor: '#7C3AED', backgroundColor: '#7C3AED22', tension: 0.35 }, { label: 'Cancelled', data: this.trendData.map(x => x.cancelled_orders), borderColor: '#64748B', backgroundColor: '#64748B22', tension: 0.35 } ]
    }, options: { responsive: true, plugins: { legend: { position: 'top' } } } }); }

  getBadgeClass(score: number): string {

    if (score >= 90) return 'bg-success';

    if (score >= 70) return 'bg-warning text-dark';

    return 'bg-danger';

  }

  archiveCurrentPeriod(): void { const archived = { archivedAt: new Date().toISOString(), fromDate: this.fromDate, toDate: this.toDate, totalOrders: this.totalOrders, deliveredOrders: this.deliveredOrders, vendors: this.vendorData }; const existing = JSON.parse(localStorage.getItem('archives') || '[]'); existing.unshift(archived); localStorage.setItem( 'archives', JSON.stringify(existing) ); alert('Current period archived successfully'); }

  showArchives():void{

const archives=
JSON.parse(localStorage.getItem('archives')||'[]');

if(archives.length===0){

alert('No archives found');

return;

}

let text='ARCHIVE HISTORY';

archives.forEach((a:any,index:number)=>{

text+=`#${index+1}
From: ${a.fromDate || '-'}
To: ${a.toDate || '-'}
Orders: ${a.totalOrders}
Delivered: ${a.deliveredOrders}
Archived: ${new Date(a.archivedAt).toLocaleString()}`;

});

alert(text);

}

  exportCSV(): void { const rows = [ ['Vendor','Total Orders','Reliability Score'], ...this.vendorData.map(v=>[ v.vendor, v.total_orders, v.reliability_score ]) ]; const csv = rows.map(r=>r.join(',')).join(' '); const blob = new Blob([csv], {type:'text/csv'}); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'vendor-reliability.csv'; a.click(); window.URL.revokeObjectURL(url); }

  archivePeriod(): void {
  alert('Historical performance archived successfully');
}

  openVendor(vendorName: string): void { console.log('Open Vendor:', vendorName); this.router.navigate(['/purchase-orders'], { queryParams: { vendor: vendorName } }); } goToAllOrders(): void { this.router.navigate(['/purchase-orders']); } goToPendingOrders(): void { this.router.navigate(['/orders/status/Pending']); } goToDeliveredOrders(): void { this.router.navigate(['/orders/status/Delivered']); }
}