import { useState, useEffect, useCallback } from 'react';
import { Doctor, ORSuite } from '../types';
import { mockDoctors, mockORSuites } from '../data/mockData';

const STORAGE_KEY_DOCTORS = 'smileclinic_db_doctors_v1';
const STORAGE_KEY_OR_SUITES = 'smileclinic_db_or_suites_v1';
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
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      // Sync across multiple browser tabs
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_DOCTORS || e.key === STORAGE_KEY_OR_SUITES) {
          this.loadFromStorage();
          this.notify();
        }
      });
      // Sync in same tab
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
    } catch (err) {
      console.warn('Failed to parse localStorage, resetting to mock defaults', err);
      this.doctors = [...mockDoctors];
      this.orSuites = [...mockORSuites];
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

  private notify(type: 'doctors' | 'suites' | 'all' = 'all') {
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

  /* ---------------- DOCTOR OPERATIONS ---------------- */

  public getDoctors(): Doctor[] {
    return [...this.doctors];
  }

  public addDoctor(doc: Omit<Doctor, 'id'> | Doctor): Doctor {
    const newDoc: Doctor = {
      ...doc,
      id: 'id' in doc && doc.id ? doc.id : `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: doc.status || 'On Duty',
      activePatients: doc.activePatients ?? 0,
      surgeriesToday: doc.surgeriesToday ?? 0,
      rating: doc.rating ?? 5.0,
      experience: doc.experience || 'Board Certified Specialist',
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

  public deleteDoctor(id: string): boolean {
    const lenBefore = this.doctors.length;
    this.doctors = this.doctors.filter((d) => d.id !== id);
    if (this.doctors.length !== lenBefore) {
      this.persistDoctors();
      this.notify('doctors');
      return true;
    }
    return false;
  }

  /* ---------------- OR SUITE OPERATIONS ---------------- */

  public getORSuites(): ORSuite[] {
    return [...this.orSuites];
  }

  public bookORSuite(params: BookORSuiteParams): ORSuite | null {
    const suiteIndex = this.orSuites.findIndex(
      (s) => s.id === params.suiteId || s.suiteNumber === params.suiteId
    );
    if (suiteIndex === -1) return null;

    const start = params.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const duration = params.durationHours || 2;
    
    // Calculate estimated end
    const [h, m] = start.split(':').map((v) => parseInt(v, 10));
    const endH = !isNaN(h) ? (h + duration) % 24 : 15;
    const endM = !isNaN(m) ? m : 0;
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

  public resetToDefaults() {
    this.doctors = [...mockDoctors];
    this.orSuites = [...mockORSuites];
    this.persistDoctors();
    this.persistSuites();
    this.notify('all');
  }
}

// Singleton database instance
export const clinicDB = new ClinicDatabase();

// Default export
export default clinicDB;

/**
 * React Hook for Real-time Reactive synchronization
 * Re-renders components whenever doctors or OR suites change anywhere in the app!
 */
export function useClinicDB() {
  const [doctors, setDoctors] = useState<Doctor[]>(() => clinicDB.getDoctors());
  const [orSuites, setOrSuites] = useState<ORSuite[]>(() => clinicDB.getORSuites());

  useEffect(() => {
    // Sync initial state
    setDoctors(clinicDB.getDoctors());
    setOrSuites(clinicDB.getORSuites());

    // Subscribe to internal DB mutations
    const unsubscribe = clinicDB.subscribe(() => {
      setDoctors(clinicDB.getDoctors());
      setOrSuites(clinicDB.getORSuites());
    });

    return unsubscribe;
  }, []);

  const addDoctor = useCallback((doc: Omit<Doctor, 'id'> | Doctor) => {
    return clinicDB.addDoctor(doc);
  }, []);

  const updateDoctor = useCallback((id: string, updates: Partial<Doctor>) => {
    return clinicDB.updateDoctor(id, updates);
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

  const resetToDefaults = useCallback(() => {
    clinicDB.resetToDefaults();
  }, []);

  return {
    doctors,
    orSuites,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    bookORSuite,
    updateORSuite,
    resetToDefaults,
  };
}
