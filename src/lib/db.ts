import { useState, useEffect, useCallback } from 'react';
import { Doctor, ORSuite, PatientEHR } from '../types';
import { mockDoctors, mockORSuites, mockPatientsEHR } from '../data/mockData';

const STORAGE_KEY_DOCTORS = 'smileclinic_db_doctors_v1';
const STORAGE_KEY_OR_SUITES = 'smileclinic_db_or_suites_v1';
const STORAGE_KEY_PATIENTS = 'smileclinic_db_patients_v1';
const DB_CHANGE_EVENT = 'smileclinic_db_change';

export interface BookORSuiteParams {
  suiteId: string;
  surgeon: string;
  procedure: string;
  startTime?: string;
  durationHours?: number;
  nextCase?: string;
}

class ClinicDatabase {
  private doctors: Doctor[] = [];
  private orSuites: ORSuite[] = [];
  private patients: PatientEHR[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      // Sync across multiple browser tabs
      window.addEventListener('storage', (e) => {
        if (
          e.key === STORAGE_KEY_DOCTORS || 
          e.key === STORAGE_KEY_OR_SUITES || 
          e.key === STORAGE_KEY_PATIENTS
        ) {
          this.loadFromStorage();
          this.notify();
        }
      });
      // Sync within the same tab
      window.addEventListener(DB_CHANGE_EVENT, () => {
        this.loadFromStorage();
        this.notify();
      });
    }
  }

  private init() {
    if (typeof window === 'undefined') {
      this.doctors = [...mockDoctors];
      this.orSuites = [...mockORSuites];
      this.patients = [...mockPatientsEHR];
      return;
    }
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedDoctors = localStorage.getItem(STORAGE_KEY_DOCTORS);
      if (storedDoctors) {
        this.doctors = JSON.parse(storedDoctors);
      } else {
        this.doctors = [...mockDoctors];
        this.persistDoctors();
      }

      const storedSuites = localStorage.getItem(STORAGE_KEY_OR_SUITES);
      if (storedSuites) {
        this.orSuites = JSON.parse(storedSuites);
      } else {
        this.orSuites = [...mockORSuites];
        this.persistSuites();
      }

      const storedPatients = localStorage.getItem(STORAGE_KEY_PATIENTS);
      if (storedPatients) {
        this.patients = JSON.parse(storedPatients);
      } else {
        this.patients = [...mockPatientsEHR];
        this.persistPatients();
      }
    } catch (err) {
      console.warn('Failed to parse localStorage, resetting to mock defaults', err);
      this.doctors = [...mockDoctors];
      this.orSuites = [...mockORSuites];
      this.patients = [...mockPatientsEHR];
    }
  }

  private persistDoctors() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(this.doctors));
    }
  }

  private persistSuites() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_OR_SUITES, JSON.stringify(this.orSuites));
    }
  }

  private persistPatients() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(this.patients));
    }
  }

  private notify(type: 'doctors' | 'suites' | 'patients' | 'all' = 'all') {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in ClinicDatabase listener', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT, { detail: { type } }));
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // --- DOCTOR API ---
  public getDoctors(): Doctor[] {
    return [...this.doctors];
  }

  public addDoctor(doctorData: Omit<Doctor, 'id'> | Doctor): Doctor {
    const newId = 'id' in doctorData && doctorData.id ? doctorData.id : `DOC-${Date.now()}`;
    const newDoc: Doctor = {
      ...doctorData,
      id: newId,
      status: doctorData.status || 'On Duty',
      surgeriesToday: doctorData.surgeriesToday || 0,
      activePatients: doctorData.activePatients || 0,
      title: doctorData.title || (doctorData.name.startsWith('Dr.') ? doctorData.name : `Dr. ${doctorData.name}`),
      rating: doctorData.rating || 4.9,
      phone: doctorData.phone || '+1 (555) 019-2831',
      email: doctorData.email || `${doctorData.name.toLowerCase().replace(/[^a-z]/g, '')}@smileclinic.com`,
      experience: doctorData.experience || 'Board Certified Specialist',
      avatar: doctorData.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    };

    this.doctors = [newDoc, ...this.doctors];
    this.persistDoctors();
    this.notify('doctors');
    return newDoc;
  }

  public updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const index = this.doctors.findIndex((d) => d.id === id);
    if (index === -1) return null;

    this.doctors[index] = { ...this.doctors[index], ...updates };
    this.persistDoctors();
    this.notify('doctors');
    return this.doctors[index];
  }

  public updateDoctorShift(
    id: string,
    shift: string,
    status?: Doctor['status'],
    room?: string
  ): Doctor | null {
    const index = this.doctors.findIndex((d) => d.id === id);
    if (index === -1) return null;

    this.doctors[index] = {
      ...this.doctors[index],
      shift: shift || this.doctors[index].shift,
      status: status || this.doctors[index].status,
      room: room || this.doctors[index].room,
    };

    this.persistDoctors();
    this.notify('doctors');
    return this.doctors[index];
  }

  public deleteDoctor(id: string): boolean {
    const initialLen = this.doctors.length;
    this.doctors = this.doctors.filter((d) => d.id !== id);
    if (this.doctors.length !== initialLen) {
      this.persistDoctors();
      this.notify('doctors');
      return true;
    }
    return false;
  }

  // --- OR SUITE API ---
  public getORSuites(): ORSuite[] {
    return [...this.orSuites];
  }

  public bookORSuite(params: BookORSuiteParams): ORSuite | null {
    const suiteIndex = this.orSuites.findIndex(
      (s) => s.id === params.suiteId || s.suiteNumber === params.suiteId
    );
    if (suiteIndex === -1) return null;

    const start = params.startTime || '13:00';
    const duration = params.durationHours || 2;
    const [h, m] = start.split(':').map(Number);
    const endH = (h + duration) % 24;
    const endM = m || 0;
    const estimatedEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const updated: ORSuite = {
      ...this.orSuites[suiteIndex],
      currentProcedure: params.procedure,
      primarySurgeon: params.surgeon,
      status: 'In Surgery',
      startTime: start,
      estimatedEnd: estimatedEnd,
      progressPercent: 20,
      nextCase: params.nextCase || 'Sterilization & Room Turnover Protocol',
    };

    this.orSuites[suiteIndex] = updated;
    this.persistSuites();
    this.notify('suites');
    return updated;
  }

  public updateORSuite(id: string, updates: Partial<ORSuite>): ORSuite | null {
    const index = this.orSuites.findIndex((s) => s.id === id || s.suiteNumber === id);
    if (index === -1) return null;

    this.orSuites[index] = { ...this.orSuites[index], ...updates };
    this.persistSuites();
    this.notify('suites');
    return this.orSuites[index];
  }

  // --- PATIENTS EHR API ---
  public getPatients(): PatientEHR[] {
    return [...this.patients];
  }

  public addPatient(patientData: Omit<PatientEHR, 'id'> | PatientEHR): PatientEHR {
    const newId = 'id' in patientData && patientData.id ? patientData.id : `P-${Date.now()}`;
    const newPatient: PatientEHR = {
      ...patientData,
      id: newId,
    };

    this.patients = [newPatient, ...this.patients];
    this.persistPatients();
    this.notify('patients');
    return newPatient;
  }

  public updatePatient(id: string, updates: Partial<PatientEHR>): PatientEHR | null {
    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.patients[index] = { ...this.patients[index], ...updates };
    this.persistPatients();
    this.notify('patients');
    return this.patients[index];
  }

  public deletePatient(id: string): boolean {
    const initialLen = this.patients.length;
    this.patients = this.patients.filter((p) => p.id !== id);
    if (this.patients.length !== initialLen) {
      this.persistPatients();
      this.notify('patients');
      return true;
    }
    return false;
  }

  public resetToDefaults() {
    this.doctors = [...mockDoctors];
    this.orSuites = [...mockORSuites];
    this.patients = [...mockPatientsEHR];
    this.persistDoctors();
    this.persistSuites();
    this.persistPatients();
    this.notify('all');
  }
}

// Singleton database instance
export const clinicDB = new ClinicDatabase();

// Default export
export default clinicDB;

/**
 * React Hook for Real-time Reactive synchronization
 * Re-renders components whenever doctors, OR suites, or patients change anywhere in the app!
 */
export function useClinicDB() {
  const [doctors, setDoctors] = useState<Doctor[]>(() => clinicDB.getDoctors());
  const [orSuites, setOrSuites] = useState<ORSuite[]>(() => clinicDB.getORSuites());
  const [patients, setPatients] = useState<PatientEHR[]>(() => clinicDB.getPatients());

  useEffect(() => {
    // Sync initial state
    setDoctors(clinicDB.getDoctors());
    setOrSuites(clinicDB.getORSuites());
    setPatients(clinicDB.getPatients());

    // Subscribe to internal DB mutations
    const unsubscribe = clinicDB.subscribe(() => {
      setDoctors(clinicDB.getDoctors());
      setOrSuites(clinicDB.getORSuites());
      setPatients(clinicDB.getPatients());
    });

    return unsubscribe;
  }, []);

  const addDoctor = useCallback((doc: Omit<Doctor, 'id'> | Doctor) => {
    return clinicDB.addDoctor(doc);
  }, []);

  const updateDoctor = useCallback((id: string, updates: Partial<Doctor>) => {
    return clinicDB.updateDoctor(id, updates);
  }, []);

  const updateDoctorShift = useCallback((
    id: string,
    shift: string,
    status?: Doctor['status'],
    room?: string
  ) => {
    return clinicDB.updateDoctorShift(id, shift, status, room);
  }, []);

  const deleteDoctor = useCallback((id: string) => {
    return clinicDB.deleteDoctor(id);
  }, []);

  const bookORSuite = useCallback((params: BookORSuiteParams) => {
    return clinicDB.bookORSuite(params);
  }, []);

  const updateORSuite = useCallback((id: string, updates: Partial<ORSuite>) => {
    return clinicDB.updateORSuite(id, updates);
  }, []);

  const addPatient = useCallback((patient: Omit<PatientEHR, 'id'> | PatientEHR) => {
    return clinicDB.addPatient(patient);
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<PatientEHR>) => {
    return clinicDB.updatePatient(id, updates);
  }, []);

  const deletePatient = useCallback((id: string) => {
    return clinicDB.deletePatient(id);
  }, []);

  const resetToDefaults = useCallback(() => {
    clinicDB.resetToDefaults();
  }, []);

  return {
    doctors,
    orSuites,
    patients,
    addDoctor,
    updateDoctor,
    updateDoctorShift,
    deleteDoctor,
    bookORSuite,
    updateORSuite,
    addPatient,
    updatePatient,
    deletePatient,
    resetToDefaults,
  };
}
