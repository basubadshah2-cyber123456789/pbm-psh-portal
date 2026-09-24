'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  Printer,
  X,
  CheckCircle,
  Users,
  Eye,
  Trash2,
  Calendar,
  Phone,
  MapPin,
  Heart,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { AddPSHForm } from '@/components/children/AddPSHForm';

// Animated Brand Splash Intro (Opens in the beginning of the site)
function BrandIntroSplash({ onComplete }: { onComplete: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Fade out after 2.4s
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2400);

    // Remove from DOM after 3.1s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3100);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setFadingOut(true);
        setTimeout(onComplete, 500);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05030e] text-white cursor-pointer select-none transition-all duration-700 ${
        fadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Background Glows & Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.25) 1px, transparent 1px), radial-gradient(rgba(245, 158, 11, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px, 64px 64px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      {/* Radiant Glow in the center */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      {/* Top Corner Badge */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>PBM • SHM • 2026</span>
      </div>

      <div className="absolute top-6 right-6 text-[10px] text-slate-500 font-mono tracking-wider">
        CLICK ANYWHERE TO SKIP
      </div>

      {/* Main Animated Emblem & Copy */}
      <div className="relative flex flex-col items-center text-center px-4 z-10 max-w-md mx-auto">
        {/* Glowing Animated Circular Shield / Logo Container */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer Pulsing Glow Rings */}
          <div className="absolute -inset-6 rounded-full border border-emerald-500/30 animate-[spin_12s_linear_infinite]" />
          <div className="absolute -inset-3 rounded-full border border-amber-400/40 animate-[spin_8s_linear_infinite_reverse]" />
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500/30 to-amber-500/30 blur-md animate-pulse" />

          {/* Center Logo Shield */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#16102e] to-[#0d091e] border-2 border-emerald-400/80 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex items-center justify-center overflow-hidden">
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 animate-bounce">
              ☪
            </div>
          </div>
        </div>

        {/* Text Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[11px] font-extrabold tracking-[0.25em] text-emerald-300 uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>PAKISTAN BAIT-UL-MAL</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            Pakistan Sweet Home
          </h1>

          <p className="text-xs text-slate-400 tracking-wide font-medium">
            Institutional Child Welfare & Operations Portal
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-8 w-64 max-w-full space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400">SYSTEM INITIALIZING</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface EnrolledChild {
  id: string;
  fullName: string;
  fatherGuardianName: string;
  dateOfBirth: string;
  gender: string;
  bFormNo?: string | null;
  admissionNo: string;
  admissionDate: string;
  guardianName?: string | null;
  guardianRelation?: string | null;
  guardianContact?: string | null;
  address?: string | null;
  photo?: string | null;
  status: string;
  bloodGroup?: string;
  notes?: string;
}

export default function StandalonePSHAdmissionWebsite() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<'form' | 'records'>('form');
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [beds, setBeds] = useState<{ id: string; bedNumber: string; roomNumber: string }[]>([]);
  const [motherMaids, setMotherMaids] = useState<{ id: string; fullName: string }[]>([]);
  
  const [enrolledChildren, setEnrolledChildren] = useState<EnrolledChild[]>([]);
  const [justSubmittedChild, setJustSubmittedChild] = useState<EnrolledChild | null>(null);
  const [selectedDossierChild, setSelectedDossierChild] = useState<EnrolledChild | null>(null);

  // Load options and local records
  useEffect(() => {
    // 1. Load local demo records
    try {
      const savedRaw = localStorage.getItem('psh_admissions_records');
      if (savedRaw) {
        const list = JSON.parse(savedRaw);
        if (Array.isArray(list)) {
          setEnrolledChildren(list);
        }
      }
    } catch (e) {
      console.warn('Failed to load local admissions:', e);
    }

    // 2. Fetch server options if available
    const fetchOptions = async () => {
      try {
        const [classRes, hostelRes, staffRes] = await Promise.all([
          fetch('/api/education/classes').catch(() => null),
          fetch('/api/hostel/beds').catch(() => null),
          fetch('/api/staff?role=MOTHER_MAID').catch(() => null),
        ]);

        if (classRes && classRes.ok) {
          const d = await classRes.json();
          if (d.classes) setClasses(d.classes);
        }
        if (hostelRes && hostelRes.ok) {
          const d = await hostelRes.json();
          if (d.beds) setBeds(d.beds);
        }
        if (staffRes && staffRes.ok) {
          const d = await staffRes.json();
          if (d.employees) setMotherMaids(d.employees);
        }
      } catch (err) {
        console.warn('Backend options fetch skipped in standalone demo:', err);
      }
    };

    fetchOptions();
  }, []);

  const handleFormSuccess = (childData?: EnrolledChild) => {
    if (childData) {
      setJustSubmittedChild(childData);
      setEnrolledChildren((prev) => [childData, ...prev.filter((c) => c.admissionNo !== childData.admissionNo)]);
    }
  };

  const handleDeleteRecord = (admissionNo: string) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to remove this demo record?')) {
      const updated = enrolledChildren.filter((c) => c.admissionNo !== admissionNo);
      setEnrolledChildren(updated);
      try {
        localStorage.setItem('psh_admissions_records', JSON.stringify(updated));
      } catch (e) {
        console.warn('Local storage update error:', e);
      }
    }
  };

  const parseDossierNotes = (notesStr?: string) => {
    if (!notesStr) return null;
    try {
      return JSON.parse(notesStr);
    } catch {
      return null;
    }
  };

  return (
    <>
      {/* Intro Brand Splash Animation */}
      {showIntro && <BrandIntroSplash onComplete={() => setShowIntro(false)} />}

      <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex flex-col antialiased">
        {/* Official Government / PBM Header Banner */}
        <header className="bg-gradient-to-r from-[#0D5C3A] via-[#09482D] to-[#0D5C3A] text-white shadow-md sticky top-0 z-40 border-b-4 border-[#C86A28]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            {/* Official Emblem & Branding */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-inner">
                ☪
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-emerald-200 font-semibold leading-tight">
                  Government of Pakistan • Pakistan Bait-ul-Mal
                </div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                  Pakistan Sweet Home (PSH) Admission Portal
                </h1>
              </div>
            </div>

            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setJustSubmittedChild(null);
                  setActiveTab('form');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'form' && !justSubmittedChild
                    ? 'bg-white text-[#0D5C3A] shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Admission Form</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJustSubmittedChild(null);
                  setActiveTab('records');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-white text-[#0D5C3A] shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Admitted Records</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#C86A28] text-white font-black">
                  {enrolledChildren.length}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* ================= SUCCESS SUBMISSION VIEW ================= */}
          {justSubmittedChild ? (
            <div className="max-w-3xl mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-center space-y-6">
              <div className="h-16 w-16 bg-emerald-50 text-[#0D5C3A] rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle className="h-8 w-8" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Child Admission Successfully Recorded!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  The complete Pakistan Sweet Home child profile and official dossier have been created.
                </p>
              </div>

              {/* Child Brief Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Registration No:</span>
                  <span className="font-extrabold text-[#0D5C3A]">{justSubmittedChild.admissionNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Child Name:</span>
                  <span className="font-bold text-slate-900">{justSubmittedChild.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Father / Guardian:</span>
                  <span className="font-medium text-slate-800">{justSubmittedChild.fatherGuardianName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Admission Date:</span>
                  <span className="font-medium text-slate-800">{justSubmittedChild.admissionDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDossierChild(justSubmittedChild)}
                  className="px-5 py-2.5 bg-[#0D5C3A] hover:bg-[#0b4d30] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>View & Print Official Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setJustSubmittedChild(null);
                    setActiveTab('records');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-lg border border-slate-300 cursor-pointer transition-all"
                >
                  <span>View All Records</span>
                </button>

                <button
                  type="button"
                  onClick={() => setJustSubmittedChild(null)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs cursor-pointer transition-all"
                >
                  <span>➕ Admit Another Child</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'form' ? (
            /* ================= ADMISSION FORM VIEW ================= */
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-base sm:text-lg">
                  <span className="text-[#C86A28]">Pakistan Sweet Home</span>
                  <span>• Child Admission Form</span>
                </div>
              </div>

              {/* The Add PSH Form */}
              <AddPSHForm
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                classes={classes}
                beds={beds}
                motherMaids={motherMaids}
              />
            </div>
          ) : (
            /* ================= ADMITTED RECORDS REGISTER VIEW ================= */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Admitted Children Register & Dossiers
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Institutional record directory of admitted children in Pakistan Sweet Home Multan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setJustSubmittedChild(null);
                    setActiveTab('form');
                  }}
                  className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0b4d30] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>New Child Admission</span>
                </button>
              </div>

              {enrolledChildren.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">No Admission Records Found</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You can fill the admission form or use the Auto-Fill feature to create a sample child record.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-4 py-2 bg-[#0D5C3A] text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-[#0b4d30]"
                  >
                    Go to Admission Form
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Reg No</th>
                        <th className="py-3 px-4">Child Full Name</th>
                        <th className="py-3 px-4">Father / Guardian</th>
                        <th className="py-3 px-4">Gender</th>
                        <th className="py-3 px-4">Admission Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {enrolledChildren.map((child) => (
                        <tr key={child.admissionNo} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#0D5C3A]">
                            {child.admissionNo}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {child.fullName}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {child.fatherGuardianName}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {child.gender}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {child.admissionDate}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {child.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDossierChild(child)}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0D5C3A] font-bold rounded text-xs flex items-center gap-1 border border-emerald-200 cursor-pointer transition-colors"
                                title="Print / View Official Child Dossier"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Dossier</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(child.admissionNo)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ================= OFFICIAL PRINTABLE CHILD DOSSIER MODAL ================= */}
        {selectedDossierChild && (() => {
          const psh = parseDossierNotes(selectedDossierChild.notes);
          return (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto max-h-[92vh] overflow-y-auto">
                {/* Modal Top Actions */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 no-print">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Official Child Profile Dossier Preview
                    </span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-[#0D5C3A] border border-emerald-300">
                      Category: {psh?.category?.type || 'Orphan'} {psh?.enrollmentType?.replacedRegistrationNo ? `(Replaced: ${psh.enrollmentType.replacedRegistrationNo})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') window.print();
                      }}
                      className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#0b4d30] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Official Dossier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDossierChild(null)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Printable Document Body */}
                <div className="pt-6 space-y-5 text-slate-900">
                  {/* 1. Header with Government / PBM Seal */}
                  <div className="text-center border-b-2 border-[#0D5C3A] pb-4">
                    <div className="inline-block p-2 rounded-full bg-emerald-50 border border-emerald-300 mb-2">
                      <Shield className="w-8 h-8 text-[#0D5C3A] mx-auto" />
                    </div>
                    <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                      PAKISTAN BAIT-UL-MAL
                    </h2>
                    <h3 className="text-sm font-bold text-[#0D5C3A] uppercase tracking-wide">
                      SWEET HOME MULTAN • RESIDENT CHILD OFFICIAL DOSSIER
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Near Eidgah, LMQ Road, Multan, Punjab, Pakistan | Institutional Welfare File & Permanent Record
                    </p>
                  </div>

                  {/* Section 1: Category */}
                  <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#0D5C3A] uppercase tracking-wider block">1. CATEGORY</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {psh?.category?.type || 'Orphan'}
                      </span>
                    </div>
                  </div>

                  {/* Section 2: Category 2 */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#0D5C3A] uppercase tracking-wider block">2. CATEGORY 2</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {psh?.enrollmentType?.type || 'New Enrollment'}
                      </span>
                    </div>
                    {psh?.enrollmentType?.replacedRegistrationNo && (
                      <div className="text-right">
                        <span className="text-[10px] text-amber-800 font-bold block">Replaced Registration No</span>
                        <span className="font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          {psh.enrollmentType.replacedRegistrationNo}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Basic Info */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider">3. BASIC INFO</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#0D5C3A]">
                        Status: {selectedDossierChild.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Registration No:</span>
                        <span className="font-bold text-[#0D5C3A]">{selectedDossierChild.admissionNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Admission Date:</span>
                        <span className="font-semibold text-slate-800">{selectedDossierChild.admissionDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Full Name:</span>
                        <span className="font-bold text-slate-900">{selectedDossierChild.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">B-Form / CNIC:</span>
                        <span className="font-semibold text-slate-800">{selectedDossierChild.bFormNo || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Date of Birth:</span>
                        <span className="font-semibold text-slate-800">{selectedDossierChild.dateOfBirth}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Gender:</span>
                        <span className="font-semibold text-slate-800">{selectedDossierChild.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Family Cast:</span>
                        <span className="font-semibold text-slate-800">{psh?.basicInfo?.familyCast || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mother Language:</span>
                        <span className="font-semibold text-slate-800">{psh?.basicInfo?.motherLanguage || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Birth District:</span>
                        <span className="font-semibold text-slate-800">{psh?.basicInfo?.birthDistrict || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Identification Mark:</span>
                        <span className="font-semibold text-slate-800">{psh?.basicInfo?.identificationMark || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Next of Kin:</span>
                        <span className="font-semibold text-slate-800">{psh?.basicInfo?.nextOfKin || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Sponsorship:</span>
                        <span className="font-semibold text-slate-800">{psh?.basicInfo?.isSponsored || 'No'} {psh?.basicInfo?.sponsorshipAmount ? `(Rs. ${psh.basicInfo.sponsorshipAmount})` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Health Info */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-2">4. HEALTH INFO</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Disabled:</span>
                        <span className="font-semibold text-slate-800">{psh?.healthInfo?.isDisable || 'No'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Blood Group:</span>
                        <span className="font-bold text-red-600">{psh?.healthInfo?.bloodGroup || selectedDossierChild.bloodGroup || 'B+'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mental Health:</span>
                        <span className="font-semibold text-slate-800">{psh?.healthInfo?.mentalHealth || 'Normal'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Physical Health:</span>
                        <span className="font-semibold text-slate-800">{psh?.healthInfo?.physicalHealth || 'Good'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vaccination:</span>
                        <span className="font-semibold text-slate-800">{psh?.healthInfo?.vaccinationDetail || 'Complete'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Special Need / Disease:</span>
                        <span className="font-semibold text-slate-800">{psh?.healthInfo?.specialNeedDisease || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 5 & 6: Parents Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Father Info */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">5. FATHER INFO</span>
                      <div><span className="text-slate-400">Name:</span> <span className="font-bold">{psh?.fatherInfo?.name || 'N/A'}</span></div>
                      <div><span className="text-slate-400">CNIC:</span> <span>{psh?.fatherInfo?.cnic || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Is Alive:</span> <span className="font-semibold">{psh?.fatherInfo?.isAlive || 'No'} {psh?.fatherInfo?.dod ? `(DOD: ${psh.fatherInfo.dod})` : ''}</span></div>
                      <div><span className="text-slate-400">Profession:</span> <span>{psh?.fatherInfo?.profession || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Address:</span> <span>{psh?.fatherInfo?.address || 'N/A'}</span></div>
                    </div>

                    {/* Mother Info */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">6. MOTHER INFO</span>
                      <div><span className="text-slate-400">Name:</span> <span className="font-bold">{psh?.motherInfo?.name || 'N/A'}</span></div>
                      <div><span className="text-slate-400">CNIC:</span> <span>{psh?.motherInfo?.cnic || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Is Alive:</span> <span className="font-semibold">{psh?.motherInfo?.isAlive || 'Yes'} {psh?.motherInfo?.dod ? `(DOD: ${psh.motherInfo.dod})` : ''}</span></div>
                      <div><span className="text-slate-400">Profession:</span> <span>{psh?.motherInfo?.profession || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Address:</span> <span>{psh?.motherInfo?.address || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Section 7: Guardian Info */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">7. GUARDIAN INFO</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div><span className="text-slate-400">Name:</span> <span className="font-bold">{psh?.guardianInfo?.name || selectedDossierChild.guardianName || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Relation:</span> <span>{psh?.guardianInfo?.relation || selectedDossierChild.guardianRelation || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Contact:</span> <span>{psh?.guardianInfo?.contact || selectedDossierChild.guardianContact || 'N/A'}</span></div>
                      <div><span className="text-slate-400">CNIC:</span> <span>{psh?.guardianInfo?.cnic || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Profession:</span> <span>{psh?.guardianInfo?.profession || 'N/A'}</span></div>
                      <div><span className="text-slate-400">Address:</span> <span>{psh?.guardianInfo?.address || selectedDossierChild.address || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Section 8: Meeting Persons */}
                  {psh?.meetingPersons && psh.meetingPersons.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">8. MEETING PERSONS</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100 text-[10px]">
                            <th className="py-1">Name</th>
                            <th>Relation</th>
                            <th>CNIC</th>
                            <th>Contact</th>
                            <th>Schedule</th>
                          </tr>
                        </thead>
                        <tbody>
                          {psh.meetingPersons.map((p: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-50">
                              <td className="py-1 font-bold">{p.name || 'N/A'}</td>
                              <td>{p.relation || 'N/A'}</td>
                              <td>{p.cnic || 'N/A'}</td>
                              <td>{p.contact || 'N/A'}</td>
                              <td>{p.dateTime || 'Scheduled'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Section 9: Siblings Info */}
                  {psh?.siblings && psh.siblings.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">9. SIBLINGS INFO</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100 text-[10px]">
                            <th className="py-1">Name</th>
                            <th>Gender</th>
                            <th>Age</th>
                            <th>Grade / Class</th>
                            <th>Institution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {psh.siblings.map((s: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-50">
                              <td className="py-1 font-bold">{s.name || 'N/A'}</td>
                              <td>{s.gender || 'N/A'}</td>
                              <td>{s.age || 'N/A'}</td>
                              <td>{s.gradeClass || 'N/A'}</td>
                              <td>{s.institution || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Section 10: Witness Info */}
                  {psh?.witnesses && psh.witnesses.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">10. WITNESS INFO</span>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100 text-[10px]">
                            <th className="py-1">Witness Name</th>
                            <th>CNIC</th>
                            <th>Father Name</th>
                            <th>Contact</th>
                            <th>Profession</th>
                          </tr>
                        </thead>
                        <tbody>
                          {psh.witnesses.map((w: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-50">
                              <td className="py-1 font-bold">{w.name || 'N/A'}</td>
                              <td>{w.cnic || 'N/A'}</td>
                              <td>{w.fatherName || 'N/A'}</td>
                              <td>{w.contact || 'N/A'}</td>
                              <td>{w.profession || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Section 11: Result Info */}
                  {psh?.resultInfo && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">11. RESULT INFO</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                        <div><span className="text-slate-400">School:</span> <span className="font-bold">{psh.resultInfo.school || 'N/A'}</span></div>
                        <div><span className="text-slate-400">Class:</span> <span>{psh.resultInfo.gradeClass || 'N/A'}</span></div>
                        <div><span className="text-slate-400">Exam Type:</span> <span>{psh.resultInfo.examType || 'Annual'}</span></div>
                        <div><span className="text-slate-400">Score:</span> <span className="font-bold text-emerald-800">{psh.resultInfo.passingScore || 'N/A'}</span></div>
                      </div>
                      {psh.resultInfo.subjectResults && psh.resultInfo.subjectResults.length > 0 && (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100 text-[10px]">
                              <th className="py-1">Subject</th>
                              <th>Obtained Marks</th>
                              <th>Total Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {psh.resultInfo.subjectResults.map((sub: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-50">
                                <td className="py-1 font-semibold">{sub.subject}</td>
                                <td className="font-bold text-slate-900">{sub.obtainedMarks}</td>
                                <td className="text-slate-500">{sub.totalMarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Section 12 & 13: Health & Report */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">12. HEALTH CARE</span>
                      <div><span className="text-slate-400">Frequency:</span> <span className="font-semibold">{psh?.healthCare?.checkFrequency || 'Monthly'}</span></div>
                      <div><span className="text-slate-400">Medicines:</span> <span>{psh?.healthCare?.medicineDetails || 'None'}</span></div>
                      <div><span className="text-slate-400">Antibiotics:</span> <span>{psh?.healthCare?.antibioticMedicine || 'None'}</span></div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">13. REPORT</span>
                      <div><span className="text-slate-400">Complain Type:</span> <span className="font-semibold">{psh?.reports?.category || 'Academic'}</span></div>
                      <div><span className="text-slate-400">Details:</span> <span className="italic">{psh?.reports?.details || 'Standard routine report recorded.'}</span></div>
                    </div>
                  </div>

                  {/* Section 14: Area of Interest – Child */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">14. AREA OF INTEREST – CHILD</span>
                    <p className="text-slate-800 font-medium pt-1">
                      {psh?.areaOfInterest || 'No specific interest recorded.'}
                    </p>
                  </div>

                  {/* Section 15: Attachments Summary */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-[#0D5C3A] uppercase tracking-wider block border-b border-slate-100 pb-1.5">15. ATTACHMENTS VERIFICATION</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {psh?.attachmentsSummary?.map((att: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${att.attached ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-slate-700">{att.title}</span>
                        </div>
                      )) || (
                        <span className="text-slate-400">All mandatory admission documents on file.</span>
                      )}
                    </div>
                  </div>

                  {/* Official Signatures Block */}
                  <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                    <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">
                      Clerk / Data Officer
                    </div>
                    <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">
                      Mother Maid / Caretaker
                    </div>
                    <div className="border-t border-slate-400 pt-2 font-bold text-[#0D5C3A]">
                      Incharge Sweet Home Multan
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
