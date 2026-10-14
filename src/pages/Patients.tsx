import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserPlus,
  ArrowRightLeft,
  FileText,
  Activity,
  HeartPulse,
  Thermometer,
  Wind,
  CheckCircle2,
  AlertTriangle,
  X,
  Stethoscope,
  Building,
  ShieldCheck,
  RotateCcw,
  Pill,
  Clock,
  Bed,
  FileCheck,
  BarChart3,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { mockPatientsEHR, mockDoctors } from '../data/mockData';
import { PatientEHR, AcuityLevel } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';
import { useClinicDB } from '../lib/db';
import { MasterEHRModal } from '../components/MasterEHRModal';

interface PatientsProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
  onOpenPowerBI?: () => void;
  onOpenExport?: () => void;
}

export const Patients: React.FC<PatientsProps> = ({ onNotify, onOpenPowerBI, onOpenExport }) => {
  const { patients, addPatient, updatePatient, deletePatient } = useClinicDB();
  const [selectedPatient, setSelectedPatient] = useState<PatientEHR | null>(() => patients[0] || null);

  useEffect(() => {
    if (!selectedPatient && patients.length > 0) {
      setSelectedPatient(patients[0]);
    } else if (selectedPatient) {
      const updated = patients.find((p) => p.id === selectedPatient.id);
      if (updated) setSelectedPatient(updated);
      else if (patients.length > 0) setSelectedPatient(patients[0]);
    }
  }, [patients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedAcuity, setSelectedAcuity] = useState<string>('ALL');
  const [selectedInsurance, setSelectedInsurance] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Modal states
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [masterEhrModalOpen, setMasterEhrModalOpen] = useState(false);

  // Power BI chart state
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [chartStreamFilter, setChartStreamFilter] = useState<'all' | 'inpatient' | 'outpatient'>('all');

  // Freeze background window scrolling when ANY patient modal is open
  const isAnyModalOpen = Boolean(admissionModalOpen || transferModalOpen || dischargeModalOpen || vitalsModalOpen || rxModalOpen || masterEhrModalOpen);
  useBodyScrollLock(isAnyModalOpen);

  // Dynamic Real-time Calculations
  const baseCount = mockPatientsEHR.length;
  const netAdded = patients.length - baseCount;
  const totalRegisteredDisplay = (14820 + netAdded).toLocaleString();
  const currentlyAdmittedDisplay = (1248 + netAdded).toLocaleString();
  const newAdmissionsDisplay = 82 + Math.max(0, netAdded);

  const weeklyIntakeData = useMemo(() => [
    { week: 'Week 1 (Oct 01)', dates: 'Oct 01 – Oct 07', in: 245, out: 310, inHeight: 105, outHeight: 130, inPct: '+3.2%', outPct: '+4.5%', occupancy: '86%', acuity: '93% Stable', xIn: 60, xOut: 86 },
    { week: 'Week 2 (Oct 08)', dates: 'Oct 08 – Oct 14', in: 280, out: 345, inHeight: 117, outHeight: 137, inPct: '+5.8%', outPct: '+6.1%', occupancy: '88%', acuity: '91% Stable', xIn: 180, xOut: 206 },
    { week: 'Week 3 (Oct 15)', dates: 'Oct 15 – Oct 21', in: 315, out: 370, inHeight: 130, outHeight: 145, inPct: '+8.4%', outPct: '+7.2%', occupancy: '92%', acuity: '89% Stable', xIn: 300, xOut: 326 },
    { week: 'Week 4 (Oct 22)', dates: 'Oct 22 – Oct 28', in: 230, out: 295, inHeight: 98, outHeight: 122, inPct: '-2.1%', outPct: '+1.4%', occupancy: '84%', acuity: '95% Stable', xIn: 420, xOut: 446 },
    { week: 'Week 5 (Oct 29)', dates: 'Oct 29 – Nov 04', in: 275, out: 340, inHeight: 112, outHeight: 138, inPct: '+4.3%', outPct: '+5.5%', occupancy: '89%', acuity: '92% Stable', xIn: 540, xOut: 566 },
    { week: 'Current Week', dates: 'Live Inpatient Intake', in: 305 + Math.max(0, netAdded), out: 385, inHeight: Math.min(160, 125 + Math.max(0, netAdded) * 4), outHeight: 150, inPct: '+9.1%', outPct: '+8.6%', occupancy: '94%', acuity: '90% Stable', xIn: 660, xOut: 686 },
  ], [netAdded]);

  // Form states
  const [newAdmission, setNewAdmission] = useState({
    name: '',
    mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
    age: 35,
    gender: 'M' as 'M' | 'F' | 'Other',
    admissionType: 'Scheduled' as 'Scheduled' | 'Emergency' | 'Day-Care',
    attendingPhysician: mockDoctors[0].name,
    department: 'General Dental Surgery',
    acuity: 'Stable' as AcuityLevel,
    insurance: 'Delta Dental PPO',
    policyNumber: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
    room: 'Ward 2B - Bed 104',
    chiefComplaint: '',
    allergies: 'Penicillin',
    bp: '120/80',
    hr: 72,
    spO2: 99,
    temp: '36.8°C',
  });

  const [transferData, setTransferData] = useState({
    patientId: selectedPatient?.id || '',
    toWard: 'ICU Tower - Bed 08',
    reason: 'Post-operative continuous telemetry hemodynamic monitoring',
  });

  const [dischargeData, setDischargeData] = useState({
    patientId: selectedPatient?.id || '',
    disposition: 'Home with Home Healthcare Support',
    instructions: 'Post-surgical soft diet, continue Cefazolin 500mg BID for 5 days. Follow up in 7 days.',
  });

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.attendingPhysician.toLowerCase().includes(searchQuery.toLowerCase());

      const matchWard = selectedWard === 'ALL' || p.department.toLowerCase().includes(selectedWard.toLowerCase()) || p.room.toLowerCase().includes(selectedWard.toLowerCase());
      const matchAcuity = selectedAcuity === 'ALL' || p.acuity === selectedAcuity;
      const matchInsurance = selectedInsurance === 'ALL' || p.insurance.toLowerCase().includes(selectedInsurance.toLowerCase());

      return matchSearch && matchWard && matchAcuity && matchInsurance;
    });
  }, [patients, searchQuery, selectedWard, selectedAcuity, selectedInsurance]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedWard('ALL');
    setSelectedAcuity('ALL');
    setSelectedInsurance('ALL');
  };

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmission.name.trim()) return;

    const created = addPatient({
      mrn: newAdmission.mrn,
      name: newAdmission.name.trim(),
      age: Number(newAdmission.age),
      gender: newAdmission.gender,
      admissionType: newAdmission.admissionType,
      attendingPhysician: newAdmission.attendingPhysician,
      department: newAdmission.department,
      acuity: newAdmission.acuity,
      insurance: newAdmission.insurance,
      policyNumber: newAdmission.policyNumber,
      room: newAdmission.room,
      admissionDate: 'Today (Just now)',
      chiefComplaint: newAdmission.chiefComplaint || 'Scheduled Maxillofacial Observation',
      vitals: {
        bp: newAdmission.bp,
        hr: Number(newAdmission.hr),
        spO2: Number(newAdmission.spO2),
        temp: newAdmission.temp,
      },
      allergies: newAdmission.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      recentProcedures: ['Initial Clinical Workup & Vitals Intake'],
      radiographsAttached: true,
    });

    setSelectedPatient(created);
    setAdmissionModalOpen(false);
    onNotify?.(
      'New Inpatient Admitted',
      `${created.name} (${created.mrn}) allocated to ${created.room}`,
      'triage'
    );
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const updated = updatePatient(selectedPatient.id, { room: transferData.toWard });
    if (updated) {
      setSelectedPatient({ ...selectedPatient, room: transferData.toWard });
    }
    setTransferModalOpen(false);
    onNotify?.(
      'Bed Transfer Complete',
      `${selectedPatient.name} moved to ${transferData.toWard}. EMR telemetry dock updated.`,
      'system'
    );
  };

  const handleDischargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    deletePatient(selectedPatient.id);
    setDischargeModalOpen(false);
    onNotify?.(
      'Discharge Summary Generated',
      `Clinical release approved for ${selectedPatient.name}. Electronic summary dispatched to pharmacy.`,
      'financial'
    );
    setSelectedPatient(patients.find((p) => p.id !== selectedPatient.id) || null);
  };

  const getAcuityBadge = (acuity: AcuityLevel) => {
    switch (acuity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Critical Care
          </span>
        );
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Monitored
          </span>
        );
      case 'Stable':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            Stable
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Command & Triage Summary Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#005c65]">
              Central Inpatient &amp; Outpatient Registry
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#94f2f1]/40 text-[#004f56]">
              Live Sync • 4m ago
            </span>
          </div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Patient Directory &amp; EHR Registry
            </h1>
            <span className="text-sm text-slate-500">
              Ward Occupancy: <span className="font-semibold text-[#005c65]">87.4%</span> (Capacity: 1,428 beds)
            </span>
          </div>
        </div>

        {/* Quick Action Dock */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenPowerBI && (
            <button
              onClick={onOpenPowerBI}
              className="h-10 px-4 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
              title="Open Clinical BI Analytics"
            >
              <Activity className="w-4 h-4 text-amber-600" />
              <span>Power BI Telemetry</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Export Master Registry</span>
            </button>
          )}

          <button
            onClick={() => setTransferModalOpen(true)}
            className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>Transfer Ward</span>
          </button>

          <button
            onClick={() => setDischargeModalOpen(true)}
            className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-[#005c65]" />
            <span>Discharge Summary</span>
          </button>

          <button
            onClick={() => setAdmissionModalOpen(true)}
            className="h-10 px-5 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-[#005c65]/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Patient Admission</span>
          </button>
        </div>
      </div>

      {/* Realtime Admission & Flow Metrics Bento (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Registered */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Registered</span>
            <div className="w-8 h-8 rounded-lg bg-[#99f0fd]/40 flex items-center justify-center text-[#005c65]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <motion.span 
              key={totalRegisteredDisplay}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-slate-900"
            >
              {totalRegisteredDisplay}
            </motion.span>
            <span className="text-xs font-semibold text-teal-600 flex items-center gap-0.5">+3.8%</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#005c65] h-full rounded-full" style={{ width: '78%' }} />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
              <span>Active In-System</span>
              <span>78% active cohort</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Currently Admitted */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Currently Admitted</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <motion.span 
              key={currentlyAdmittedDisplay}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-slate-900"
            >
              {currentlyAdmittedDisplay}
            </motion.span>
            <span className="inline-flex px-2 py-0.5 rounded-full bg-[#005c65]/10 text-[#005c65] text-xs font-semibold">
              87.4% Beds
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-blue-600 h-full" style={{ width: '72%' }} />
              <div className="bg-red-500 h-full" style={{ width: '15%' }} />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
              <span>1,061 Wards</span>
              <span>187 ICU/Stepdown</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Discharged Today */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Discharged Today</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">64</span>
            <span className="text-xs font-semibold text-[#005c65] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> On Schedule
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: '92%' }} />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
              <span>Target: 70 discharges</span>
              <span className="font-semibold text-teal-700">91% cleared</span>
            </div>
          </div>
        </div>

        {/* Stat 4: New Admissions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">New Admissions</span>
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-teal-100 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <motion.span 
              key={newAdmissionsDisplay}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-slate-900"
            >
              {newAdmissionsDisplay}
            </motion.span>
            <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              19 Triage ER
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-[#005c65] h-full" style={{ width: '65%' }} />
              <div className="bg-blue-600 h-full" style={{ width: '35%' }} />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
              <span>63 Scheduled</span>
              <span>19 Emergency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Demographics & ALOS Visual Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 8 cols: Interactive Animated Power BI Patient Intake Flow Chart */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#005c65]" />
                <h2 className="text-base font-bold text-slate-900">Monthly Patient Intake Flow &amp; Acuity</h2>
              </div>
              <p className="text-xs text-slate-500">Comparative tracking of Inpatient Admissions vs. Outpatient Encounters</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartStreamFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartStreamFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Streams
              </button>
              <button
                type="button"
                onClick={() => setChartStreamFilter('inpatient')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  chartStreamFilter === 'inpatient'
                    ? 'bg-[#005c65] text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-[#005c65]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#005c65]" />
                Inpatient
              </button>
              <button
                type="button"
                onClick={() => setChartStreamFilter('outpatient')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  chartStreamFilter === 'outpatient'
                    ? 'bg-[#1560a4] text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-[#1560a4]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#1560a4]" />
                Outpatient
              </button>
            </div>
          </div>

          {/* Interactive Chart Container with Floating Tooltip */}
          <div 
            className="w-full h-52 flex flex-col justify-end relative"
            onMouseLeave={() => setHoveredWeek(null)}
          >
            {/* Interactive Floating Tooltip */}
            <AnimatePresence>
              {hoveredWeek !== null && weeklyIntakeData[hoveredWeek] && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 pointer-events-none p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-[11px] shadow-2xl border border-slate-700 min-w-[220px]"
                  style={{
                    left: `${Math.min(72, Math.max(8, (hoveredWeek / 5) * 82))}%`,
                    top: '-16px',
                  }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
                    <span className="font-bold text-white text-xs">{weeklyIntakeData[hoveredWeek].week}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{weeklyIntakeData[hoveredWeek].dates}</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center text-teal-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#005c65]" /> Inpatient Admissions:
                      </span>
                      <span className="font-bold font-mono">{weeklyIntakeData[hoveredWeek].in} ({weeklyIntakeData[hoveredWeek].inPct})</span>
                    </div>
                    <div className="flex justify-between items-center text-sky-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1560a4]" /> Outpatient Encounters:
                      </span>
                      <span className="font-bold font-mono">{weeklyIntakeData[hoveredWeek].out} ({weeklyIntakeData[hoveredWeek].outPct})</span>
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                      <span>Bed Capacity: <b className="text-white">{weeklyIntakeData[hoveredWeek].occupancy}</b></span>
                      <span className="text-emerald-400">{weeklyIntakeData[hoveredWeek].acuity}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <svg className="w-full h-full overflow-visible text-slate-300" preserveAspectRatio="none" viewBox="0 0 800 170">
              <line stroke="currentColor" strokeDasharray="4" strokeOpacity="0.4" x1="0" x2="800" y1="20" y2="20" />
              <line stroke="currentColor" strokeDasharray="4" strokeOpacity="0.4" x1="0" x2="800" y1="70" y2="70" />
              <line stroke="currentColor" strokeDasharray="4" strokeOpacity="0.4" x1="0" x2="800" y1="120" y2="120" />
              <line stroke="currentColor" strokeOpacity="0.6" x1="0" x2="800" y1="165" y2="165" />

              {/* Weekly bar pairs */}
              {weeklyIntakeData.map((w, idx) => {
                const isHovered = hoveredWeek === idx;
                const inY = 165 - w.inHeight;
                const outY = 165 - w.outHeight;
                return (
                  <g 
                    key={w.week} 
                    onMouseEnter={() => setHoveredWeek(idx)}
                    className="cursor-pointer"
                  >
                    {/* Hover hotspot backdrop */}
                    <rect
                      x={w.xIn - 10}
                      y={0}
                      width={68}
                      height={165}
                      fill={isHovered ? 'rgba(0, 92, 101, 0.06)' : 'transparent'}
                      rx={8}
                      className="transition-colors"
                    />

                    {/* Inpatient (Teal) Bar */}
                    {(chartStreamFilter === 'all' || chartStreamFilter === 'inpatient') && (
                      <rect
                        className="fill-[#005c65] transition-all duration-300"
                        height={w.inHeight}
                        rx={5}
                        width={22}
                        x={w.xIn}
                        y={inY}
                        opacity={isHovered ? 1 : 0.9}
                        filter={isHovered ? 'drop-shadow(0 2px 4px rgba(0, 92, 101, 0.4))' : undefined}
                      />
                    )}

                    {/* Outpatient (Blue) Bar */}
                    {(chartStreamFilter === 'all' || chartStreamFilter === 'outpatient') && (
                      <rect
                        className="fill-[#1560a4] transition-all duration-300"
                        height={w.outHeight}
                        rx={5}
                        width={22}
                        x={w.xOut}
                        y={outY}
                        opacity={isHovered ? 1 : 0.9}
                        filter={isHovered ? 'drop-shadow(0 2px 4px rgba(21, 96, 164, 0.4))' : undefined}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            {weeklyIntakeData.map((w, idx) => (
              <span
                key={w.week}
                onMouseEnter={() => setHoveredWeek(idx)}
                className={`cursor-pointer transition-colors ${
                  hoveredWeek === idx
                    ? 'font-bold text-[#005c65]'
                    : idx === 5
                    ? 'font-semibold text-[#005c65]'
                    : ''
                }`}
              >
                {w.week}
              </span>
            ))}
          </div>
        </div>

        {/* 4 cols: ALOS and Bed Turnover Index */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Clinical Length of Stay (ALOS)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Average recovery duration prior to safe discharge</p>
          </div>

          <div className="space-y-4 my-2">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Average Stay Duration</span>
                <span className="text-[#005c65]">4.8 Days</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#005c65] h-full rounded-full" style={{ width: '64%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Target SLA: &lt; 5.2 Days</span>
                <span className="text-teal-600 font-medium">Optimal (-0.4d)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Bed Turnover Index</span>
                <span className="text-blue-700">1.8x / wk</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Sanitization turnaround</span>
                <span className="text-blue-600 font-medium">42 mins average</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">30-Day Re-admission Rate</span>
                <span className="text-teal-700">2.1%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '21%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Benchmark: &lt; 4.0%</span>
                <span className="text-teal-600 font-medium">Top 5% Percentile</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> JCAHO &amp; HIPAA Certified
            </span>
            <span className="font-semibold text-[#005c65]">Protocol 2026.4</span>
          </div>
        </div>
      </div>

      {/* Multi-Parameter Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, room, or physician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005c65] border border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="h-10 px-3 bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
          >
            <option value="ALL">All Clinical Wards</option>
            <option value="ICU">ICU &amp; Stepdown</option>
            <option value="Maxillofacial">Maxillofacial Surgery</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General">General Inpatient</option>
          </select>

          <select
            value={selectedAcuity}
            onChange={(e) => setSelectedAcuity(e.target.value)}
            className="h-10 px-3 bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
          >
            <option value="ALL">All Acuity Levels</option>
            <option value="Critical">Critical Care</option>
            <option value="Urgent">Monitored</option>
            <option value="Stable">Stable</option>
          </select>

          <select
            value={selectedInsurance}
            onChange={(e) => setSelectedInsurance(e.target.value)}
            className="h-10 px-3 bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
          >
            <option value="ALL">All Insurance Providers</option>
            <option value="Delta Dental">Delta Dental</option>
            <option value="Aetna">Aetna Dental</option>
            <option value="Cigna">Cigna PPO</option>
            <option value="MetLife">MetLife PDP</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="h-10 px-3 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Table + Quick View Side Drawer Interaction */}
      <div className="relative flex flex-col xl:flex-row gap-5 items-start">
        {/* Main Table Container */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3.5 px-4">MRN &amp; Demographics</th>
                  <th className="py-3.5 px-4">Attending Physician</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Admission / Diagnosis</th>
                  <th className="py-3.5 px-4">Vitals Acuity</th>
                  <th className="py-3.5 px-4">Stay &amp; Insurance</th>
                  <th className="py-3.5 px-4 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredPatients.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setDrawerOpen(true);
                      }}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-teal-50/60 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 border border-slate-200">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 group-hover:text-[#005c65] transition-colors">
                                {p.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">
                                {p.gender} • {p.age}y
                              </span>
                            </div>
                            <span className="text-xs font-mono text-[#005c65] font-semibold">{p.mrn}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{p.attendingPhysician}</span>
                          <span className="text-xs text-blue-600 font-medium">{p.department}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-[#005c65]" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{p.room}</span>
                            <span className="text-xs text-slate-400">Telemetry Active</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-[220px]">
                          <span className="font-medium text-slate-800 truncate">{p.chiefComplaint}</span>
                          <span className="text-xs text-slate-400 truncate">
                            {p.recentProcedures[0] || 'Workup in progress'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getAcuityBadge(p.acuity)}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-800">{p.admissionDate}</span>
                          <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">
                            {p.insurance}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setSelectedPatient(p);
                              setVitalsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
                            title="Continuous Vitals Telemetry"
                          >
                            <Activity className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPatient(p);
                              setRxModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Active Prescriptions"
                          >
                            <Pill className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPatient(p);
                              setDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Inspect Full EHR Drawer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredPatients.length}</strong> of{' '}
              <strong className="text-slate-800">{patients.length}</strong> patient records
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Central Memorial Hospital EHR • HIPAA Audited</span>
            </div>
          </div>
        </div>

        {/* Quick View EHR Side Drawer (Dynamic on Row Click) */}
        {drawerOpen && selectedPatient && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full xl:w-96 shrink-0 bg-white rounded-xl shadow-md border border-slate-100 p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#005c65]" />
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Selected Patient EHR
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient Header Card */}
            <div className="p-4 rounded-xl bg-slate-50 flex flex-col gap-2 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#005c65]">{selectedPatient.mrn}</span>
                {getAcuityBadge(selectedPatient.acuity)}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedPatient.name}</h3>
              <p className="text-xs text-slate-500">
                {selectedPatient.age} yrs • {selectedPatient.gender} • Blood Group: A+
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <Building className="w-3.5 h-3.5 text-[#005c65]" />
                <span>{selectedPatient.room}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedPatient.attendingPhysician}</span>
              </div>
            </div>

            {/* Realtime Vitals Grid */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Continuous Telemetry
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> Live Streaming
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Heart Rate */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Heart Rate
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-slate-900">{selectedPatient.vitals.hr}</span>
                    <span className="text-xs text-slate-400">bpm</span>
                  </div>
                  <svg className="w-full h-4 mt-1 text-rose-500" viewBox="0 0 100 20">
                    <path
                      d="M 0 10 L 25 10 L 30 2 L 35 18 L 40 5 L 45 12 L 50 10 L 100 10"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>

                {/* Blood Pressure */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-blue-600" /> Blood Pressure
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-slate-900">{selectedPatient.vitals.bp}</span>
                    <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                  <span className="text-[10px] text-teal-600 font-medium mt-1">MAP: 98 mmHg (Optimal)</span>
                </div>

                {/* SpO2 */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-teal-600" /> SpO2 Saturation
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-slate-900">{selectedPatient.vitals.spO2}%</span>
                    <span className="text-xs text-slate-400">Room Air</span>
                  </div>
                  <span className="text-[10px] text-teal-600 font-medium mt-1">Target &gt; 95% met</span>
                </div>

                {/* Temp */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Core Temp
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-slate-900">{selectedPatient.vitals.temp}</span>
                    <span className="text-xs text-slate-400">Axillary</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">Afebrile status</span>
                </div>
              </div>
            </div>

            {/* Allergies & Medication Alerts */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Documented Allergies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient.allergies.length > 0 ? (
                  selectedPatient.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200"
                    >
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">NKDA (No Known Drug Allergies)</span>
                )}
              </div>
            </div>

            {/* Recent Procedures */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Clinical Timeline
              </span>
              <div className="space-y-1.5">
                {selectedPatient.recentProcedures.map((proc, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#005c65]" />
                    <span className="font-medium truncate">{proc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setRxModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Pill className="w-4 h-4 text-[#005c65]" />
                <span>Prescribe / Modify Medications</span>
              </button>

              <button
                onClick={() => {
                  setMasterEhrModalOpen(true);
                  onNotify?.(
                    'EHR Master Chart Opened',
                    `Full electronic chart for ${selectedPatient.name} accessed with timestamped signature.`,
                    'system'
                  );
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>Open Master EHR Chart</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL 1: New Patient Admission */}
      <AnimatePresence>
        {admissionModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setAdmissionModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] overflow-y-auto p-4 sm:p-6 my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">New Patient Admission</h3>
                    <p className="text-xs text-slate-500">Register inpatient and allocate hospital surgical bed</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdmissionModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmission} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Full Patient Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Henderson"
                      value={newAdmission.name}
                      onChange={(e) => setNewAdmission({ ...newAdmission, name: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">MRN Identifier</label>
                    <input
                      type="text"
                      readOnly
                      value={newAdmission.mrn}
                      className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Age</label>
                    <input
                      type="number"
                      value={newAdmission.age}
                      onChange={(e) => setNewAdmission({ ...newAdmission, age: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Gender</label>
                    <select
                      value={newAdmission.gender}
                      onChange={(e) =>
                        setNewAdmission({ ...newAdmission, gender: e.target.value as 'M' | 'F' | 'Other' })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Acuity Status</label>
                    <select
                      value={newAdmission.acuity}
                      onChange={(e) =>
                        setNewAdmission({ ...newAdmission, acuity: e.target.value as AcuityLevel })
                      }
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      <option value="Stable">Stable</option>
                      <option value="Urgent">Monitored</option>
                      <option value="Critical">Critical Care</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Attending Physician
                    </label>
                    <select
                      value={newAdmission.attendingPhysician}
                      onChange={(e) => setNewAdmission({ ...newAdmission, attendingPhysician: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      {mockDoctors.map((doc) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Allocated Room / Bed
                    </label>
                    <input
                      type="text"
                      value={newAdmission.room}
                      onChange={(e) => setNewAdmission({ ...newAdmission, room: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Primary Admitting Diagnosis &amp; Symptoms
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Mandibular fracture reduction post-trauma with surgical plating"
                    value={newAdmission.chiefComplaint}
                    onChange={(e) => setNewAdmission({ ...newAdmission, chiefComplaint: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Insurance Carrier
                    </label>
                    <input
                      type="text"
                      value={newAdmission.insurance}
                      onChange={(e) => setNewAdmission({ ...newAdmission, insurance: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Known Allergies (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newAdmission.allergies}
                      onChange={(e) => setNewAdmission({ ...newAdmission, allergies: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAdmissionModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-sm font-semibold shadow-md transition-colors"
                  >
                    Admit Patient to Ward
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 2: Inter-Ward Bed Transfer */}
      <AnimatePresence>
        {transferModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setTransferModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Inter-Ward Bed Transfer</h3>
                    <p className="text-xs text-slate-500">Reassign ward, nursing station, and telemetry terminal</p>
                  </div>
                </div>
                <button
                  onClick={() => setTransferModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Patient</label>
                  <input
                    type="text"
                    readOnly
                    value={`${selectedPatient?.name} (${selectedPatient?.mrn})`}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Current Bed</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedPatient?.room || ''}
                      className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Destination Ward</label>
                    <select
                      value={transferData.toWard}
                      onChange={(e) => setTransferData({ ...transferData, toWard: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                    >
                      <option value="ICU Tower - Bed 08">ICU Tower - Bed 08</option>
                      <option value="Surgical Suite 3 - Room 204">Surgical Suite 3 - Room 204</option>
                      <option value="Stepdown Recovery - Bay 12">Stepdown Recovery - Bay 12</option>
                      <option value="Day Clinic Ward - Bed 02">Day Clinic Ward - Bed 02</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Transfer Clinical Justification
                  </label>
                  <textarea
                    rows={3}
                    value={transferData.reason}
                    onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setTransferModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md"
                  >
                    Authorize Bed Move
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 3: Generate Discharge Summary */}
      <AnimatePresence>
        {dischargeModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setDischargeModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Generate Discharge Summary</h3>
                    <p className="text-xs text-slate-500">Authorize medical discharge and outpatient prescription release</p>
                  </div>
                </div>
                <button
                  onClick={() => setDischargeModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDischargeSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Discharging Patient</label>
                  <input
                    type="text"
                    readOnly
                    value={`${selectedPatient?.name} (${selectedPatient?.mrn})`}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Discharge Disposition</label>
                  <select
                    value={dischargeData.disposition}
                    onChange={(e) => setDischargeData({ ...dischargeData, disposition: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  >
                    <option value="Home with Self-Care">Home with Self-Care</option>
                    <option value="Home with Home Healthcare Support">Home with Home Healthcare Support</option>
                    <option value="Outpatient Physical / Dental Rehab">Outpatient Physical / Dental Rehab</option>
                    <option value="Transfer to Sub-Acute Center">Transfer to Sub-Acute Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Discharge Instructions &amp; Prescriptions
                  </label>
                  <textarea
                    rows={4}
                    value={dischargeData.instructions}
                    onChange={(e) => setDischargeData({ ...dischargeData, instructions: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#005c65]"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Executing this discharge will sign off all active telemetry monitors, trigger final invoice calculation in Billing, and close the inpatient bed slot.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDischargeModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#005c65] hover:bg-[#007782] text-white text-sm font-semibold shadow-md"
                  >
                    Confirm &amp; Finalize Discharge
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 4: Continuous Vitals Telemetry Inspection */}
      <AnimatePresence>
        {vitalsModalOpen && selectedPatient && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVitalsModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Live Telemetry &amp; Vitals History</h3>
                    <p className="text-xs text-slate-500">
                      {selectedPatient.name} • {selectedPatient.mrn} • {selectedPatient.room}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVitalsModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 uppercase">Heart Rate</span>
                    <p className="text-2xl font-bold text-rose-600 mt-1">{selectedPatient.vitals.hr} bpm</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 uppercase">Blood Press.</span>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{selectedPatient.vitals.bp}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 uppercase">SpO2</span>
                    <p className="text-2xl font-bold text-teal-700 mt-1">{selectedPatient.vitals.spO2}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 uppercase">Temperature</span>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{selectedPatient.vitals.temp}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono text-teal-400">LEAD II ECG WAVEFORM — 25mm/s</span>
                    <span className="text-emerald-400 animate-pulse">● Normal Sinus Rhythm</span>
                  </div>
                  <svg className="w-full h-16 text-emerald-400" viewBox="0 0 400 50">
                    <path
                      d="M 0 25 L 30 25 L 35 15 L 40 35 L 45 5 L 50 45 L 55 25 L 110 25 L 115 15 L 120 35 L 125 5 L 130 45 L 135 25 L 190 25 L 195 15 L 200 35 L 205 5 L 210 45 L 215 25 L 270 25 L 275 15 L 280 35 L 285 5 L 290 45 L 295 25 L 350 25 L 355 15 L 360 35 L 365 5 L 370 45 L 375 25 L 400 25"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setVitalsModalOpen(false);
                      onNotify?.('Telemetry Exported', `Vitals snapshot for ${selectedPatient.name} downloaded.`, 'system');
                    }}
                    className="px-4 py-2 bg-[#005c65] text-white rounded-lg text-sm font-semibold hover:bg-[#007782]"
                  >
                    Export 24h Vitals Log
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MODAL 5: Medication Prescriptions */}
      <AnimatePresence>
        {rxModalOpen && selectedPatient && (
          <ModalPortal>
            <div className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setRxModalOpen(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-4 sm:p-6 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c65] flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Active Prescriptions &amp; Infusions</h3>
                    <p className="text-xs text-slate-500">
                      {selectedPatient.name} • {selectedPatient.mrn}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRxModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 pt-4">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Amoxicillin / Clavulanate (Augmentin)</h4>
                    <p className="text-xs text-slate-500">875mg / 125mg PO BID • Post-surgical antimicrobial</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Ketorolac (Toradol) IV</h4>
                    <p className="text-xs text-slate-500">15mg IV Q6H PRN severe pain (Max 5 days)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                    Active PRN
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Chlorhexidine 0.12% Oral Rinse</h4>
                    <p className="text-xs text-slate-500">15 mL swish &amp; spit BID after meals</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRxModalOpen(false);
                      onNotify?.('New Rx Dispatched', 'Pharmacy team alerted for bedside dispensing.', 'system');
                    }}
                    className="px-4 py-2 bg-[#005c65] text-white rounded-lg text-sm font-semibold hover:bg-[#007782]"
                  >
                    Authorize Refill &amp; Sign
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* MASTER EHR CHART MODAL */}
      <MasterEHRModal
        isOpen={masterEhrModalOpen}
        onClose={() => setMasterEhrModalOpen(false)}
        patient={selectedPatient}
        onNotify={onNotify}
      />
    </div>
  );
};
