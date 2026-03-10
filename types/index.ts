export type ChildCategory = 'Defaulter' | 'Refusal' | 'Zero Dose';

export type VaccinationStatus = 'YES' | 'NO';

export interface ChildRecord {
  id: string;
  serialNumber: number;
  childName: string;
  fatherName: string;
  age: string;
  address: string;
  contactNumber: string;
  category: ChildCategory;
  vaccinated: VaccinationStatus;
  dateOfVaccination: string | null;
  communityMemberName: string;
  communityMemberContact: string;
  gpsCoordinates: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteInfo {
  fixSite: string;
  uc: string;
  district: string;
}

export interface DashboardMetrics {
  totalDefaulters: number;
  vaccinated: number;
  pendingRefusals: number;
  zeroDoseCases: number;
}

export type FilterType = 'All' | 'Refusal' | 'Zero Dose' | 'Vaccinated' | 'Not Vaccinated';
