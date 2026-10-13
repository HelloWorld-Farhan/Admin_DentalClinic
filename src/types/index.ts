export type DoctorStatus = 'On Duty' | 'In Surgery' | 'On Rounds' | 'Off Duty';

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  npi: string;
  room: string;
  status: DoctorStatus;
  activePatients: number;
  shift: string;
  surgeriesToday: number;
  rating: number;
  phone: string;
  email: string;
  avatar: string;
  experience: string;
}

export interface ORSuite {
  id: string;
  suiteNumber: string;
  suiteName: string;
  currentProcedure: string;
  primarySurgeon: string;
  assistingStaff: string;
  status: 'In Surgery' | 'Turnover Cleaning' | 'Pre-Op Prep' | 'Standby';
  startTime: string;
  estimatedEnd: string;
  progressPercent: number;
  nextCase: string;
}

export type AcuityLevel = 'Critical' | 'Urgent' | 'Stable';

export interface PatientEHR {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  admissionType: 'Emergency' | 'Scheduled' | 'Day-Care';
  attendingPhysician: string;
  department: string;
  acuity: AcuityLevel;
  insurance: string;
  policyNumber: string;
  room: string;
  admissionDate: string;
  chiefComplaint: string;
  vitals: {
    bp: string;
    hr: number;
    spO2: number;
    temp: string;
  };
  allergies: string[];
  recentProcedures: string[];
  radiographsAttached: boolean;
}

export type TriageAcuity = 'Immediate' | 'Urgent' | 'Routine';
export type InsuranceVerificationStatus = 'Verified' | 'Pending Pre-Auth' | 'Self-Pay';

export interface TriageItem {
  id: string;
  tokenNumber: string;
  patientName: string;
  age: number;
  gender: string;
  arrivalTime: string;
  chiefComplaint: string;
  acuity: TriageAcuity;
  insuranceStatus: InsuranceVerificationStatus;
  insuranceProvider: string;
  assignedDoctor: string;
  assignedRoom: string;
  waitTimeMinutes: number;
  status: 'Waiting' | 'In Triage' | 'With Doctor' | 'Discharged';
}

export type ClaimStatus = 'Approved' | 'Pending Docs' | 'Processing' | 'Denied';

export interface BillingClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  mrn: string;
  insuranceProvider: string;
  cdtCodes: string[];
  procedureName: string;
  billedAmount: number;
  insuranceCoverage: number;
  patientCopay: number;
  submissionDate: string;
  status: ClaimStatus;
  hasRadiographs: boolean;
  denialReason?: string;
}

export type LabPriority = 'Stat' | 'Urgent' | 'Routine';
export type LabStatus = 'In Analysis' | 'Result Available' | 'Verified & Signed';

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  mrn: string;
  specimenType: string;
  testName: string;
  orderingPhysician: string;
  priority: LabPriority;
  orderTime: string;
  turnaroundTime: string;
  status: LabStatus;
  criticalFlag: boolean;
  analyzerId: string;
  resultValue?: string;
  normalRange?: string;
}

export interface DepartmentMetric {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  percentage: number;
  onDutyCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'financial' | 'triage' | 'system';
  read: boolean;
}
