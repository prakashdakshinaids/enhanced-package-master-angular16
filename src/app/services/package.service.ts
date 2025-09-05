import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Package, Service, Outlet } from '../models/package.model';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private packagesSubject = new BehaviorSubject<Package[]>([]);
  public packages$ = this.packagesSubject.asObservable();

  // Mock data for services
  private mockServices: Service[] = [
    { id: 1, name: 'Full Body Massage', baseRate: 2500, category: 'Massage', isActive: true },
    { id: 2, name: 'Facial Treatment', baseRate: 1500, category: 'Facial', isActive: true },
    { id: 3, name: 'Body Scrub', baseRate: 1200, category: 'Body Treatment', isActive: true },
    { id: 4, name: 'Manicure', baseRate: 800, category: 'Hand Care', isActive: true },
    { id: 5, name: 'Pedicure', baseRate: 900, category: 'Foot Care', isActive: true },
    { id: 6, name: 'Hair Spa', baseRate: 2000, category: 'Hair Care', isActive: true },
    { id: 7, name: 'Aromatherapy', baseRate: 3000, category: 'Therapy', isActive: true },
    { id: 8, name: 'Steam Bath', baseRate: 500, category: 'Bath', isActive: true }
  ];

  // Mock data for outlets
  private mockOutlets: Outlet[] = [
    { id: 1, name: 'Downtown Spa', location: 'Downtown', isActive: true },
    { id: 2, name: 'Mall Branch', location: 'Shopping Mall', isActive: true },
    { id: 3, name: 'Airport Branch', location: 'Airport', isActive: true }
  ];

  constructor() {
    this.loadMockPackages();
  }

  // Get all packages
  getPackages(): Observable<Package[]> {
    return this.packages$;
  }

  // Get package by ID
  getPackageById(id: number): Observable<Package | undefined> {
    const packages = this.packagesSubject.value;
    return of(packages.find(pkg => pkg.id === id));
  }

  // Create new package
  createPackage(packageData: Package): Observable<Package> {
    const packages = this.packagesSubject.value;
    const newId = Math.max(...packages.map(p => p.id || 0), 0) + 1;
    const newPackage: Package = { ...packageData, id: newId, createdDate: new Date() };

    this.packagesSubject.next([...packages, newPackage]);
    return of(newPackage);
  }

  // Update package
  updatePackage(id: number, packageData: Package): Observable<Package> {
    const packages = this.packagesSubject.value;
    const index = packages.findIndex(p => p.id === id);

    if (index !== -1) {
      packages[index] = { ...packageData, id };
      this.packagesSubject.next([...packages]);
      return of(packages[index]);
    }

    throw new Error('Package not found');
  }

  // Delete package
  deletePackage(id: number): Observable<boolean> {
    const packages = this.packagesSubject.value;
    const filteredPackages = packages.filter(p => p.id !== id);
    this.packagesSubject.next(filteredPackages);
    return of(true);
  }

  // Get available services
  getServices(): Observable<Service[]> {
    return of(this.mockServices);
  }

  // Get available outlets
  getOutlets(): Observable<Outlet[]> {
    return of(this.mockOutlets);
  }

  // Get prepaid packages for counter sale
  getPrepaidPackages(): Observable<Package[]> {
    const packages = this.packagesSubject.value;
    return of(packages.filter(pkg => pkg.paymentType === 'Pre-paid' && pkg.isActive));
  }

  // Get postpaid packages
  getPostpaidPackages(): Observable<Package[]> {
    const packages = this.packagesSubject.value;
    return of(packages.filter(pkg => pkg.paymentType === 'Post-paid' && pkg.isActive));
  }

  private loadMockPackages(): void {
    const mockPackages: Package[] = [
      {
        id: 1,
        name: 'Premium Spa Package',
        description: 'Complete spa experience',
        validity: 90,
        isBookedInParallel: false,
        availableFor: 'All',
        applyForAllOutlets: true,
        packageType: 'Fixed',
        extensionFee: 500,
        isComplimentaryExtension: false,
        maxExtensions: 2,
        availableDurations: [15, 30, 60],
        renewalType: 'Manual',
        paymentType: 'Pre-paid',
        isSharerPackage: false,
        followSequence: true,
        services: [
          { id: 1, serviceId: 1, serviceName: 'Full Body Massage', sequenceNumber: 1, rate: 2500 },
          { id: 2, serviceId: 2, serviceName: 'Facial Treatment', sequenceNumber: 2, rate: 1500 },
          { id: 3, serviceId: 3, serviceName: 'Body Scrub', sequenceNumber: 3, rate: 1200 }
        ],
        outlets: [],
        createdDate: new Date(),
        isActive: true
      },
      {
        id: 2,
        name: 'Customizable Wellness Package',
        description: 'Choose your own services',
        validity: 60,
        isBookedInParallel: false,
        availableFor: 'Females',
        applyForAllOutlets: false,
        packageType: 'Customizable',
        minSelectableServices: 3,
        maxSelectableServices: 5,
        extensionFee: 0,
        isComplimentaryExtension: true,
        maxExtensions: 1,
        availableDurations: [30, 60],
        renewalType: 'Auto',
        paymentType: 'Post-paid',
        isSharerPackage: true,
        followSequence: false,
        services: [
          { id: 4, serviceId: 1, serviceName: 'Full Body Massage', sequenceNumber: 1, rate: 2200 },
          { id: 5, serviceId: 2, serviceName: 'Facial Treatment', sequenceNumber: 2, rate: 1300 },
          { id: 6, serviceId: 4, serviceName: 'Manicure', sequenceNumber: 3, rate: 700 },
          { id: 7, serviceId: 5, serviceName: 'Pedicure', sequenceNumber: 4, rate: 800 },
          { id: 8, serviceId: 6, serviceName: 'Hair Spa', sequenceNumber: 5, rate: 1800 }
        ],
        outlets: [],
        createdDate: new Date(),
        isActive: true
      }
    ];

    this.packagesSubject.next(mockPackages);
  }
}