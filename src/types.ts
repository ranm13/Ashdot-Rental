export type Role = 'Admin' | 'Read-Only';

export interface BaseEntity {
  id: string;
  is_active: boolean; // Soft delete flag
}

export interface ResidentApartment extends BaseEntity {
  building_id: string; // From AD keys
  apartment_name: string; // Apartment name
  floor: string; // Floor
  tenant_name: string; // Tenant
  owner_name: string; // Owner
  rent: number | null; // Rent
  square_meters?: number | null;
  arnona_id: string; // Arnona ID
  water_id: string; // Water ID
  electricity_id: string; // Electricity ID
  contract_end: string;
  is_linked: boolean; // Split/merge indicator
  phone: string; // Phone
  email: string; // Email
  payment_dest: string;
  maintenance_log?: string; // Track maintenance as per requirements
  maintenance_cost?: number;
}

export interface MaintenanceIssue extends BaseEntity {
  building_id: string;
  type: string;
  status: string;
  description: string;
  cost: number;
  date: string;
  supplier: string;
  category: 'external' | 'internal';
}

export interface StudentApartment extends BaseEntity {
  building_id: string; // Building
  apartment_num: number; // Apartment number
  tenant_name: string;
  rent: number | null;
  arnona_id: string;
  water_id: string;
  contract_end: string;
  phone: string;
  email: string;
  payment_dest?: string; // 'קיבוץ' / 'יורשים בניהול הקיבוץ' / 'ישירות ליורשים'
  maintenance_log?: string;
  maintenance_cost?: number;
}

export interface Business extends BaseEntity {
  business_name: string;
  owner_name: string;
  location: string; // Location
  parcel_id: number;
  rent: number | null;
  arnona_id: string;
  water_id: string;
  contract_end: string;
  phone: string;
  email: string;
  status: string; // Usage Regulation: "הוסדר", "בטיפול", "לא התקבל דו"ח מרמ"י"
  maintenance_log?: string;
  square_meters?: number;
}

export interface Employee extends BaseEntity {
  name: string;
  role: string;
  department: string;
  salary: number;
  notes: string;
}

export interface Expense extends BaseEntity {
  category: string;
  description: string;
  amount: number;
  frequency: string;
  date: string;
}

export interface MapMarker {
  id: string;
  type: 'Resident' | 'Student' | 'Business';
  x: number;
  y: number;
}
