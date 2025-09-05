import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';

import { PackageService } from '../../services/package.service';
import { Package, PackageService as IPackageService } from '../../models/package.model';

interface Client {
  id: number;
  name: string;
  phone: string;
  gender: 'Male' | 'Female';
  email?: string;
}

interface AppointmentSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-appointment',
  standalone: false,
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit, OnDestroy {
  appointmentForm!: FormGroup;
  packages: Package[] = [];
  selectedPackage?: Package;
  availableSlots: AppointmentSlot[] = [];
  clients: Client[] = [];
  filteredClients!: Observable<Client[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
    this.loadMockClients();
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.loadPackages();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      clientId: ['', Validators.required],
      clientName: [''],
      packageId: [''],
      selectedServices: this.fb.array([]),
      isPackageAppointment: [false],
      notes: [''],
      totalAmount: [0]
    });
  }

  private setupFormSubscriptions(): void {
    // Watch package selection
    this.appointmentForm.get('packageId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(packageId => {
        if (packageId) {
          this.onPackageSelected(packageId);
        } else {
          this.clearSelectedPackage();
        }
      });

    // Watch client selection
    this.appointmentForm.get('clientId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(clientId => {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
          this.appointmentForm.patchValue({
            clientName: client.name
          });
          this.filterPackagesByGender(client.gender);
        }
      });

    // Client name autocomplete
    this.filteredClients = this.appointmentForm.get('clientName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterClients(value || ''))
    );
  }

  private loadPackages(): void {
    // Load both pre-paid and post-paid packages
    this.packageService.getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(packages => {
        this.packages = packages.filter(pkg => pkg.isActive);
      });
  }

  private loadMockClients(): void {
    this.clients = [
      { id: 1, name: 'John Doe', phone: '9876543210', gender: 'Male', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', phone: '9876543211', gender: 'Female', email: 'jane@example.com' },
      { id: 3, name: 'Alice Johnson', phone: '9876543212', gender: 'Female', email: 'alice@example.com' },
      { id: 4, name: 'Bob Wilson', phone: '9876543213', gender: 'Male', email: 'bob@example.com' }
    ];
  }

  private generateTimeSlots(): void {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: time,
          available: Math.random() > 0.3 // Random availability for demo
        });
      }
    }
    this.availableSlots = slots;
  }

  private _filterClients(value: string): Client[] {
    const filterValue = value.toLowerCase();
    return this.clients.filter(client => 
      client.name.toLowerCase().includes(filterValue) ||
      client.phone.includes(filterValue)
    );
  }

  private filterPackagesByGender(gender: 'Male' | 'Female'): void {
    // This would filter packages based on availableFor field
    // For now, just showing all packages
  }

  get selectedServicesFormArray(): FormArray {
    return this.appointmentForm.get('selectedServices') as FormArray;
  }

  onPackageSelected(packageId: number): void {
    const pkg = this.packages.find(p => p.id === packageId);
    if (pkg) {
      this.selectedPackage = pkg;
      this.appointmentForm.patchValue({
        isPackageAppointment: true
      });
      this.initializePackageServices(pkg);
      this.calculateTotal();
    }
  }

  private clearSelectedPackage(): void {
    this.selectedPackage = undefined;
    this.appointmentForm.patchValue({
      isPackageAppointment: false
    });
    this.clearSelectedServices();
    this.calculateTotal();
  }

  private initializePackageServices(pkg: Package): void {
    const servicesArray = this.selectedServicesFormArray;
    servicesArray.clear();

    pkg.services.forEach((service, index) => {
      const isPreSelected = pkg.packageType === 'Fixed';
      const serviceGroup = this.fb.group({
        serviceId: [service.serviceId],
        serviceName: [service.serviceName],
        rate: [service.rate],
        sequenceNumber: [service.sequenceNumber],
        isSelected: [isPreSelected]
      });

      servicesArray.push(serviceGroup);
    });
  }

  private clearSelectedServices(): void {
    const servicesArray = this.selectedServicesFormArray;
    servicesArray.clear();
  }

  onServiceToggle(index: number): void {
    if (!this.selectedPackage) return;

    const serviceControl = this.selectedServicesFormArray.at(index);
    const isCurrentlySelected = serviceControl.get('isSelected')?.value;
    const newValue = !isCurrentlySelected;

    // Check for customizable package limits
    if (this.selectedPackage.packageType === 'Customizable' && newValue) {
      const selectedCount = this.getSelectedServicesCount();
      const maxSelectable = this.selectedPackage.maxSelectableServices || 0;

      if (selectedCount >= maxSelectable) {
        this.showDialog(
          'Maximum Services Selected',
          'Maximum number of services are availed, you cannot select more.',
          ['OK']
        );
        return;
      }
    }

    // Check for parallel booking warning
    if (this.selectedPackage.isBookedInParallel && !newValue && this.getSelectedServicesCount() > 1) {
      this.showDialog(
        'Parallel Booking Warning',
        'Remaining services will lapse if not availed in this appointment.',
        ['Continue', 'Cancel']
      ).then(result => {
        if (result === 'Continue') {
          serviceControl.get('isSelected')?.setValue(newValue);
          this.calculateTotal();
        }
      });
    } else {
      serviceControl.get('isSelected')?.setValue(newValue);
      this.calculateTotal();
    }

    // Check minimum selection for customizable packages
    if (this.selectedPackage.packageType === 'Customizable' && !newValue) {
      const selectedCount = this.getSelectedServicesCount();
      const minSelectable = this.selectedPackage.minSelectableServices || 1;

      if (selectedCount < minSelectable) {
        this.showMessage(`Minimum ${minSelectable} services must be selected.`, 'error');
        serviceControl.get('isSelected')?.setValue(true);
        return;
      }
    }
  }

  getSelectedServicesCount(): number {
    return this.selectedServicesFormArray.controls
      .filter(control => control.get('isSelected')?.value).length;
  }

  private calculateTotal(): void {
    let total = 0;
    if (this.selectedPackage) {
      this.selectedServicesFormArray.controls.forEach(control => {
        if (control.get('isSelected')?.value) {
          total += control.get('rate')?.value || 0;
        }
      });
    }
    this.appointmentForm.patchValue({ totalAmount: total });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;

      // Validate service selection for packages
      if (this.selectedPackage) {
        const selectedCount = this.getSelectedServicesCount();

        if (selectedCount === 0) {
          this.showMessage('Please select at least one service.', 'error');
          return;
        }

        if (this.selectedPackage.packageType === 'Customizable') {
          const min = this.selectedPackage.minSelectableServices || 1;
          const max = this.selectedPackage.maxSelectableServices || 999;

          if (selectedCount < min || selectedCount > max) {
            this.showMessage(`Please select between ${min} and ${max} services.`, 'error');
            return;
          }
        }
      }

      // Process appointment booking
      this.processAppointment(formValue);
    } else {
      this.showMessage('Please fill all required fields.', 'error');
      this.markFormGroupTouched();
    }
  }

  private processAppointment(appointmentData: any): void {
    // Simulate appointment booking
    console.log('Booking appointment:', appointmentData);
    this.showMessage('Appointment booked successfully!', 'success');
    this.resetForm();
  }

  resetForm(): void {
    this.appointmentForm.reset();
    this.selectedPackage = undefined;
    this.clearSelectedServices();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      const control = this.appointmentForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

  private showDialog(title: string, message: string, buttons: string[]): Promise<string> {
    return new Promise((resolve) => {
      // Simulate dialog - in real app would use MatDialog
      const result = confirm(`${title}

${message}`);
      resolve(result ? buttons[0] : buttons[1] || buttons[0]);
    });
  }

  // Template helper methods
  getAvailablePackages(): Package[] {
    const clientId = this.appointmentForm.get('clientId')?.value;
    if (!clientId) return this.packages;

    const client = this.clients.find(c => c.id === clientId);
    if (!client) return this.packages;

    return this.packages.filter(pkg => 
      pkg.availableFor === 'All' || 
      (pkg.availableFor === 'Males' && client.gender === 'Male') ||
      (pkg.availableFor === 'Females' && client.gender === 'Female')
    );
  }

  getAvailableTimeSlots(): AppointmentSlot[] {
    return this.availableSlots.filter(slot => slot.available);
  }

  isServiceDisabled(index: number): boolean {
    if (!this.selectedPackage) return false;

    const serviceControl = this.selectedServicesFormArray.at(index);
    const isSelected = serviceControl.get('isSelected')?.value;

    if (this.selectedPackage.packageType === 'Customizable' && !isSelected) {
      const selectedCount = this.getSelectedServicesCount();
      const maxSelectable = this.selectedPackage.maxSelectableServices || 0;
      return selectedCount >= maxSelectable;
    }

    return false;
  }

  displayClientFn(client: Client): string {
    return client ? `${client.name} (${client.phone})` : '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}