export interface Package {
  id?: number;
  name: string;
  description?: string;
  validity: number;
  isBookedInParallel: boolean;
  availableFor: 'All' | 'Females' | 'Males';
  applyForAllOutlets: boolean;
  packageType: 'Fixed' | 'Customizable';
  minSelectableServices?: number;
  maxSelectableServices?: number;
  extensionFee: number;
  isComplimentaryExtension: boolean;
  maxExtensions: number;
  availableDurations: number[];
  renewalType: 'Auto' | 'Manual';
  paymentType: 'Pre-paid' | 'Post-paid';
  isSharerPackage: boolean;
  followSequence: boolean;
  services: PackageService[];
  outlets: PackageOutlet[];
  createdDate?: Date;
  isActive: boolean;
}

export interface PackageService {
  id?: number;
  serviceId: number;
  serviceName: string;
  sequenceNumber: number;
  rate: number;
  isSelected?: boolean;
}

export interface PackageOutlet {
  id?: number;
  outletId: number;
  outletName: string;
  services: PackageService[];
  packageRate?: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  baseRate: number;
  category: string;
  isActive: boolean;
}

export interface Outlet {
  id: number;
  name: string;
  location: string;
  isActive: boolean;
}

export enum PackageStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  EXPIRED = 'Expired'
}