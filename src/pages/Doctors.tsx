import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  UserPlus, 
  Star, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { mockDoctors, mockORSuites } from '../data/mockData';
import { Doctor } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ModalPortal } from '../components/ModalPortal';

interface DoctorsProps {
  onNotify?: (title: string, message: string, type: 'critical' | 'financial' | 'triage' | 'system') => void;
}

export default function Doctors({ onNotify }: DoctorsProps = {}) {
  const { showToast } = useOutletContext<{
    showToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  }>();

  const [doctorsList, setDoctorsList] = useState<Doctor[]>(mockDoctors);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'On Duty' | 'In Surgery' | 'On Rounds' | 'Off Duty'>('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [newDoctorModalOpen, setNewDoctorModalOpen] = useState(false);

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

  const hasActiveFilters = statusFilter !== 'All' || specialtyFilter !== 'All Specialties' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setStatusFilter('All');
    setSpecialtyFilter('All Specialties');
    setSearchQuery('');
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name: newDoctorForm.name,
      title: 'Attending Clinical Practitioner',
      specialty: newDoctorForm.specialty,
      npi: newDoctorForm.npi || `NPI-${Math.floor(100000000 + Math.random() * 900000000)}`,
      room: newDoctorForm.room,
      status: 'On Duty',
      activePatients: 0,
      shift: newDoctorForm.shift,
      surgeriesToday: 0,
      rating: 5.0,
      phone: newDoctorForm.phone || '+1 (555) 000-1122',
      email: newDoctorForm.email || 'practitioner@smileclinic.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      experience: 'Board Eligible Practitioner',
    };
    setDoctorsList([newDoc, ...doctorsList]);
    setNewDoctorModalOpen(false);
    showToast('success', 'Practitioner Registered', `${newDoc.name} added to institutional roster`);
  };

  const handleScheduleSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleModalOpen(false);
    showToast('success', 'Surgery Scheduled', 'Case assigned to Main Pavilion OR Suite with automated room turnaround');
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
              42 Physicians On-Duty
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
            <span>Add Practitioner</span>
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
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> In Surgery (4)
            </span>
            <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              Turnover (1)
            </span>
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ready / Standby (1)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {mockORSuites.map((suite) => (
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
          <table className="w-full text-left border-collapse text-xs">
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
                filteredDoctors.map((doc) => (
                  <tr 
                    key={doc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedDoctor(doc)}
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
                        onClick={() => setSelectedDoctor(doc)}
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
      </div>

      {/* Doctor Detail Inspection Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <ModalPortal>
            <div 
              onClick={() => setSelectedDoctor(null)}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
            >
              <div className="p-6 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between">
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
                <button onClick={() => setSelectedDoctor(null)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Room</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedDoctor.room}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Shift Duration</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedDoctor.shift}</span>
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

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => {
                    showToast('info', 'Shift Reassigned', `${selectedDoctor.name} availability updated`);
                    setSelectedDoctor(null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Modify Shift
                </button>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* New Doctor Modal */}
      <AnimatePresence>
        {newDoctorModalOpen && (
          <ModalPortal>
            <div 
              onClick={() => setNewDoctorModalOpen(false)}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
            >
              <div className="p-5 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-base">Register Clinical Practitioner</h3>
                </div>
                <button onClick={() => setNewDoctorModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDoctor} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Practitioner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Katherine Bell, DDS"
                    value={newDoctorForm.name}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specialty</label>
                    <select
                      value={newDoctorForm.specialty}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialty: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary"
                    >
                      <option>Oral &amp; Maxillofacial Surgery</option>
                      <option>Endodontics &amp; Micro-Surgery</option>
                      <option>Orthodontics</option>
                      <option>Pediatric Dentistry</option>
                      <option>Periodontics &amp; Implants</option>
                      <option>Restorative &amp; Prosthodontics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Room</label>
                    <input
                      type="text"
                      placeholder="Operatory 6"
                      value={newDoctorForm.room}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, room: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NPI Number</label>
                    <input
                      type="text"
                      placeholder="NPI-10492850"
                      value={newDoctorForm.npi}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, npi: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Shift Hours</label>
                    <input
                      type="text"
                      placeholder="08:00 – 16:30"
                      value={newDoctorForm.shift}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, shift: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setNewDoctorModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary hover:bg-primary-container text-white font-semibold rounded-xl shadow-md"
                  >
                    Enroll Doctor
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
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
            >
              <div className="p-5 bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-between">
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
                  <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs">
                    <option>OR-1: Main Pavilion Surgical Suite</option>
                    <option>OR-2: Craniofacial Surgical Bay</option>
                    <option>OR-3: Micro-Surgical Operatory</option>
                    <option>OR-4: Pediatric Rehabilitation Suite</option>
                    <option>OR-5: Periodontal &amp; Bone Bay</option>
                    <option>OR-6: Emergency Trauma Bay (Standby)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Surgeon</label>
                  <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs">
                    {mockDoctors.map(d => (
                      <option key={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Procedure Description</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Bilateral Sinus Lift with Autogenous Bone Graft"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                    <input type="time" defaultValue="13:00" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Est. Duration</label>
                    <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs">
                      <option>1 Hour</option>
                      <option>2 Hours</option>
                      <option>3 Hours</option>
                      <option>4+ Hours</option>
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
