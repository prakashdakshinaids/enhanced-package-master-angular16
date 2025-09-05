import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PackageService } from '../../services/package.service';
import { Package } from '../../models/package.model';

@Component({
  selector: 'app-package-listing',
  templateUrl: './package-listing.component.html',
  styleUrls: ['./package-listing.component.scss'],
  standalone: false,
})
export class PackageListingComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'name', 
    'services', 
    'validity', 
    'extensionRule', 
    'sharer', 
    'packageType', 
    'bookedInParallel', 
    'gender', 
    'rate', 
    'paymentType', 
    'followSequence',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<Package>();
  private destroy$ = new Subject<void>();

  constructor(
    private packageService: PackageService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadPackages(): void {
    this.packageService.getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(packages => {
        this.dataSource.data = packages;
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onCreateNew(): void {
    this.router.navigate(['/package/new']);
  }

  onEdit(packageId: number): void {
    this.router.navigate(['/package/edit', packageId]);
  }

  onDelete(packageId: number): void {
    if (confirm('Are you sure you want to delete this package?')) {
      this.packageService.deletePackage(packageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Package deleted successfully!');
            this.loadPackages();
          },
          error: () => {
            this.showMessage('Error deleting package. Please try again.', 'error');
          }
        });
    }
  }

  onToggleStatus(pkg: Package): void {
    const updatedPackage = { ...pkg, isActive: !pkg.isActive };
    this.packageService.updatePackage(pkg.id!, updatedPackage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage(`Package ${updatedPackage.isActive ? 'activated' : 'deactivated'} successfully!`);
          this.loadPackages();
        },
        error: () => {
          this.showMessage('Error updating package status.', 'error');
        }
      });
  }

  getServiceNames(pkg: Package): string {
    return pkg.services.map(s => s.serviceName).join(', ');
  }

  getExtensionRule(pkg: Package): string {
    const fee = pkg.isComplimentaryExtension ? 'Free' : `₹${pkg.extensionFee}`;
    return `${fee} (Max: ${pkg.maxExtensions})`;
  }

  getPackageTypeDisplay(pkg: Package): string {
    if (pkg.packageType === 'Customizable') {
      return `Customizable (${pkg.minSelectableServices}-${pkg.maxSelectableServices})`;
    }
    return 'Fixed';
  }

  getTotalRate(pkg: Package): number {
    return pkg.services.reduce((total, service) => total + service.rate, 0);
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

  // Utility methods for template
  formatServices(services: any[]): string {
    if (services.length <= 2) {
      return services.map(s => s.serviceName).join(', ');
    }
    return `${services.slice(0, 2).map(s => s.serviceName).join(', ')} +${services.length - 2} more`;
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}