export type UserRole = 'Admin' | 'Finance' | 'Driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Shipment {
  id: string;
  date: string;
  truck: string;
  driver: string;
  driverId: string;
  volume: number; // in KL
  destination: string;
  status: 'Pending' | 'Verified' | 'Delivered' | 'Invoiced';
  proofUrl?: string;
}

export interface Truck {
  id: string;
  plateNumber: string;
  capacity: number;
}

export interface Contract {
  id: string;
  clientName: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired';
}

export interface InvoiceHistory {
  action: string;
  user: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  shipmentIds: string[];
  totalAmount: number; // This will be the DPP
  status: 'Unpaid' | 'Paid' | 'Overdue' | 'Voided';
  clientName: string;
  isTaxExempt: boolean;
  taxExemptReference?: string;
  nsfp?: string; // Nomor Seri Faktur Pajak
  supplyPoint: string;
  destination: string;
  unitPrice: number;
  createdBy: string;
  createdAt: string;
  history: InvoiceHistory[];
}

export interface CompanySettings {
  name: string;
  address: string;
  npwp: string;
  bankAccount: string;
  bankName: string;
}
