import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PackageService } from '../../services/package.service';
import { ValidationService } from '../../services/validation.service';
import { Package, Service, Outlet, PackageService as IPackageService } from '../../models/package.model';

@Component({
  selector: 'app-package-master',
  templateUrl: './package-master.component.html',
  styleUrls: ['./package-master.component.scss'],
  standalone: false,
})
export class PackageMasterComponent implements OnInit, OnDestroy {
  packageForm!: FormGroup;
  services: Service[] = [];
  outlets: Outlet[] = [];
  isEditMode = false;
  packageId?: number;

  private destroy$ = new Subject<void>();

  genderOptions = [
    { value: 'All', label: 'All Genders' },
    { value: 'Females', label: 'Females Only' },
    { value: 'Males', label: 'Males Only' }
  ];

  durationOptions = [15, 30, 60, 90];
  selectedDurations: number[] = [];
  maxServicesSelected = false;

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadOutlets();
    this.checkEditMode();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.packageForm = this.fb.group({
      name: ['', [Validators.required, ValidationService.packageNameValidator()]],
      description: [''],
      validity: [30, [Validators.required, Validators.min(1)]],
      isBookedInParallel: [false],
      availableFor: ['All', Validators.required],
      applyForAllOutlets: [true],
      packageType: ['Fixed', Validators.required],
      minSelectableServices: [1, [Validators.min(1)]],
      maxSelectableServices: [5, [Validators.min(1)]],
      extensionFee: [0, [Validators.min(0)]],
      isComplimentaryExtension: [false],
      maxExtensions: [1, [Validators.min(0)]],
      renewalType: ['Manual', Validators.required],
      paymentType: ['Pre-paid', Validators.required],
      isSharerPackage: [false],
      followSequence: [false],
      services: this.fb.array([]),
      outlets: this.fb.array([]),
      isActive: [true]
    }, {
      validators: [
        ValidationService.minMaxServiceValidator('minSelectableServices', 'maxSelectableServices'),
        ValidationService.extensionFeeValidator('isComplimentaryExtension', 'extensionFee')
      ]
    });
  }

  private setupFormSubscriptions(): void {
    // Watch package type changes
    this.packageForm.get('packageType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        const minControl = this.packageForm.get('minSelectableServices');
        const maxControl = this.packageForm.get('maxSelectableServices');

        if (type === 'Customizable') {
          minControl?.enable();
          maxControl?.enable();
        } else {
          minControl?.disable();
          maxControl?.disable();
        }
      });

    // Watch complimentary extension changes
    this.packageForm.get('isComplimentaryExtension')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isComplimentary => {
        const feeControl = this.packageForm.get('extensionFee');
        if (isComplimentary) {
          feeControl?.setValue(0);
        }
      });

    // Watch apply for all outlets changes
    this.packageForm.get('applyForAllOutlets')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(applyForAll => {
        if (applyForAll) {
          this.clearOutletServices();
        } else {
          this.initializeOutletServices();
        }
      });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.packageId = +id;
      this.loadPackage();
    }
  }

  private loadPackage(): void {
    if (this.packageId) {
      this.packageService.getPackageById(this.packageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(pkg => {
          if (pkg) {
            this.populateForm(pkg);
          }
        });
    }
  }

  private populateForm(pkg: Package): void {
    this.packageForm.patchValue({
      name: pkg.name,
      description: pkg.description,
      validity: pkg.validity,
      isBookedInParallel: pkg.isBookedInParallel,
      availableFor: pkg.availableFor,
      applyForAllOutlets: pkg.applyForAllOutlets,
      packageType: pkg.packageType,
      minSelectableServices: pkg.minSelectableServices,
      maxSelectableServices: pkg.maxSelectableServices,
      extensionFee: pkg.extensionFee,
      isComplimentaryExtension: pkg.isComplimentaryExtension,
      maxExtensions: pkg.maxExtensions,
      renewalType: pkg.renewalType,
      paymentType: pkg.paymentType,
      isSharerPackage: pkg.isSharerPackage,
      followSequence: pkg.followSequence,
      isActive: pkg.isActive
    });

    this.selectedDurations = [...pkg.availableDurations];
    this.populateServices(pkg.services);
    this.populateOutlets(pkg.outlets);
  }

  private populateServices(packageServices: IPackageService[]): void {
    const servicesArray = this.servicesFormArray;
    servicesArray.clear();

    packageServices.forEach(ps => {
      servicesArray.push(this.createServiceFormGroup(ps));
    });
  }

  private populateOutlets(packageOutlets: any[]): void {
    // Implementation for outlet population
  }

  get servicesFormArray(): FormArray {
    return this.packageForm.get('services') as FormArray;
  }

  get outletsFormArray(): FormArray {
    return this.packageForm.get('outlets') as FormArray;
  }

  private loadServices(): void {
    this.packageService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(services => {
        this.services = services;
        if (!this.isEditMode) {
          this.initializeServiceSelection();
        }
      });
  }

  private loadOutlets(): void {
    this.packageService.getOutlets()
      .pipe(takeUntil(this.destroy$))
      .subscribe(outlets => {
        this.outlets = outlets;
      });
  }

  private initializeServiceSelection(): void {
    const servicesArray = this.servicesFormArray;
    this.services.forEach((service, index) => {
      servicesArray.push(this.createServiceFormGroup({
        serviceId: service.id,
        serviceName: service.name,
        sequenceNumber: index + 1,
        rate: service.baseRate,
        isSelected: false
      }));
    });
  }

  private createServiceFormGroup(service: Partial<IPackageService>): FormGroup {
    return this.fb.group({
      serviceId: [service.serviceId || 0],
      serviceName: [service.serviceName || ''],
      sequenceNumber: [service.sequenceNumber || 1, [Validators.min(1), ValidationService.sequenceValidator()]],
      rate: [service.rate || 0, [Validators.min(0)]],
      isSelected: [service.isSelected || false]
    });
  }

  onServiceToggle(index: number): void {
    const serviceControl = this.servicesFormArray.at(index);
    const isSelected = serviceControl.get('isSelected')?.value;
    const packageType = this.packageForm.get('packageType')?.value;

    if (packageType === 'Customizable') {
      const selectedCount = this.getSelectedServicesCount();
      const maxSelectable = this.packageForm.get('maxSelectableServices')?.value || 0;

      if (!isSelected && selectedCount >= maxSelectable) {
        this.showMessage('Maximum number of services are selected, you cannot select more.');
        return;
      }
    }

    serviceControl.get('isSelected')?.setValue(!isSelected);
    this.updateMaxServicesSelected();
  }

  getSelectedServicesCount(): number {
    return this.servicesFormArray.controls
      .filter(control => control.get('isSelected')?.value).length;
  }

  private updateMaxServicesSelected(): void {
    const packageType = this.packageForm.get('packageType')?.value;
    if (packageType === 'Customizable') {
      const selectedCount = this.getSelectedServicesCount();
      const maxSelectable = this.packageForm.get('maxSelectableServices')?.value || 0;
      this.maxServicesSelected = selectedCount >= maxSelectable;
    }
  }

  onDurationToggle(duration: number): void {
    const index = this.selectedDurations.indexOf(duration);
    if (index > -1) {
      this.selectedDurations.splice(index, 1);
    } else {
      this.selectedDurations.push(duration);
    }
    this.selectedDurations.sort((a, b) => a - b);
  }

  isDurationSelected(duration: number): boolean {
    return this.selectedDurations.includes(duration);
  }

  private clearOutletServices(): void {
    const outletsArray = this.outletsFormArray;
    outletsArray.clear();
  }

  private initializeOutletServices(): void {
    // Implementation for outlet services initialization
  }

  onSubmit(): void {
    if (this.packageForm.valid) {
      const formValue = this.packageForm.value;
      const selectedServices = this.servicesFormArray.controls
        .filter(control => control.get('isSelected')?.value)
        .map(control => ({
          serviceId: control.get('serviceId')?.value,
          serviceName: control.get('serviceName')?.value,
          sequenceNumber: control.get('sequenceNumber')?.value,
          rate: control.get('rate')?.value
        }));

      if (selectedServices.length === 0) {
        this.showMessage('Please select at least one service.', 'error');
        return;
      }

      const packageData: Package = {
        ...formValue,
        services: selectedServices,
        availableDurations: [...this.selectedDurations],
        outlets: []
      };

      if (this.isEditMode && this.packageId) {
        this.updatePackage(packageData);
      } else {
        this.createPackage(packageData);
      }
    } else {
      this.showMessage('Please fill all required fields correctly.', 'error');
      this.markFormGroupTouched();
    }
  }

  private createPackage(packageData: Package): void {
    this.packageService.createPackage(packageData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pkg) => {
          this.showMessage('Package created successfully!', 'success');
          this.router.navigate(['/packages']);
        },
        error: (error) => {
          this.showMessage('Error creating package. Please try again.', 'error');
        }
      });
  }

  private updatePackage(packageData: Package): void {
    if (this.packageId) {
      this.packageService.updatePackage(this.packageId, packageData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (pkg) => {
            this.showMessage('Package updated successfully!', 'success');
            this.router.navigate(['/packages']);
          },
          error: (error) => {
            this.showMessage('Error updating package. Please try again.', 'error');
          }
        });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.packageForm.controls).forEach(key => {
      const control = this.packageForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(innerControl => {
          innerControl.markAsTouched();
        });
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

  onCancel(): void {
    this.router.navigate(['/packages']);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.packageForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.packageForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['hasSpecialChar']) return 'Special characters are not allowed';
      if (field.errors['minMaxInvalid']) return 'Min value cannot be greater than max value';
      if (field.errors['shouldBeZero']) return 'Extension fee should be zero when complimentary';
    }
    return '';
  }

  isCustomizable(): boolean {
    return this.packageForm.get('packageType')?.value === 'Customizable';
  }

  isServiceDisabled(index: number): boolean {
    const serviceControl = this.servicesFormArray.at(index);
    const isSelected = serviceControl.get('isSelected')?.value;
    return !isSelected && this.maxServicesSelected;
  }
}