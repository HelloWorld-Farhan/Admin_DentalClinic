import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  Search, 
  Calendar, 
  UserPlus, 
  Star, 
  Phone, 
  Mail, 
  X, 
  Activity, 
  ShieldCheck, 
  RotateCcw,
  Upload,
  Camera,
  User,
  Clock,
  Check,
  ChevronLeft,
  Sun,
  Moon,
  Sunrise,
  MapPin
} from 'lucide-react';
import { useClinicDB } from '../lib/db';
import { Doctor } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';
import { PaginationControls } from '../components/PaginationControls';

interface DoctorsProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
}

export default function Doctors({ onNotify }: DoctorsProps = {}) {
  const { showToast } = useOutletContext<{
    showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  }>();

  // Central Database with real-time reactive sync & persistent storage
  const { doctors: doctorsList, orSuites, addDoctor, bookORSuite, updateDoctorShift } = useClinicDB();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'On Duty' | 'In Surgery' | 'On Rounds' | 'Off Duty'>('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [newDoctorModalOpen, setNewDoctorModalOpen] = useState(false);

  // Doctor Shift Modification State
  const [isModifyingShift, setIsModifyingShift] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    shiftPreset: '08:00 – 16:30',
    customStart: '08:00',
    customEnd: '16:30',
    isCustom: false,
    status: 'On Duty' as Doctor['status'],
    room: '',
  });

  const handleOpenDoctorDetail = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setIsModifyingShift(false);
    const presets = ['07:30 – 15:30', '08:00 – 16:30', '12:00 – 20:30', '20:00 – 08:00'];
    const isCustom = !presets.includes(doc.shift);
    const parts = doc.shift.split('–').map((s) => s.trim());
    setShiftForm({
      shiftPreset: isCustom ? 'custom' : doc.shift,
      customStart: parts[0] || '08:00',
      customEnd: parts[1] || '16:30',
      isCustom,
      status: doc.status,
      room: doc.room,
    });
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    const finalShift = shiftForm.isCustom
      ? `${shiftForm.customStart} – ${shiftForm.customEnd}`
      : shiftForm.shiftPreset;

    const updated = updateDoctorShift(
      selectedDoctor.id,
      finalShift,
      shiftForm.status,
      shiftForm.room.trim() || selectedDoctor.room
    );

    if (updated) {
      setSelectedDoctor({ ...selectedDoctor, ...updated });
      showToast(
        'success',
        'Shift Schedule Updated Live',
        `${selectedDoctor.name} availability reassigned to ${finalShift} (${shiftForm.status}) in ${shiftForm.room || selectedDoctor.room}`
      );
      onNotify?.(
        'Doctor Shift Updated',
        `${selectedDoctor.name} shift updated to ${finalShift} (${shiftForm.status})`,
        'system'
      );
    }
    setIsModifyingShift(false);
  };

  // Book OR Suite form state
  const [scheduleForm, setScheduleForm] = useState({
    suiteId: 'OR-1',
    surgeon: '',
    procedure: '',
    startTime: '13:00',
    durationHours: 2,
  });

  // Auto-open modal if launched from Quick Actions Hub (?add=true)
  useEffect(() => {
    if (window.location.search.includes('add=true')) {
      setNewDoctorModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Add Doctor form state (was missing — this caused the crash)
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    specialty: 'Oral & Maxillofacial Surgery',
    room: '',
    npi: '',
    shift: '',
    phone: '',
    email: '',
    photoPreview: '' as string,
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDoctorForm((prev) => ({ ...prev, photoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetDoctorForm = () => {
    setNewDoctorForm({ name: '', specialty: 'Oral & Maxillofacial Surgery', room: '', npi: '', shift: '', phone: '', email: '', photoPreview: '' });
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Freeze background window scrolling when ANY popup or modal is open
  const isAnyModalOpen = Boolean(scheduleModalOpen || newDoctorModalOpen || selectedDoctor);
  useBodyScrollLock(isAnyModalOpen);
  
  // Dynamically compute unique specialties from all registered doctors
  const uniqueSpecialties = useMemo(() => {
    const list = Array.from(new Set(doctorsList.map((d) => d.specialty))).sort();
    return ['All Specialties', ...list];
  }, [doctorsList]);

  // Dynamic status count tabs
  const statusCounts = useMemo(() => {
    return {
      All: doctorsList.length,
      'On Duty': doctorsList.filter((d) => d.status === 'On Duty').length,
      'In Surgery': doctorsList.filter((d) => d.status === 'In Surgery').length,
      'On Rounds': doctorsList.filter((d) => d.status === 'On Rounds').length,
      'Off Duty': doctorsList.filter((d) => d.status === 'Off Duty').length,
    };
  }, [doctorsList]);

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
                            doc.name.toLowerCase().includes(q) ||
                            doc.specialty.toLowerCase().includes(q) ||
                            doc.npi.toLowerCase().includes(q) ||
                            doc.room.toLowerCase().includes(q) ||
                            doc.title.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
      const matchesSpecialty = specialtyFilter === 'All Specialties' || doc.specialty === specialtyFilter;
      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [doctorsList, searchQuery, statusFilter, specialtyFilter]);

  // Pagination State (5 items per page default as chosen)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, specialtyFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));

  const paginatedDoctors = useMemo(() => {
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredDoctors.slice(start, start + pageSize);
  }, [filteredDoctors, currentPage, pageSize, totalPages]);

  const hasActiveFilters = statusFilter !== 'All' || specialtyFilter !== 'All Specialties' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setStatusFilter('All');
    setSpecialtyFilter('All Specialties');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorForm.name.trim()) {
      showToast('error', 'Name Required', 'Please input physician legal name');
      return;
    }
    const newDoc = addDoctor({
      name: newDoctorForm.name.trim(),
      title: 'Attending Clinical Practitioner',
      specialty: newDoctorForm.specialty,
      npi: newDoctorForm.npi || `NPI-${Math.floor(100000000 + Math.random() * 900000000)}`,
      room: newDoctorForm.room || 'Operatory 1',
      status: 'On Duty',
      activePatients: 0,
      shift: newDoctorForm.shift || '08:00 – 16:00',
      surgeriesToday: 0,
      rating: 5.0,
      phone: newDoctorForm.phone || '+1 (555) 000-1122',
      email: newDoctorForm.email || 'practitioner@smileclinic.com',
      avatar: newDoctorForm.photoPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      experience: 'Board Eligible Practitioner',
    });
    setNewDoctorModalOpen(false);
    resetDoctorForm();
    showToast('success', 'Doctor Added & Saved', `${newDoc.name} registered and saved to database.`);
  };

  const handleScheduleSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.procedure.trim()) {
      showToast('error', 'Procedure Required', 'Please enter surgical procedure description.');
      return;
    }
    const surgeonName = scheduleForm.surgeon || (doctorsList[0]?.name ?? 'Dr. Marcus Vance');
    const booked = bookORSuite({
      suiteId: scheduleForm.suiteId,
      surgeon: surgeonName,
      procedure: scheduleForm.procedure.trim(),
      startTime: scheduleForm.startTime,
      durationHours: scheduleForm.durationHours,
    });
    setScheduleModalOpen(false);
    setScheduleForm({
      suiteId: 'OR-1',
      surgeon: '',
      procedure: '',
      startTime: '13:00',
      durationHours: 2,
    });
    showToast(
      'success',
      'Surgery Scheduled & Live',
      `${booked?.suiteNumber || scheduleForm.suiteId} booked for ${surgeonName} with real-time room turnaround.`
    );
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Doctors Directory &amp; OR Suite Scheduling
            </h1>
            <span className="text-[11px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full">
              {doctorsList.filter((d) => d.status === 'On Duty' || d.status === 'In Surgery').length} Physicians On-Duty
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Institutional credentialing registry, operating room suite timelines, and real-time surgical case assignment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Book OR Suite</span>
          </button>

          <button
            onClick={() => setNewDoctorModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Live Surgery Suite Timeline Visualizer (OR-1 through OR-6) */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Main Pavilion Surgery Suite Real-Time Timeline (Suites 1–6)
            </h3>
            <span className="text-xs text-slate-500">Continuous turnover countdowns &amp; surgeon case load</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> In Surgery ({orSuites.filter((s) => s.status === 'In Surgery').length})
            </span>
            <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              Turnover ({orSuites.filter((s) => s.status === 'Turnover Cleaning').length})
            </span>
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ready / Standby ({orSuites.filter((s) => s.status === 'Standby' || s.status === 'Pre-Op Prep').length})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {orSuites.map((suite) => (
            <div
              key={suite.id}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {suite.suiteNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {suite.primarySurgeon}
                    </span>
                  </div>
                  <h4 className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1 line-clamp-1">
                    {suite.currentProcedure}
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  suite.status === 'In Surgery'
                    ? 'bg-amber-100 text-amber-800'
                    : suite.status === 'Turnover Cleaning'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {suite.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
                  <span>{suite.startTime} – {suite.estimatedEnd}</span>
                  <span>{suite.progressPercent}% Elapsed</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      suite.status === 'In Surgery' ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${suite.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-between">
                <span>Staff: {suite.assistingStaff}</span>
                <span className="text-primary font-semibold">Turn: 11m</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directory Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Pill Filters with Dynamic Counters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full sm:w-auto">
            {(['All', 'On Duty', 'In Surgery', 'On Rounds', 'Off Duty'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-900 text-primary font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{status}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === status ? 'bg-primary/10 text-primary' : 'bg-slate-200/80 text-slate-500'
                }`}>
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>

          {/* Specialty Select & Search */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="pl-3 pr-7 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 border-none focus:ring-2 focus:ring-primary cursor-pointer max-w-[210px]"
            >
              {uniqueSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, NPI, specialty..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 focus:bg-white rounded-xl text-xs text-slate-900 border border-transparent focus:border-primary/40 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Filter Feedback and Active Chips */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2 flex-wrap text-slate-500">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredDoctors.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{doctorsList.length}</strong> practitioners
            </span>

            {/* Active Chips */}
            {statusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('All')} className="hover:text-primary-container">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {specialtyFilter !== 'All Specialties' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-[#005c65] font-semibold text-[11px]">
                Specialty: {specialtyFilter}
                <button onClick={() => setSpecialtyFilter('All Specialties')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[11px]">
                Query: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-primary hover:text-primary-container font-semibold flex items-center gap-1 text-[11px] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Doctor Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Practitioner &amp; NPI</th>
                <th className="py-3 px-4">Specialty &amp; Role</th>
                <th className="py-3 px-4">Duty Status</th>
                <th className="py-3 px-4">Assigned Operatory</th>
                <th className="py-3 px-4">Active Patients</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Quality Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Stethoscope className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No practitioners found</p>
                      <p className="text-xs text-slate-400">
                        No doctors match the selected status &ldquo;{statusFilter}&rdquo; or specialty &ldquo;{specialtyFilter}&rdquo;.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-3.5 py-1.5 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDoctors.map((doc) => (
                  <tr 
                    key={doc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => handleOpenDoctorDetail(doc)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block group-hover:text-primary transition-colors">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{doc.npi}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{doc.specialty}</span>
                      <span className="text-[10px] text-slate-400 block">{doc.title}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        doc.status === 'On Duty'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'In Surgery'
                          ? 'bg-amber-100 text-amber-800'
                          : doc.status === 'On Rounds'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          doc.status === 'On Duty' ? 'bg-emerald-500' : doc.status === 'In Surgery' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                        {doc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {doc.room}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">{doc.activePatients}</span>
                      <span className="text-slate-400 ml-1">in queue</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {doc.shift}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenDoctorDetail(doc)}
                        className="px-2.5 py-1 text-primary hover:bg-primary/10 rounded-lg font-semibold text-xs transition-colors"
                      >
                        Inspect Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Doctor Directory Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredDoctors.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 8, 10, 20]}
          itemLabel="practitioners"
        />
      </div>

      {/* Doctor Detail Inspection & Modify Shift Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <ModalPortal>
            <div 
              onClick={() => { setSelectedDoctor(null); setIsModifyingShift(false); }}
              className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6 bg-slate-950/75 backdrop-blur-sm"
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto border border-slate-200"
            >
              <AnimatePresence mode="wait">
                {!isModifyingShift ? (
                  // VIEW MODE: Doctor Profile Card
                  <motion.div
                    key="view-profile"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full"
                  >
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={selectedDoctor.avatar}
                          alt={selectedDoctor.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/30"
                        />
                        <div>
                          <h3 className="font-bold text-base">{selectedDoctor.name}</h3>
                          <p className="text-xs text-on-primary-container">{selectedDoctor.title}</p>
                          <span className="text-[10px] text-white/80 block mt-0.5">{selectedDoctor.npi}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedDoctor(null)} 
                        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Room</span>
                          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedDoctor.room}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Shift Duration</span>
                          <motion.span 
                            key={selectedDoctor.shift}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="font-bold text-slate-900 text-sm mt-0.5 block"
                          >
                            {selectedDoctor.shift}
                          </motion.span>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <div>
                            <span className="font-bold text-emerald-900 block">Board Certified Credentials</span>
                            <span className="text-[11px] text-emerald-700">{selectedDoctor.experience}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded shadow-sm">
                          Verified
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Direct Pager / Contact
                          </span>
                          <span className="font-bold text-slate-800">{selectedDoctor.phone}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> Institutional Email
                          </span>
                          <span className="font-bold text-slate-800">{selectedDoctor.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-slate-500">Surgeries Scheduled Today</span>
                          <span className="font-bold text-primary">{selectedDoctor.surgeriesToday} Cases</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                      <button
                        onClick={() => setIsModifyingShift(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 hover:text-primary active:scale-95"
                      >
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Modify Shift</span>
                      </button>
                      <button
                        onClick={() => setSelectedDoctor(null)}
                        className="px-5 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // EDIT MODE: Dedicated Animated Shift Modification Panel
                  <motion.div
                    key="edit-shift"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full"
                  >
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsModifyingShift(false)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base leading-tight">Modify Shift Schedule</h3>
                          <p className="text-[11px] text-white/80">{selectedDoctor.name} • {selectedDoctor.specialty}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setSelectedDoctor(null); setIsModifyingShift(false); }} 
                        className="text-white/80 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveShift} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
                      {/* Presets */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Select Shift Schedule Preset
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Morning Shift', hours: '07:30 – 15:30', icon: Sunrise },
                            { label: 'Day Regular', hours: '08:00 – 16:30', icon: Sun },
                            { label: 'Afternoon / Eve', hours: '12:00 – 20:30', icon: Sun },
                            { label: 'Night / On-Call', hours: '20:00 – 08:00', icon: Moon },
                          ].map((preset) => {
                            const isSelected = !shiftForm.isCustom && shiftForm.shiftPreset === preset.hours;
                            const Icon = preset.icon;
                            return (
                              <button
                                key={preset.hours}
                                type="button"
                                onClick={() => setShiftForm({ ...shiftForm, isCustom: false, shiftPreset: preset.hours })}
                                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-xs flex items-center gap-1.5">
                                    <Icon className="w-3.5 h-3.5" />
                                    {preset.label}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono">{preset.hours}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Time Option */}
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => setShiftForm({ ...shiftForm, isCustom: true })}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                              shiftForm.isCustom
                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="font-semibold text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Custom Shift Hours
                            </span>
                            {shiftForm.isCustom && <Check className="w-3.5 h-3.5 text-primary" />}
                          </button>

                          {shiftForm.isCustom && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="grid grid-cols-2 gap-2.5 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200"
                            >
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift Start</label>
                                <input
                                  type="time"
                                  value={shiftForm.customStart}
                                  onChange={(e) => setShiftForm({ ...shiftForm, customStart: e.target.value })}
                                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift End</label>
                                <input
                                  type="time"
                                  value={shiftForm.customEnd}
                                  onChange={(e) => setShiftForm({ ...shiftForm, customEnd: e.target.value })}
                                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Clinical Duty Status */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Clinical Duty Status
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(['On Duty', 'In Surgery', 'On Rounds', 'Off Duty'] as const).map((st) => {
                            const isSelected = shiftForm.status === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setShiftForm({ ...shiftForm, status: st })}
                                className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                                  isSelected
                                    ? st === 'On Duty'
                                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                      : st === 'In Surgery'
                                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                      : st === 'On Rounds'
                                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                                      : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Assigned Operatory / Bay */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Assigned Clinic Operatory / Room
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={shiftForm.room}
                            onChange={(e) => setShiftForm({ ...shiftForm, room: e.target.value })}
                            placeholder="E.g., Diagnostic Imaging Bay, Operatory 4"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {['Diagnostic Imaging Bay', 'Operatory 1', 'Operatory 2', 'Operatory 6', 'Main Surgical Suite'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setShiftForm({ ...shiftForm, room: preset })}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sticky Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsModifyingShift(false)}
                          className="px-4 py-2 text-slate-600 font-semibold hover:text-slate-900 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save Shift Changes</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* Add Doctor Modal — mobile-optimized */}
      <AnimatePresence>
        {newDoctorModalOpen && (
          <ModalPortal>
            {/* Backdrop */}
            <div
              onClick={() => { setNewDoctorModalOpen(false); resetDoctorForm(); }}
              className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6 bg-slate-950/70 backdrop-blur-sm"
            >
              {/* Modal panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white w-full sm:max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] my-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary to-primary-container text-white shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight">Add New Doctor</h3>
                      <p className="text-[11px] text-white/75">Register to clinic roster</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setNewDoctorModalOpen(false); resetDoctorForm(); }}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Scrollable form body */}
                <form onSubmit={handleCreateDoctor} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        {/* Preview or placeholder */}
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative">
                          {newDoctorForm.photoPreview ? (
                            <img src={newDoctorForm.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-7 h-7 text-slate-400" />
                          )}
                        </div>
                        {/* Upload button */}
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Photo
                          </button>
                          <p className="text-[10px] text-slate-400">JPG, PNG or GIF · Max 5 MB</p>
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Katherine Bell, DDS"
                        value={newDoctorForm.name}
                        onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Specialty *</label>
                      <select
                        value={newDoctorForm.specialty}
                        onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialty: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white focus:outline-none transition-all"
                      >
                        <option>Oral &amp; Maxillofacial Surgery</option>
                        <option>Endodontics &amp; Micro-Surgery</option>
                        <option>Orthodontics</option>
                        <option>Pediatric Dentistry</option>
                        <option>Periodontics &amp; Implants</option>
                        <option>Restorative &amp; Prosthodontics</option>
                        <option>General Dentistry</option>
                      </select>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            placeholder="doctor@smileclinic.com"
                            value={newDoctorForm.email}
                            onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-1234"
                            value={newDoctorForm.phone}
                            onChange={(e) => setNewDoctorForm({ ...newDoctorForm, phone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Room & Shift */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assigned Room</label>
                        <input
                          type="text"
                          placeholder="Operatory 6"
                          value={newDoctorForm.room}
                          onChange={(e) => setNewDoctorForm({ ...newDoctorForm, room: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shift Hours</label>
                        <input
                          type="text"
                          placeholder="08:00 – 16:30"
                          value={newDoctorForm.shift}
                          onChange={(e) => setNewDoctorForm({ ...newDoctorForm, shift: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* NPI Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">NPI Number</label>
                      <input
                        type="text"
                        placeholder="NPI-10492850 (auto-generated if blank)"
                        value={newDoctorForm.npi}
                        onChange={(e) => setNewDoctorForm({ ...newDoctorForm, npi: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                  </div>

                  {/* Sticky footer actions */}
                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setNewDoctorModalOpen(false); resetDoctorForm(); }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-sm font-bold shadow-md shadow-primary/25 transition-all"
                    >
                      Add Doctor
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* Book OR Suite Modal */}
      <AnimatePresence>
        {scheduleModalOpen && (
          <ModalPortal>
            <div 
              onClick={() => setScheduleModalOpen(false)}
              className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain flex min-h-full items-center justify-center p-3 sm:p-6 pb-6 sm:pb-6 bg-slate-950/75 backdrop-blur-sm"
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col my-auto border border-slate-200"
            >
              <div className="p-4 sm:p-5 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-base">Book Operating Room Suite</h3>
                </div>
                <button onClick={() => setScheduleModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleSurgery} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Operating Room</label>
                  <select
                    value={scheduleForm.suiteId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, suiteId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {orSuites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.suiteNumber}: {s.suiteName} ({s.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Surgeon</label>
                  <select
                    value={scheduleForm.surgeon}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, surgeon: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">Select Lead Surgeon...</option>
                    {doctorsList.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.specialty}) — {d.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Procedure Description</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.procedure}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, procedure: e.target.value })}
                    placeholder="E.g., Bilateral Sinus Lift with Autogenous Bone Graft"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Est. Duration</label>
                    <select
                      value={scheduleForm.durationHours}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, durationHours: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value={1}>1 Hour</option>
                      <option value={2}>2 Hours</option>
                      <option value={3}>3 Hours</option>
                      <option value={4}>4 Hours</option>
                      <option value={5}>5+ Hours</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl shadow-md"
                  >
                    Confirm OR Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}
