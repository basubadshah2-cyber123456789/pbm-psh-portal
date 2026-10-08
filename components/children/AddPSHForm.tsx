'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Sparkles,
  Award,
  Camera,
  Eye,
} from 'lucide-react';
import { ChildPhotoPicker } from './ChildPhotoPicker';
import { CameraCaptureModal } from '@/components/common/CameraCaptureModal';
import { formatCNIC, formatPhone } from '@/lib/formatters';

// Interfaces
export interface MeetingPersonRecord {
  id: string;
  name: string;
  relation: string;
  cnic: string;
  contact: string;
  qualification: string;
  profession: string;
  dateTime: string;
  startDateTime: string;
  endDateTime: string;
  district: string;
  tehsil: string;
  ucNumber: string;
  ucName?: string;
  streetNumber: string;
  houseNumber: string;
  address: string;
}

export interface SiblingRecord {
  id: string;
  name: string;
  gender: string;
  age: string;
  qualification: string;
  profession: string;
  institution: string;
  gradeClass: string;
  maritalStatus: string;
  district: string;
  tehsil: string;
  ucNumber: string;
  ucName?: string;
  streetNumber: string;
  houseNumber: string;
  address: string;
}

export interface WitnessRecord {
  id: string;
  name: string;
  cnic: string;
  fatherName: string;
  contact: string;
  address: string;
  district?: string;
  tehsil?: string;
  ucNumber?: string;
  ucName?: string;
  streetNumber?: string;
  houseNumber?: string;
  qualification: string;
  profession: string;
}

export interface AdditionalGuardianRecord {
  id: string;
  name: string;
  relation: string;
  contact: string;
  cnic: string;
  qualification: string;
  profession: string;
  address: string;
  district: string;
  tehsil: string;
  ucNumber: string;
  ucName?: string;
  streetNumber: string;
  houseNumber: string;
}

export interface SubjectResultRow {
  id: string;
  subject: string;
  obtainedMarks: string;
  totalMarks: string;
}

interface AddPSHFormProps {
  onSuccess: (savedChild?: any) => void;
  onCancel: () => void;
  initialChild?: any;
  classes?: { id: string; name: string }[];
  beds?: { id: string; bedNumber: string; roomNumber: string }[];
  motherMaids?: { id: string; fullName: string }[];
}

// Simple Outlined Input with Crisp Dark Border & Floating Label
function FormInput({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  name,
  min,
  step,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  min?: number;
  step?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="absolute -top-2.5 left-3 bg-slate-50 px-1 text-[11px] sm:text-xs font-bold text-slate-700 z-10 select-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        min={min}
        step={step}
        placeholder={placeholder || (label ? '' : undefined)}
        className="w-full h-12 sm:h-11 px-3.5 py-2 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.02)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed transition-all duration-200"
      />
    </div>
  );
}

// Simple Outlined Select with Crisp Dark Border & Floating Label
function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select',
  required = false,
  disabled = false,
  className = '',
}: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[] | string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="absolute -top-2.5 left-3 bg-slate-50 px-1 text-[11px] sm:text-xs font-bold text-slate-700 z-10 select-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full h-12 sm:h-11 px-3.5 py-2 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed transition-all duration-200 appearance-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

// Section Header with Warm Orange/Terracotta Color and Animated Status Badge
function SectionHeading({
  title,
  step,
  isCompleted,
}: {
  title: string;
  step?: number;
  isCompleted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
      {isCompleted && (
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-200 transition-all duration-300"
        >
          ✓
        </span>
      )}
      <h3 className="text-slate-900 font-bold text-sm sm:text-base tracking-tight">
        {typeof step === 'number' ? `Category No. ${step} — ${title}` : title}
      </h3>
    </div>
  );
}

export function AddPSHForm({ onSuccess, onCancel, initialChild }: AddPSHFormProps) {
  const generateAdmissionNo = () => `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // ================= 1. ENROLLMENT TYPE =================
  const [enrollmentType, setEnrollmentType] = useState<string>('New Enrollment');
  const [replacedRegistrationNo, setReplacedRegistrationNo] = useState<string>('');
  const [replacedClass, setReplacedClass] = useState<string>('');
  const [replacedSchoolName, setReplacedSchoolName] = useState<string>('');
  const [schoolLeavingCertificateFile, setSchoolLeavingCertificateFile] = useState<File | null>(null);
  const [savedSchoolLeavingCertificateName, setSavedSchoolLeavingCertificateName] = useState<string>('');

  // ================= 2. CATEGORY =================
  const [category, setCategory] = useState<string>('Orphan');

  // ================= 2. BASIC INFO =================
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [registrationNo, setRegistrationNo] = useState<string>(generateAdmissionNo());
  const [admissionDate, setAdmissionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fullName, setFullName] = useState<string>('');
  const [bFormNo, setBFormNo] = useState<string>('');
  const [bFormFrontFile, setBFormFrontFile] = useState<File | null>(null);
  const [bFormBackFile, setBFormBackFile] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<string>('2016-01-15');
  const [gender, setGender] = useState<string>('');
  const [familyCast, setFamilyCast] = useState<string>('');
  const [motherLanguage, setMotherLanguage] = useState<string>('');
  const [birthDistrict, setBirthDistrict] = useState<string>('');
  const [identificationMark, setIdentificationMark] = useState<string>('');
  const [nextOfKin, setNextOfKin] = useState<string>('');
  const [isSponsored, setIsSponsored] = useState<string>('');
  const [sponsorshipAmount, setSponsorshipAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [dateOfStatus, setDateOfStatus] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusRemarks, setStatusRemarks] = useState<string>('');

  // ================= 3. HEALTH INFO =================
  const [isDisable, setIsDisable] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [mentalHealth, setMentalHealth] = useState<string>('');
  const [physicalHealth, setPhysicalHealth] = useState<string>('');
  const [vaccinationDetail, setVaccinationDetail] = useState<string>('');
  const [specialNeedDisease, setSpecialNeedDisease] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');

  // ================= 4. FATHER INFO =================
  const [fatherName, setFatherName] = useState<string>('');
  const [fatherCnic, setFatherCnic] = useState<string>('');
  const [fatherContact, setFatherContact] = useState<string>('');
  const [fatherIsAlive, setFatherIsAlive] = useState<string>('');
  const [fatherDob, setFatherDob] = useState<string>('');
  const [fatherDod, setFatherDod] = useState<string>('');
  const [fatherCauseOfDeath, setFatherCauseOfDeath] = useState<string>('');
  const [fatherQualification, setFatherQualification] = useState<string>('');
  const [fatherProfession, setFatherProfession] = useState<string>('');
  const [fatherDistrict, setFatherDistrict] = useState<string>('');
  const [fatherTehsil, setFatherTehsil] = useState<string>('');
  const [fatherStreetNumber, setFatherStreetNumber] = useState<string>('');
  const [fatherHouseNumber, setFatherHouseNumber] = useState<string>('');
  const [fatherUcNumber, setFatherUcNumber] = useState<string>('');
  const [fatherUcName, setFatherUcName] = useState<string>('');
  const [fatherAddress, setFatherAddress] = useState<string>('');

  // ================= 5. MOTHER INFO =================
  const [motherName, setMotherName] = useState<string>('');
  const [motherCnic, setMotherCnic] = useState<string>('');
  const [motherContact, setMotherContact] = useState<string>('');
  const [motherIsAlive, setMotherIsAlive] = useState<string>('');
  const [motherDob, setMotherDob] = useState<string>('');
  const [motherDod, setMotherDod] = useState<string>('');
  const [motherCauseOfDeath, setMotherCauseOfDeath] = useState<string>('');
  const [motherQualification, setMotherQualification] = useState<string>('');
  const [motherProfession, setMotherProfession] = useState<string>('');
  const [motherDistrict, setMotherDistrict] = useState<string>('');
  const [motherTehsil, setMotherTehsil] = useState<string>('');
  const [motherStreetNumber, setMotherStreetNumber] = useState<string>('');
  const [motherHouseNumber, setMotherHouseNumber] = useState<string>('');
  const [motherUcNumber, setMotherUcNumber] = useState<string>('');
  const [motherUcName, setMotherUcName] = useState<string>('');
  const [motherAddress, setMotherAddress] = useState<string>('');

  // ================= 6. GUARDIAN INFO =================
  const [guardianName, setGuardianName] = useState<string>('');
  const [guardianRelation, setGuardianRelation] = useState<string>('');
  const [guardianContact, setGuardianContact] = useState<string>('');
  const [guardianCnic, setGuardianCnic] = useState<string>('');
  const [guardianQualification, setGuardianQualification] = useState<string>('');
  const [guardianProfession, setGuardianProfession] = useState<string>('');
  const [guardianAddress, setGuardianAddress] = useState<string>('');
  const [guardianDistrict, setGuardianDistrict] = useState<string>('');
  const [guardianTehsil, setGuardianTehsil] = useState<string>('');
  const [guardianUcNumber, setGuardianUcNumber] = useState<string>('');
  const [guardianUcName, setGuardianUcName] = useState<string>('');
  const [guardianStreetNumber, setGuardianStreetNumber] = useState<string>('');
  const [guardianHouseNumber, setGuardianHouseNumber] = useState<string>('');
  const [guardianAddressType, setGuardianAddressType] = useState('');
  const [guardianPostOffice, setGuardianPostOffice] = useState('');
  const [guardianColony, setGuardianColony] = useState('');
  const [sameAsPermanentAddress, setSameAsPermanentAddress] = useState(false);
  const [currentGuardianAddress, setCurrentGuardianAddress] = useState({
    addressType: '',
    postOffice: '',
    colony: '',
    address: '',
    district: '',
    tehsil: '',
    ucNumber: '',
    ucName: '',
    streetNumber: '',
    houseNumber: '',
  });
  const [additionalGuardians, setAdditionalGuardians] = useState<AdditionalGuardianRecord[]>([]);

  useEffect(() => {
    if (!sameAsPermanentAddress) return;
    setCurrentGuardianAddress({
      addressType: guardianAddressType,
      postOffice: guardianPostOffice,
      colony: guardianColony,
      address: guardianAddress,
      district: guardianDistrict,
      tehsil: guardianTehsil,
      ucNumber: guardianUcNumber,
      ucName: guardianUcName,
      streetNumber: guardianStreetNumber,
      houseNumber: guardianHouseNumber,
    });
  }, [
    sameAsPermanentAddress,
    guardianAddressType,
    guardianPostOffice,
    guardianColony,
    guardianAddress,
    guardianDistrict,
    guardianTehsil,
    guardianUcNumber,
    guardianUcName,
    guardianStreetNumber,
    guardianHouseNumber,
  ]);

  const updateCurrentGuardianAddress = (
    field: keyof typeof currentGuardianAddress,
    value: string
  ) => {
    setCurrentGuardianAddress((current) => ({ ...current, [field]: value }));
  };

  const addGuardian = () => {
    setAdditionalGuardians((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        name: '',
        relation: '',
        contact: '',
        cnic: '',
        qualification: '',
        profession: '',
        address: '',
        district: '',
        tehsil: '',
        ucNumber: '',
        ucName: '',
        streetNumber: '',
        houseNumber: '',
      },
    ]);
  };

  const updateGuardian = (id: string, field: keyof AdditionalGuardianRecord, value: string) => {
    let formattedValue = value;
    if (field === 'cnic') formattedValue = formatCNIC(value);
    if (field === 'contact') formattedValue = formatPhone(value);
    setAdditionalGuardians((current) =>
      current.map((guardian) => guardian.id === id ? { ...guardian, [field]: formattedValue } : guardian)
    );
  };

  // ================= 7. MEETING PERSON INFO =================
  const [meetingPersons, setMeetingPersons] = useState<MeetingPersonRecord[]>([
    {
      id: '1',
      name: '',
      relation: '',
      cnic: '',
      contact: '',
      qualification: '',
      profession: '',
      dateTime: '',
      startDateTime: '',
      endDateTime: '',
      district: '',
      tehsil: '',
      ucNumber: '',
      ucName: '',
      streetNumber: '',
      houseNumber: '',
      address: '',
    },
  ]);

  const addMeetingPerson = () => {
    setMeetingPersons((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        relation: '',
        cnic: '',
        contact: '',
        qualification: '',
        profession: '',
        dateTime: '',
        startDateTime: '',
        endDateTime: '',
        district: '',
        tehsil: '',
        ucNumber: '',
        ucName: '',
        streetNumber: '',
        houseNumber: '',
        address: '',
      },
    ]);
  };

  const removeMeetingPerson = (id: string) => {
    if (meetingPersons.length <= 1) return;
    setMeetingPersons((prev) => prev.filter((p) => p.id !== id));
  };

  const updateMeetingPerson = (id: string, field: keyof MeetingPersonRecord, value: string) => {
    let formattedVal = value;
    if (field === 'cnic') formattedVal = formatCNIC(value);
    if (field === 'contact') formattedVal = formatPhone(value);
    setMeetingPersons((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: formattedVal } : p))
    );
  };

  // ================= 8. SIBLINGS INFO =================
  const [siblings, setSiblings] = useState<SiblingRecord[]>([
    {
      id: '1',
      name: '',
      gender: '',
      age: '',
      qualification: '',
      profession: '',
      institution: '',
      gradeClass: '',
      maritalStatus: '',
      district: '',
      tehsil: '',
      ucNumber: '',
      ucName: '',
      streetNumber: '',
      houseNumber: '',
      address: '',
    },
  ]);

  const addSibling = () => {
    setSiblings((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        gender: '',
        age: '',
        qualification: '',
        profession: '',
        institution: '',
        gradeClass: '',
        maritalStatus: '',
        district: '',
        tehsil: '',
        ucNumber: '',
        ucName: '',
        streetNumber: '',
        houseNumber: '',
        address: '',
      },
    ]);
  };

  const removeSibling = (id: string) => {
    if (siblings.length <= 1) return;
    setSiblings((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSibling = (id: string, field: keyof SiblingRecord, value: string) => {
    setSiblings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // ================= 9. WITNESS INFO =================
  const [witnesses, setWitnesses] = useState<WitnessRecord[]>([
    {
      id: '1',
      name: '',
      cnic: '',
      fatherName: '',
      contact: '',
      qualification: '',
      profession: '',
      address: '',
    },
  ]);

  const addWitness = () => {
    setWitnesses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        cnic: '',
        fatherName: '',
        contact: '',
        qualification: '',
        profession: '',
        address: '',
      },
    ]);
  };

  const removeWitness = (id: string) => {
    if (witnesses.length <= 1) return;
    setWitnesses((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWitness = (id: string, field: keyof WitnessRecord, value: string) => {
    let formattedVal = value;
    if (field === 'cnic') formattedVal = formatCNIC(value);
    if (field === 'contact') formattedVal = formatPhone(value);
    setWitnesses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: formattedVal } : w))
    );
  };

  // ================= 10. RESULT INFO =================
  const [resultSchool, setResultSchool] = useState<string>('');
  const [resultClass, setResultClass] = useState<string>('');
  const [resultExamDate, setResultExamDate] = useState<string>('');
  const [resultExamType, setResultExamType] = useState<string>('');
  const [resultPassingScore, setResultPassingScore] = useState<string>('');

  const [subjectResults, setSubjectResults] = useState<SubjectResultRow[]>([
    { id: '1', subject: '', obtainedMarks: '', totalMarks: '' },
  ]);

  const addSubjectResult = () => {
    setSubjectResults((prev) => [
      ...prev,
      { id: Date.now().toString(), subject: '', obtainedMarks: '', totalMarks: '' },
    ]);
  };

  const removeSubjectResult = (id: string) => {
    if (subjectResults.length <= 1) return;
    setSubjectResults((prev) => prev.filter((r) => r.id !== id));
  };

  const updateSubjectResult = (id: string, field: keyof SubjectResultRow, value: string) => {
    setSubjectResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // ================= 11. NEW HEALTH SECTION =================
  const [checkFrequency, setCheckFrequency] = useState<string>('');
  const [medicineDetails, setMedicineDetails] = useState<string>('');
  const [antibioticMedicine, setAntibioticMedicine] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [doctorContactNo, setDoctorContactNo] = useState<string>('');
  const [hospitalType, setHospitalType] = useState<string>('');
  const [prescriptionPhotoFile, setPrescriptionPhotoFile] = useState<File | null>(null);

  // ================= 12. NEW REPORT SECTION =================
  const [reportCategory, setReportCategory] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [writtenReportFile, setWrittenReportFile] = useState<File | null>(null);

  // ================= 13. AREA OF INTEREST – CHILD =================
  const [areaOfInterest, setAreaOfInterest] = useState<string>('');

  // ================= 14. ATTACHMENTS =================
  const [attachments, setAttachments] = useState<Record<string, { file: File | null; title: string }>>({
    fatherCnicFront: { file: null, title: 'Father CNIC Front' },
    fatherCnicBack: { file: null, title: 'Father CNIC Back' },
    motherCnic: { file: null, title: 'Mother CNIC' },
    cnicBack: { file: null, title: 'CNIC (Back)' },
    guardianCnic: { file: null, title: 'Guardian CNIC' },
    guardianCnicBack: { file: null, title: 'Guardian CNIC (Back)' },
    medicalCertificate: { file: null, title: 'Any Medical Certificate' },
    witnessCnicFront: { file: null, title: 'Witness CNIC (Front)' },
    witnessCnicBack: { file: null, title: 'Witness CNIC (Back)' },
    fatherDeathCertificate: { file: null, title: 'Father Death Certificate' },
  });

  const handleAttachmentUpload = (key: string, file: File | null) => {
    setAttachments((prev) => ({
      ...prev,
      [key]: { ...prev[key], file },
    }));
  };

  const getSavedDocument = (documentType: string) => (
    Array.isArray(initialChild?.documents)
      ? initialChild.documents
          .filter((document: any) => document.documentType === documentType)
          .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0] || null
      : null
  );

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Live Camera Capture State
  const [activeCameraModal, setActiveCameraModal] = useState<'none' | 'prescription' | 'report' | 'attachment'>('none');
  const [activeAttachmentKey, setActiveAttachmentKey] = useState<string | null>(null);

  // Real-Time Form Completion Score across all 15 official PBM/PSH Sections
  const completionStats = useMemo(() => {
    let filled = 0;
    const total = 15;

    // 1. Category
    if (category) filled++;
    // 2. Category 2 (Enrollment Type)
    if (enrollmentType) filled++;
    // 3. Basic Info
    if (fullName && (bFormNo || dateOfBirth) && gender) filled++;
    // 4. Health Info
    if (bloodGroup || mentalHealth || physicalHealth) filled++;
    // 5. Father Info
    if (fatherName || fatherIsAlive) filled++;
    // 6. Mother Info
    if (motherName || motherIsAlive) filled++;
    // 7. Guardian Info
    if (guardianName || guardianRelation || additionalGuardians.some((guardian) => guardian.name || guardian.relation)) filled++;
    // 8. Meeting Persons Info
    if (meetingPersons.some((p) => !!p.name.trim())) filled++;
    // 9. Sibling Info
    if (siblings.some((s) => !!s.name.trim())) filled++;
    // 10. Witness Info
    if (witnesses.some((w) => !!w.name.trim())) filled++;
    // 11. Result Info
    if (resultSchool || subjectResults.some((s) => !!s.subject.trim())) filled++;
    // 12. Health Care
    if (checkFrequency || medicineDetails || doctorName || hospitalName || doctorContactNo || hospitalType) filled++;
    // 13. Report
    if (reportCategory || reportDetails) filled++;
    // 14. Area of Interest
    if (areaOfInterest.trim()) filled++;
    // 15. Attachments
    if (profilePhotoFile || Object.values(attachments).some((a) => a.file !== null)) filled++;

    const percent = Math.round((filled / total) * 100);
    return {
      filled,
      total,
      percent,
      isCat1Complete: !!category,
      isCat2Complete: !!enrollmentType,
      isBasicComplete: !!(fullName && (bFormNo || dateOfBirth) && gender),
      isHealthComplete: !!(bloodGroup || mentalHealth || physicalHealth),
      isFatherComplete: !!(fatherName || fatherIsAlive),
      isMotherComplete: !!(motherName || motherIsAlive),
      isGuardianComplete: !!(guardianName || guardianRelation || additionalGuardians.some((guardian) => guardian.name || guardian.relation)),
      isMeetingComplete: meetingPersons.some((p) => !!p.name.trim()),
      isSiblingComplete: siblings.some((s) => !!s.name.trim()),
      isWitnessComplete: witnesses.some((w) => !!w.name.trim()),
      isResultComplete: !!(resultSchool || subjectResults.some((s) => !!s.subject.trim())),
      isHealthCareComplete: !!(checkFrequency || medicineDetails || doctorName || hospitalName || doctorContactNo || hospitalType),
      isReportComplete: !!(reportCategory || reportDetails),
      isInterestComplete: !!areaOfInterest.trim(),
      isAttachmentsComplete: !!(profilePhotoFile || Object.values(attachments).some((a) => a.file !== null)),
    };
  }, [
    category,
    enrollmentType,
    fullName,
    bFormNo,
    dateOfBirth,
    gender,
    bloodGroup,
    mentalHealth,
    physicalHealth,
    fatherName,
    fatherIsAlive,
    motherName,
    motherIsAlive,
    guardianName,
    guardianRelation,
    additionalGuardians,
    meetingPersons,
    siblings,
    witnesses,
    resultSchool,
    subjectResults,
    checkFrequency,
    medicineDetails,
    doctorName,
    hospitalName,
    doctorContactNo,
    hospitalType,
    reportCategory,
    reportDetails,
    areaOfInterest,
    profilePhotoFile,
    attachments,
  ]);

  // Load existing child data for editing
  useEffect(() => {
    if (initialChild) {
      let psh: any = null;
      try {
        psh = typeof initialChild.notes === 'string' ? JSON.parse(initialChild.notes) : initialChild.notes;
      } catch {
        psh = null;
      }

      setRegistrationNo(initialChild.admissionNo || generateAdmissionNo());
      setAdmissionDate(initialChild.admissionDate || new Date().toISOString().split('T')[0]);
      setFullName(initialChild.fullName || '');
      setBFormNo(initialChild.bFormNo || '');
      setBFormFrontFile(null);
      setBFormBackFile(null);
      setAttachments((current) =>
        Object.fromEntries(Object.entries(current).map(([key, item]) => [key, { ...item, file: null }]))
      );
      setDateOfBirth(initialChild.dateOfBirth || '2016-01-15');
      setGender(initialChild.gender || 'MALE');
      setStatus(initialChild.status || 'Active');
      setBloodGroup(initialChild.bloodGroup || 'B+');
      setHeight('');
      setWeight('');
      setAge('');
      setEnrollmentType('New Enrollment');
      setReplacedRegistrationNo('');
      setReplacedClass('');
      setReplacedSchoolName('');
      setSchoolLeavingCertificateFile(null);
      setSavedSchoolLeavingCertificateName('');
      setGuardianDistrict('');
      setGuardianTehsil('');
      setGuardianUcNumber('');
      setGuardianStreetNumber('');
      setGuardianHouseNumber('');
      setDoctorName('');
      setHospitalName('');
      setDoctorContactNo('');
      setHospitalType('');

      if (psh) {
        if (psh.category?.type) setCategory(psh.category.type);
        if (psh.enrollmentType?.type) setEnrollmentType(psh.enrollmentType.type);
        if (psh.enrollmentType?.replacedRegistrationNo) setReplacedRegistrationNo(psh.enrollmentType.replacedRegistrationNo);
        setReplacedClass(psh.enrollmentType?.class || '');
        setReplacedSchoolName(psh.enrollmentType?.schoolName || '');
        const savedCertificate = psh.enrollmentType?.schoolLeavingCertificate;
        setSavedSchoolLeavingCertificateName(
          typeof savedCertificate === 'string' ? savedCertificate : savedCertificate?.fileName || ''
        );

        if (psh.basicInfo) {
          setFamilyCast(psh.basicInfo.familyCast || '');
          setMotherLanguage(psh.basicInfo.motherLanguage || '');
          setBirthDistrict(psh.basicInfo.birthDistrict || '');
          setIdentificationMark(psh.basicInfo.identificationMark || '');
          setNextOfKin(psh.basicInfo.nextOfKin || '');
          setIsSponsored(psh.basicInfo.isSponsored || '');
          setSponsorshipAmount(psh.basicInfo.sponsorshipAmount || '');
          setDateOfStatus(psh.basicInfo.dateOfStatus || new Date().toISOString().split('T')[0]);
          setStatusRemarks(psh.basicInfo.statusRemarks || '');
        }

        if (psh.healthInfo) {
          setIsDisable(psh.healthInfo.isDisable || 'No');
          setMentalHealth(psh.healthInfo.mentalHealth || 'Normal');
          setPhysicalHealth(psh.healthInfo.physicalHealth || 'Good');
          setVaccinationDetail(psh.healthInfo.vaccinationDetail || 'Complete');
          setSpecialNeedDisease(psh.healthInfo.specialNeedDisease || 'None');
        }
        if (psh.appearance) {
          setHeight(psh.appearance.height === null || psh.appearance.height === undefined ? '' : String(psh.appearance.height));
          setWeight(psh.appearance.weight === null || psh.appearance.weight === undefined ? '' : String(psh.appearance.weight));
          setAge(psh.appearance.age === null || psh.appearance.age === undefined ? '' : String(psh.appearance.age));
        }

        if (psh.fatherInfo) {
          setFatherName(psh.fatherInfo.name || '');
          setFatherCnic(psh.fatherInfo.cnic || '');
          setFatherContact(psh.fatherInfo.contact || '');
          setFatherIsAlive(psh.fatherInfo.isAlive || '');
          setFatherDob(psh.fatherInfo.dob || '');
          setFatherDod(psh.fatherInfo.dod || '');
          setFatherCauseOfDeath(psh.fatherInfo.causeOfDeath || '');
          setFatherQualification(psh.fatherInfo.qualification || '');
          setFatherProfession(psh.fatherInfo.profession || '');
          setFatherDistrict(psh.fatherInfo.district || '');
          setFatherTehsil(psh.fatherInfo.tehsil || '');
          setFatherStreetNumber(psh.fatherInfo.streetNumber || '');
          setFatherHouseNumber(psh.fatherInfo.houseNumber || '');
          setFatherUcNumber(psh.fatherInfo.ucNumber || '');
          setFatherUcName(psh.fatherInfo.ucName || '');
          setFatherAddress(psh.fatherInfo.address || '');
        }

        if (psh.motherInfo) {
          setMotherName(psh.motherInfo.name || '');
          setMotherCnic(psh.motherInfo.cnic || '');
          setMotherContact(psh.motherInfo.contact || '');
          setMotherIsAlive(psh.motherInfo.isAlive || '');
          setMotherDob(psh.motherInfo.dob || '');
          setMotherDod(psh.motherInfo.dod || '');
          setMotherCauseOfDeath(psh.motherInfo.causeOfDeath || '');
          setMotherQualification(psh.motherInfo.qualification || '');
          setMotherProfession(psh.motherInfo.profession || '');
          setMotherDistrict(psh.motherInfo.district || '');
          setMotherTehsil(psh.motherInfo.tehsil || '');
          setMotherStreetNumber(psh.motherInfo.streetNumber || '');
          setMotherHouseNumber(psh.motherInfo.houseNumber || '');
          setMotherUcNumber(psh.motherInfo.ucNumber || '');
          setMotherUcName(psh.motherInfo.ucName || '');
          setMotherAddress(psh.motherInfo.address || '');
        }

        if (psh.guardianInfo) {
          setGuardianName(psh.guardianInfo.name || initialChild.guardianName || '');
          setGuardianRelation(psh.guardianInfo.relation || initialChild.guardianRelation || '');
          setGuardianContact(psh.guardianInfo.contact || initialChild.guardianContact || '');
          setGuardianCnic(psh.guardianInfo.cnic || '');
          setGuardianQualification(psh.guardianInfo.qualification || '');
          setGuardianProfession(psh.guardianInfo.profession || '');
          setGuardianAddress(psh.guardianInfo.address || initialChild.address || '');
          setGuardianDistrict(psh.guardianInfo.district || '');
          setGuardianTehsil(psh.guardianInfo.tehsil || '');
          setGuardianUcNumber(psh.guardianInfo.ucNumber || '');
          setGuardianUcName(psh.guardianInfo.ucName || '');
          setGuardianStreetNumber(psh.guardianInfo.streetNumber || '');
          setGuardianHouseNumber(psh.guardianInfo.houseNumber || '');
          setGuardianAddressType(psh.guardianInfo.addressType || '');
          setGuardianPostOffice(psh.guardianInfo.postOffice || '');
          setGuardianColony(psh.guardianInfo.colony || '');
          setSameAsPermanentAddress(Boolean(psh.guardianInfo.sameAsPermanentAddress));
          setCurrentGuardianAddress({
            addressType: psh.guardianInfo.currentAddress?.addressType || '',
            postOffice: psh.guardianInfo.currentAddress?.postOffice || '',
            colony: psh.guardianInfo.currentAddress?.colony || '',
            address: psh.guardianInfo.currentAddress?.address || '',
            district: psh.guardianInfo.currentAddress?.district || '',
            tehsil: psh.guardianInfo.currentAddress?.tehsil || '',
            ucNumber: psh.guardianInfo.currentAddress?.ucNumber || '',
            ucName: psh.guardianInfo.currentAddress?.ucName || '',
            streetNumber: psh.guardianInfo.currentAddress?.streetNumber || '',
            houseNumber: psh.guardianInfo.currentAddress?.houseNumber || '',
          });
        }
        setAdditionalGuardians(
          Array.isArray(psh.additionalGuardians)
            ? psh.additionalGuardians.map((guardian: AdditionalGuardianRecord, index: number) => ({
                ...guardian,
                id: guardian.id || `saved-${index}`,
                name: guardian.name || '',
                relation: guardian.relation || '',
                contact: guardian.contact || '',
                cnic: guardian.cnic || '',
                qualification: guardian.qualification || '',
                profession: guardian.profession || '',
                address: guardian.address || '',
                district: guardian.district || '',
                tehsil: guardian.tehsil || '',
                ucNumber: guardian.ucNumber || '',
                ucName: guardian.ucName || '',
                streetNumber: guardian.streetNumber || '',
                houseNumber: guardian.houseNumber || '',
              }))
            : []
        );

        if (Array.isArray(psh.meetingPersons) && psh.meetingPersons.length > 0) {
          setMeetingPersons(psh.meetingPersons.map((person: MeetingPersonRecord) => ({
            ...person,
            ucName: person.ucName || '',
          })));
        }
        if (Array.isArray(psh.siblings) && psh.siblings.length > 0) {
          setSiblings(psh.siblings.map((sibling: SiblingRecord, index: number) => ({
            ...sibling,
            id: sibling.id || `saved-${index}`,
            profession: sibling.profession || '',
            ucName: sibling.ucName || '',
          })));
        }
        if (Array.isArray(psh.witnesses) && psh.witnesses.length > 0) {
          setWitnesses(psh.witnesses.map((w: WitnessRecord) => ({
            ...w,
            district: w.district || '',
            tehsil: w.tehsil || '',
            ucNumber: w.ucNumber || '',
            ucName: w.ucName || '',
            streetNumber: w.streetNumber || '',
            houseNumber: w.houseNumber || '',
          })));
        }

        if (psh.resultInfo) {
          setResultSchool(psh.resultInfo.school || '');
          setResultClass(psh.resultInfo.gradeClass || '');
          setResultExamDate(psh.resultInfo.examDate || '');
          setResultExamType(psh.resultInfo.examType || '');
          setResultPassingScore(psh.resultInfo.passingScore || '');
          if (Array.isArray(psh.resultInfo.subjectResults) && psh.resultInfo.subjectResults.length > 0) {
            setSubjectResults(psh.resultInfo.subjectResults);
          }
        }

        if (psh.healthCare) {
          setCheckFrequency(psh.healthCare.checkFrequency || '');
          setMedicineDetails(psh.healthCare.medicineDetails || '');
          setAntibioticMedicine(psh.healthCare.antibioticMedicine || '');
          setDoctorName(psh.healthCare.doctorName || '');
          setHospitalName(psh.healthCare.hospitalName || '');
          setDoctorContactNo(psh.healthCare.doctorContactNo || '');
          setHospitalType(psh.healthCare.hospitalType || '');
        }

        if (psh.reports) {
          setReportCategory(psh.reports.category || '');
          setReportDetails(psh.reports.details || '');
        }

        if (psh.areaOfInterest) {
          setAreaOfInterest(psh.areaOfInterest);
        }
      }
    }
  }, [initialChild]);

  const handleClearForm = () => {
    setEnrollmentType('New Enrollment');
    setReplacedRegistrationNo('');
    setReplacedClass('');
    setReplacedSchoolName('');
    setSchoolLeavingCertificateFile(null);
    setSavedSchoolLeavingCertificateName('');
    setCategory('Orphan');
    setRegistrationNo(generateAdmissionNo());
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setFullName('');
    setBFormNo('');
    setBFormFrontFile(null);
    setBFormBackFile(null);
    setAttachments((current) =>
      Object.fromEntries(Object.entries(current).map(([key, item]) => [key, { ...item, file: null }]))
    );
    setDateOfBirth('2016-01-15');
    setGender('');
    setFamilyCast('');
    setMotherLanguage('');
    setBirthDistrict('');
    setIdentificationMark('');
    setNextOfKin('');
    setIsSponsored('');
    setSponsorshipAmount('');
    setStatus('Active');
    setDateOfStatus(new Date().toISOString().split('T')[0]);
    setStatusRemarks('');
    setIsDisable('No');
    setBloodGroup('');
    setMentalHealth('');
    setPhysicalHealth('');
    setVaccinationDetail('');
    setSpecialNeedDisease('');
    setHeight('');
    setWeight('');
    setAge('');
    setFatherName('');
    setFatherCnic('');
    setFatherContact('');
    setFatherIsAlive('');
    setFatherDob('');
    setFatherDod('');
    setFatherCauseOfDeath('');
    setFatherQualification('');
    setFatherProfession('');
    setFatherDistrict('');
    setFatherTehsil('');
    setFatherStreetNumber('');
    setFatherHouseNumber('');
    setFatherUcNumber('');
    setFatherUcName('');
    setFatherAddress('');
    setMotherName('');
    setMotherCnic('');
    setMotherContact('');
    setMotherIsAlive('');
    setMotherDob('');
    setMotherDod('');
    setMotherCauseOfDeath('');
    setMotherQualification('');
    setMotherProfession('');
    setMotherDistrict('');
    setMotherTehsil('');
    setMotherStreetNumber('');
    setMotherHouseNumber('');
    setMotherUcNumber('');
    setMotherUcName('');
    setMotherAddress('');
    setGuardianName('');
    setGuardianRelation('');
    setGuardianContact('');
    setGuardianCnic('');
    setGuardianQualification('');
    setGuardianProfession('');
    setGuardianAddress('');
    setGuardianDistrict('');
    setGuardianTehsil('');
    setGuardianUcNumber('');
    setGuardianUcName('');
    setGuardianStreetNumber('');
    setGuardianHouseNumber('');
    setGuardianAddressType('');
    setGuardianPostOffice('');
    setGuardianColony('');
    setSameAsPermanentAddress(false);
    setCurrentGuardianAddress({
      addressType: '',
      postOffice: '',
      colony: '',
      address: '',
      district: '',
      tehsil: '',
      ucNumber: '',
      ucName: '',
      streetNumber: '',
      houseNumber: '',
    });
    setAdditionalGuardians([]);
    setMeetingPersons([{ id: '1', name: '', relation: '', cnic: '', contact: '', qualification: '', profession: '', dateTime: '', startDateTime: '', endDateTime: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setSiblings([{ id: '1', name: '', gender: '', age: '', qualification: '', profession: '', institution: '', gradeClass: '', maritalStatus: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setWitnesses([{ id: '1', name: '', cnic: '', fatherName: '', contact: '', qualification: '', profession: '', address: '' }]);
    setResultSchool('');
    setResultClass('');
    setResultExamDate('');
    setResultExamType('');
    setResultPassingScore('');
    setSubjectResults([{ id: '1', subject: '', obtainedMarks: '', totalMarks: '' }]);
    setCheckFrequency('');
    setMedicineDetails('');
    setAntibioticMedicine('');
    setDoctorName('');
    setHospitalName('');
    setDoctorContactNo('');
    setHospitalType('');
    setReportCategory('');
    setReportDetails('');
    setAreaOfInterest('');
  };

  const handleAutoFillDemo = (profileType: 'orphan' | 'poor' | 'replace' | 'posthumous' = 'orphan') => {
    if (profileType === 'poor') {
      setEnrollmentType('New Enrollment');
      setReplacedRegistrationNo('');
      setCategory('Poorest of the Poor');

      const adm = `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setRegistrationNo(adm);
      setAdmissionDate('2026-09-10');
      setFullName('Fatima Zahra');
      setBFormNo('31201-7654321-2');
      setDateOfBirth('2017-06-18');
      setGender('FEMALE');
      setFamilyCast('Arain');
      setMotherLanguage('Saraiki');
      setBirthDistrict('Bahawalpur');
      setIdentificationMark('Birthmark on left arm');
      setNextOfKin('Ghulam Rasool (Father)');
      setIsSponsored('Yes');
      setSponsorshipAmount('12000');
      setStatus('Active');
      setDateOfStatus('2026-09-10');
      setStatusRemarks('Poorest of the poor stipend program');

      setIsDisable('No');
      setBloodGroup('O+');
      setMentalHealth('Active & Creative');
      setPhysicalHealth('Healthy');
      setVaccinationDetail('Complete');
      setSpecialNeedDisease('None');

      setFatherName('Ghulam Rasool');
      setFatherCnic('31201-1122334-1');
      setFatherContact('0302-9988776');
      setFatherIsAlive('Yes');
      setFatherDob('1984-05-12');
      setFatherDod('');
      setFatherQualification('Middle');
      setFatherProfession('Daily Wage Worker');
      setFatherDistrict('Bahawalpur');
      setFatherTehsil('Ahmedpur East');
      setFatherStreetNumber('Street 03');
      setFatherHouseNumber('House 18');
      setFatherUcNumber('UC-08');
      setFatherAddress('Basti Noor, Bahawalpur');

      setMotherName('Shamim Akhtar');
      setMotherCnic('31201-9988776-2');
      setMotherContact('0302-9988776');
      setMotherIsAlive('Yes');
      setMotherDob('1989-11-04');
      setMotherDod('');
      setMotherQualification('None');
      setMotherProfession('Housewife');
      setMotherDistrict('Bahawalpur');
      setMotherTehsil('Ahmedpur East');
      setMotherStreetNumber('Street 03');
      setMotherHouseNumber('House 18');
      setMotherUcNumber('UC-08');
      setMotherAddress('Basti Noor, Bahawalpur');

      setGuardianName('Ghulam Rasool');
      setGuardianRelation('Father');
      setGuardianContact('0302-9988776');
      setGuardianCnic('31201-1122334-1');
      setGuardianQualification('Middle');
      setGuardianProfession('Daily Wage Worker');
      setGuardianAddress('Basti Noor, Bahawalpur');

      setMeetingPersons([
        {
          id: '1',
          name: 'Ghulam Rasool',
          relation: 'Father',
          cnic: '31201-1122334-1',
          contact: '0302-9988776',
          qualification: 'Middle',
          profession: 'Laborer',
          dateTime: '2026-09-12T11:00',
          startDateTime: '2026-09-12T11:00',
          endDateTime: '2026-09-12T12:00',
          district: 'Bahawalpur',
          tehsil: 'Ahmedpur East',
          ucNumber: 'UC-08',
          streetNumber: 'Street 03',
          houseNumber: 'House 18',
          address: 'Basti Noor, Bahawalpur',
        },
      ]);

      setSiblings([
        {
          id: '1',
          name: 'Zainab Bibi',
          gender: 'Female',
          age: '6',
          qualification: 'Prep',
          profession: '',
          institution: 'Govt Girls Primary School',
          gradeClass: 'Class 1',
          maritalStatus: 'Single',
          district: 'Bahawalpur',
          tehsil: 'Ahmedpur East',
          ucNumber: 'UC-08',
          streetNumber: 'Street 03',
          houseNumber: 'House 18',
          address: 'Basti Noor, Bahawalpur',
        },
      ]);

      setWitnesses([
        {
          id: '1',
          name: 'Muhammad Aslam',
          cnic: '31201-5544332-1',
          fatherName: 'Allah Yar',
          contact: '0305-1122334',
          address: 'Main Bazaar, Bahawalpur',
          qualification: 'Matric',
          profession: 'Local Counselor / Social Worker',
        },
      ]);

      setResultSchool('Govt Girls Primary School Bahawalpur');
      setResultClass('Class 3');
      setResultExamDate('2026-03-15');
      setResultExamType('Mid-Term Examination');
      setResultPassingScore('88% (A+ Grade)');
      setSubjectResults([
        { id: '1', subject: 'Urdu', obtainedMarks: '90', totalMarks: '100' },
        { id: '2', subject: 'English', obtainedMarks: '84', totalMarks: '100' },
        { id: '3', subject: 'Mathematics', obtainedMarks: '92', totalMarks: '100' },
        { id: '4', subject: 'General Knowledge', obtainedMarks: '86', totalMarks: '100' },
      ]);

      setCheckFrequency('Monthly');
      setMedicineDetails('Calcium & Vitamin Supplements');
      setAntibioticMedicine('None');
      setReportCategory('Academic');
      setReportDetails('Top student in class 3. Very obedient and highly interested in drawing.');
      setAreaOfInterest('Art, Drawing, and Story Writing.');
      return;
    }

    if (profileType === 'replace') {
      setEnrollmentType('Replace');
      setReplacedRegistrationNo('ADM-2024-882');
      setCategory('Orphan');

      const adm = `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setRegistrationNo(adm);
      setAdmissionDate('2026-09-15');
      setFullName('Bilal Ahmed');
      setBFormNo('36302-9988112-3');
      setDateOfBirth('2015-08-24');
      setGender('MALE');
      setFamilyCast('Sheikh');
      setMotherLanguage('Urdu');
      setBirthDistrict('Multan');
      setIdentificationMark('Scar on forehead');
      setNextOfKin('Nasreen Bibi (Mother)');
      setIsSponsored('No');
      setSponsorshipAmount('');
      setStatus('Active');
      setDateOfStatus('2026-09-15');
      setStatusRemarks('Replacement against vacant seat ADM-2024-882');

      setIsDisable('No');
      setBloodGroup('A+');
      setMentalHealth('Normal');
      setPhysicalHealth('Athletic');
      setVaccinationDetail('Complete Schedule');
      setSpecialNeedDisease('None');

      setFatherName('Ahmed Din (Late)');
      setFatherCnic('36302-3344556-1');
      setFatherContact('0301-4455667');
      setFatherIsAlive('No');
      setFatherDob('1980-02-14');
      setFatherDod('2021-08-10');
      setFatherQualification('Matric');
      setFatherProfession('Driver');
      setFatherDistrict('Multan');
      setFatherTehsil('Multan Cantt');
      setFatherStreetNumber('Street 07');
      setFatherHouseNumber('House 42');
      setFatherUcNumber('UC-22');
      setFatherAddress('Shamsabad, Multan');

      setMotherName('Nasreen Bibi');
      setMotherCnic('36302-7788990-2');
      setMotherContact('0301-4455667');
      setMotherIsAlive('Yes');
      setMotherDob('1986-04-18');
      setMotherDod('');
      setMotherQualification('Primary');
      setMotherProfession('Seamstress / Tailor');
      setMotherDistrict('Multan');
      setMotherTehsil('Multan Cantt');
      setMotherStreetNumber('Street 07');
      setMotherHouseNumber('House 42');
      setMotherUcNumber('UC-22');
      setMotherAddress('Shamsabad, Multan');

      setGuardianName('Nasreen Bibi');
      setGuardianRelation('Mother');
      setGuardianContact('0301-4455667');
      setGuardianCnic('36302-7788990-2');
      setGuardianQualification('Primary');
      setGuardianProfession('Tailor');
      setGuardianAddress('Shamsabad, Multan');

      setMeetingPersons([
        {
          id: '1',
          name: 'Nasreen Bibi',
          relation: 'Mother',
          cnic: '36302-7788990-2',
          contact: '0301-4455667',
          qualification: 'Primary',
          profession: 'Tailor',
          dateTime: '2026-09-18T15:00',
          startDateTime: '2026-09-18T15:00',
          endDateTime: '2026-09-18T16:00',
          district: 'Multan',
          tehsil: 'Multan Cantt',
          ucNumber: 'UC-22',
          streetNumber: 'Street 07',
          houseNumber: 'House 42',
          address: 'Shamsabad, Multan',
        },
      ]);

      setSiblings([
        {
          id: '1',
          name: 'Hamza Ahmed',
          gender: 'Male',
          age: '13',
          qualification: 'Middle',
          profession: '',
          institution: 'Govt High School Multan',
          gradeClass: 'Class 8',
          maritalStatus: 'Single',
          district: 'Multan',
          tehsil: 'Multan Cantt',
          ucNumber: 'UC-22',
          streetNumber: 'Street 07',
          houseNumber: 'House 42',
          address: 'Shamsabad, Multan',
        },
      ]);

      setWitnesses([
        {
          id: '1',
          name: 'Tariq Mehmood',
          cnic: '36302-8877665-1',
          fatherName: 'Abdul Ghafoor',
          contact: '0300-8899001',
          address: 'Near Chowk Shaheedan, Multan',
          qualification: 'BA',
          profession: 'Trader',
        },
      ]);

      setResultSchool('Govt Comprehensive School Multan');
      setResultClass('Class 5');
      setResultExamDate('2026-03-22');
      setResultExamType('Final Term Examination');
      setResultPassingScore('80% (A Grade)');
      setSubjectResults([
        { id: '1', subject: 'Mathematics', obtainedMarks: '85', totalMarks: '100' },
        { id: '2', subject: 'English', obtainedMarks: '78', totalMarks: '100' },
        { id: '3', subject: 'Urdu', obtainedMarks: '82', totalMarks: '100' },
        { id: '4', subject: 'Science', obtainedMarks: '81', totalMarks: '100' },
        { id: '5', subject: 'Social Studies', obtainedMarks: '76', totalMarks: '100' },
      ]);

      setCheckFrequency('Monthly');
      setMedicineDetails('General health checkup normal');
      setAntibioticMedicine('None');
      setReportCategory('Behavior');
      setReportDetails('Active sports participant, well behaved and cooperative.');
      setAreaOfInterest('Football, Science & Technology, and Naat Recitation.');
      return;
    }

    if (profileType === 'posthumous') {
      setEnrollmentType('New Enrollment');
      setReplacedRegistrationNo('');
      setCategory('Posthumous');

      const adm = `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setRegistrationNo(adm);
      setAdmissionDate('2026-09-18');
      setFullName('Hamza Tariq');
      setBFormNo('32304-4455667-1');
      setDateOfBirth('2018-11-12');
      setGender('MALE');
      setFamilyCast('Qureshi');
      setMotherLanguage('Urdu');
      setBirthDistrict('Muzaffargarh');
      setIdentificationMark('Small scar on right eyebrow');
      setNextOfKin('Kalsoom Akhtar (Mother)');
      setIsSponsored('Yes');
      setSponsorshipAmount('12000');
      setStatus('Active');
      setDateOfStatus('2026-09-18');
      setStatusRemarks('Posthumous welfare admission quota');

      setIsDisable('No');
      setBloodGroup('AB+');
      setMentalHealth('Sharp & Attentive');
      setPhysicalHealth('Active');
      setVaccinationDetail('Complete');
      setSpecialNeedDisease('None');

      setFatherName('Tariq Aziz (Martyr/Late)');
      setFatherCnic('32304-1122998-1');
      setFatherContact('0304-7766554');
      setFatherIsAlive('No');
      setFatherDob('1983-07-15');
      setFatherDod('2024-01-10');
      setFatherQualification('Graduation');
      setFatherProfession('Security Personnel');
      setFatherDistrict('Muzaffargarh');
      setFatherTehsil('Alipur');
      setFatherStreetNumber('Gali No 5');
      setFatherHouseNumber('House 19');
      setFatherUcNumber('UC-02');
      setFatherAddress('Alipur Main Road, Muzaffargarh');

      setMotherName('Kalsoom Akhtar');
      setMotherCnic('32304-8877665-2');
      setMotherContact('0304-7766554');
      setMotherIsAlive('Yes');
      setMotherDob('1988-09-25');
      setMotherDod('');
      setMotherQualification('Matric');
      setMotherProfession('Housewife');
      setMotherDistrict('Muzaffargarh');
      setMotherTehsil('Alipur');
      setMotherStreetNumber('Gali No 5');
      setMotherHouseNumber('House 19');
      setMotherUcNumber('UC-02');
      setMotherAddress('Alipur Main Road, Muzaffargarh');

      setGuardianName('Kalsoom Akhtar');
      setGuardianRelation('Mother');
      setGuardianContact('0304-7766554');
      setGuardianCnic('32304-8877665-2');
      setGuardianQualification('Matric');
      setGuardianProfession('Housewife');
      setGuardianAddress('Alipur Main Road, Muzaffargarh');

      setMeetingPersons([
        {
          id: '1',
          name: 'Kalsoom Akhtar',
          relation: 'Mother',
          cnic: '32304-8877665-2',
          contact: '0304-7766554',
          qualification: 'Matric',
          profession: 'Housewife',
          dateTime: '2026-09-20T10:30',
          startDateTime: '2026-09-20T10:30',
          endDateTime: '2026-09-20T11:30',
          district: 'Muzaffargarh',
          tehsil: 'Alipur',
          ucNumber: 'UC-02',
          streetNumber: 'Gali No 5',
          houseNumber: 'House 19',
          address: 'Alipur Main Road, Muzaffargarh',
        },
      ]);

      setSiblings([
        {
          id: '1',
          name: 'Ayesha Tariq',
          gender: 'Female',
          age: '5',
          qualification: 'Nursery',
          profession: '',
          institution: 'Govt Primary School',
          gradeClass: 'Nursery',
          maritalStatus: 'Single',
          district: 'Muzaffargarh',
          tehsil: 'Alipur',
          ucNumber: 'UC-02',
          streetNumber: 'Gali No 5',
          houseNumber: 'House 19',
          address: 'Alipur Main Road, Muzaffargarh',
        },
      ]);

      setWitnesses([
        {
          id: '1',
          name: 'Malik Zafar Iqbal',
          cnic: '32304-9988112-1',
          fatherName: 'Malik Khuda Bakhsh',
          contact: '0300-4455889',
          address: 'Civil Lines, Muzaffargarh',
          qualification: 'MA',
          profession: 'Advocate',
        },
      ]);

      setResultSchool('Govt Primary Model School Muzaffargarh');
      setResultClass('Class 1');
      setResultExamDate('2026-03-25');
      setResultExamType('Annual Assessment');
      setResultPassingScore('92% (A+ Grade)');
      setSubjectResults([
        { id: '1', subject: 'Urdu', obtainedMarks: '94', totalMarks: '100' },
        { id: '2', subject: 'English', obtainedMarks: '90', totalMarks: '100' },
        { id: '3', subject: 'Mathematics', obtainedMarks: '95', totalMarks: '100' },
        { id: '4', subject: 'General Knowledge', obtainedMarks: '89', totalMarks: '100' },
      ]);

      setCheckFrequency('Monthly');
      setMedicineDetails('Routine vitamins');
      setAntibioticMedicine('None');
      setReportCategory('Academic');
      setReportDetails('Extremely quick learner, disciplined and actively participates in recitation.');
      setAreaOfInterest('Reading, Drawing, and Quran Memorization (Hifz).');
      return;
    }

    // Default Profile: Orphan (Muhammad Ali Khan)
    setEnrollmentType('New Enrollment');
    setReplacedRegistrationNo('');
    setCategory('Orphan');

    const adm = `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setRegistrationNo(adm);
    setAdmissionDate('2026-09-01');
    setFullName('Muhammad Ali Khan');
    setBFormNo('36302-1234567-1');
    setDateOfBirth('2016-04-12');
    setGender('MALE');
    setFamilyCast('Rajput');
    setMotherLanguage('Urdu / Saraiki');
    setBirthDistrict('Multan');
    setIdentificationMark('Mole on right cheek');
    setNextOfKin('Muhammad Tariq (Uncle)');
    setIsSponsored('Yes');
    setSponsorshipAmount('15000');
    setStatus('Active');
    setDateOfStatus('2026-09-01');
    setStatusRemarks('Admitted under welfare quota');

    setIsDisable('No');
    setBloodGroup('B+');
    setMentalHealth('Normal & Active');
    setPhysicalHealth('Fit');
    setVaccinationDetail('Complete EPI Schedule');
    setSpecialNeedDisease('None');

    setFatherName('Muhammad Tariq Khan (Late)');
    setFatherCnic('36302-9876543-1');
    setFatherContact('0300-1234567');
    setFatherIsAlive('No');
    setFatherDob('1982-03-10');
    setFatherDod('2022-11-15');
    setFatherQualification('Matric');
    setFatherProfession('Laborer');
    setFatherDistrict('Multan');
    setFatherTehsil('Multan City');
    setFatherStreetNumber('Street 04');
    setFatherHouseNumber('House 12-A');
    setFatherUcNumber('UC-14');
    setFatherAddress('Mohallah Gulgasht, Multan');

    setMotherName('Parveen Bibi');
    setMotherCnic('36302-7654321-2');
    setMotherContact('0312-9876543');
    setMotherIsAlive('Yes');
    setMotherDob('1987-08-20');
    setMotherDod('');
    setMotherQualification('Primary');
    setMotherProfession('Housewife');
    setMotherDistrict('Multan');
    setMotherTehsil('Multan City');
    setMotherStreetNumber('Street 04');
    setMotherHouseNumber('House 12-A');
    setMotherUcNumber('UC-14');
    setMotherAddress('Mohallah Gulgasht, Multan');

    setGuardianName('Rashid Mehmood');
    setGuardianRelation('Paternal Uncle (Chacha)');
    setGuardianContact('0301-5554321');
    setGuardianCnic('36302-4567890-3');
    setGuardianQualification('Intermediate (FA)');
    setGuardianProfession('Shopkeeper');
    setGuardianAddress('Main Bazaar, Eidgah Road, Multan');

    setMeetingPersons([
      {
        id: '1',
        name: 'Rashid Mehmood',
        relation: 'Uncle',
        cnic: '36302-4567890-3',
        contact: '0301-5554321',
        qualification: 'FA',
        profession: 'Shopkeeper',
        dateTime: '2026-09-05T14:00',
        startDateTime: '2026-09-05T14:00',
        endDateTime: '2026-09-05T15:30',
        district: 'Multan',
        tehsil: 'Multan City',
        ucNumber: 'UC-14',
        streetNumber: 'Street 02',
        houseNumber: 'House 55',
        address: 'Eidgah Road, Multan',
      },
    ]);

    setSiblings([
      {
        id: '1',
        name: 'Fatima Ali',
        gender: 'Female',
        age: '8',
        qualification: 'Primary',
        profession: '',
        institution: 'Govt Girls Primary School',
        gradeClass: 'Grade 3',
        maritalStatus: 'Single',
        district: 'Multan',
        tehsil: 'Multan City',
        ucNumber: 'UC-14',
        streetNumber: 'Street 04',
        houseNumber: 'House 12-A',
        address: 'Mohallah Gulgasht, Multan',
      },
    ]);

    setWitnesses([
      {
        id: '1',
        name: 'Haji Abdul Rehman',
        cnic: '36302-1122334-5',
        fatherName: 'Allah Ditta',
        contact: '0321-7788990',
        address: 'Near Jamia Masjid, Multan',
        qualification: 'BA',
        profession: 'Community Elder / Businessman',
      },
    ]);

    setResultSchool('Govt Primary School No. 1 Multan');
    setResultClass('Grade 4');
    setResultExamDate('2026-03-20');
    setResultExamType('Annual Examination');
    setResultPassingScore('82% (A Grade)');
    setSubjectResults([
      { id: '1', subject: 'Mathematics', obtainedMarks: '88', totalMarks: '100' },
      { id: '2', subject: 'English', obtainedMarks: '82', totalMarks: '100' },
      { id: '3', subject: 'Urdu', obtainedMarks: '85', totalMarks: '100' },
      { id: '4', subject: 'General Science', obtainedMarks: '79', totalMarks: '100' },
      { id: '5', subject: 'Islamiat', obtainedMarks: '94', totalMarks: '100' },
    ]);

    setCheckFrequency('Monthly');
    setMedicineDetails('Daily Multivitamins & Iron Syrup');
    setAntibioticMedicine('None');

    setReportCategory('Academic');
    setReportDetails('The child shows strong potential in science and mathematics. Good discipline and respectful behavior.');
    setAreaOfInterest('Cricket, Computer Studies, and Islamic Studies.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (enrollmentType === 'Replace') {
      const missingFields = [
        !replacedRegistrationNo.trim() && 'Registration No.',
        !replacedClass.trim() && 'Class',
        !replacedSchoolName.trim() && 'School Name',
        !schoolLeavingCertificateFile && !savedSchoolLeavingCertificateName && 'School Leaving Certificate',
      ].filter(Boolean);

      if (missingFields.length > 0) {
        setFormError(`Please complete the Replace fields: ${missingFields.join(', ')}.`);
        return;
      }
    }

    const normalizedDoctorContactNo = doctorContactNo.trim().replace(/[\s-]/g, '');
    if (
      normalizedDoctorContactNo &&
      !/^(?:03\d{9}|\+923\d{9})$/.test(normalizedDoctorContactNo)
    ) {
      setFormError('Enter a valid Pakistani doctor contact number, such as 0300-1234567 or +923001234567.');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;
      if (profilePhotoFile) {
        try {
          const body = new FormData();
          body.append('file', profilePhotoFile);
          const uploadRes = await fetch('/api/children/photo', { method: 'POST', body });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            photoUrl = data.url;
          }
        } catch (uploadErr) {
          console.warn('Profile photo upload issue:', uploadErr);
        }
      }

      const fullPshDossier = {
        enrollmentType: {
          type: enrollmentType || 'New Enrollment',
          replacedRegistrationNo: enrollmentType === 'Replace' ? replacedRegistrationNo : null,
          class: enrollmentType === 'Replace' ? replacedClass : null,
          schoolName: enrollmentType === 'Replace' ? replacedSchoolName : null,
          schoolLeavingCertificate: enrollmentType === 'Replace'
            ? {
                fileName: schoolLeavingCertificateFile?.name || savedSchoolLeavingCertificateName,
                documentType: 'SCHOOL_LEAVING_CERTIFICATE',
              }
            : null,
        },
        category: {
          type: category || 'Orphan',
        },
        basicInfo: {
          registrationNo,
          admissionDate,
          fullName,
          bFormNo,
          dateOfBirth,
          gender,
          familyCast,
          motherLanguage,
          birthDistrict,
          identificationMark,
          nextOfKin,
          isSponsored,
          sponsorshipAmount: isSponsored === 'Yes' ? sponsorshipAmount : null,
          status,
          dateOfStatus,
          statusRemarks,
        },
        healthInfo: {
          isDisable,
          bloodGroup,
          mentalHealth,
          physicalHealth,
          vaccinationDetail,
          specialNeedDisease,
        },
        appearance: {
          height,
          weight,
          age,
        },
        fatherInfo: {
          name: fatherName,
          cnic: fatherCnic,
          contact: fatherContact,
          isAlive: fatherIsAlive,
          dob: fatherDob,
          dod: fatherDod,
          causeOfDeath: fatherCauseOfDeath,
          qualification: fatherQualification,
          profession: fatherProfession,
          district: fatherDistrict,
          tehsil: fatherTehsil,
          streetNumber: fatherStreetNumber,
          houseNumber: fatherHouseNumber,
          ucNumber: fatherUcNumber,
          ucName: fatherUcName,
          address: fatherAddress,
        },
        motherInfo: {
          name: motherName,
          cnic: motherCnic,
          contact: motherContact,
          isAlive: motherIsAlive,
          dob: motherDob,
          dod: motherIsAlive === 'No' ? motherDod : null,
          causeOfDeath: motherIsAlive === 'No' ? motherCauseOfDeath : null,
          qualification: motherQualification,
          profession: motherProfession,
          district: motherDistrict,
          tehsil: motherTehsil,
          streetNumber: motherStreetNumber,
          houseNumber: motherHouseNumber,
          ucNumber: motherUcNumber,
          ucName: motherUcName,
          address: motherAddress,
        },
        guardianInfo: {
          name: guardianName,
          relation: guardianRelation,
          contact: guardianContact,
          cnic: guardianCnic,
          qualification: guardianQualification,
          profession: guardianProfession,
          address: guardianAddress,
          district: guardianDistrict,
          tehsil: guardianTehsil,
          ucNumber: guardianUcNumber,
          ucName: guardianUcName,
          streetNumber: guardianStreetNumber,
          houseNumber: guardianHouseNumber,
          addressType: guardianAddressType,
          postOffice: guardianPostOffice,
          colony: guardianColony,
          sameAsPermanentAddress,
          currentAddress: currentGuardianAddress,
        },
        additionalGuardians: additionalGuardians
          .filter((guardian) => Object.entries(guardian).some(([key, value]) => key !== 'id' && Boolean(value.trim())))
          .map(({ id: _id, ...guardian }) => guardian),
        meetingPersons,
        siblings,
        witnesses: witnesses.map((w) => ({
          ...w,
          district: w.district || '',
          tehsil: w.tehsil || '',
          ucNumber: w.ucNumber || '',
          ucName: w.ucName || '',
          streetNumber: w.streetNumber || '',
          houseNumber: w.houseNumber || '',
        })),
        resultInfo: {
          school: resultSchool,
          gradeClass: resultClass,
          examDate: resultExamDate,
          examType: resultExamType,
          passingScore: resultPassingScore,
          subjectResults,
        },
        healthCare: {
          checkFrequency,
          medicineDetails,
          antibioticMedicine,
          doctorName,
          hospitalName,
          doctorContactNo: doctorContactNo.trim() || null,
          hospitalType,
        },
        reports: {
          category: reportCategory,
          details: reportDetails,
        },
        areaOfInterest,
        attachmentsSummary: Object.keys(attachments).map((k) => ({
          slot: k,
          title: attachments[k].title,
          attached: !!attachments[k].file || (
            (k === 'fatherCnicFront' && !!getSavedDocument('FATHER_CNIC_FRONT')) ||
            (k === 'fatherCnicBack' && !!getSavedDocument('FATHER_CNIC_BACK'))
          ),
        })),
      };

      const payload = {
        id: initialChild?.id || `demo-${Date.now()}`,
        fullName: fullName || 'Child Admission',
        fatherGuardianName: fatherName || guardianName || 'Father / Guardian',
        dateOfBirth: dateOfBirth || '2016-01-15',
        gender: gender || 'MALE',
        bFormNo: bFormNo || null,
        admissionNo: registrationNo,
        admissionDate: admissionDate || new Date().toISOString().split('T')[0],
        guardianName: guardianName || motherName,
        guardianRelation,
        guardianContact,
        address: fatherAddress || motherAddress || guardianAddress || 'Sweet Home Multan, Punjab',
        photo: photoUrl || initialChild?.photo || null,
        status: status || 'ACTIVE',
        bloodGroup: bloodGroup || 'B+',
        allergies: 'None',
        chronicConditions: specialNeedDisease || 'None',
        height: height || null,
        weight: weight || null,
        age: age || null,
        heightCm: height.trim() && Number.isFinite(Number(height)) ? Number(height) : 135,
        weightKg: weight.trim() && Number.isFinite(Number(weight)) ? Number(weight) : 30,
        notes: JSON.stringify(fullPshDossier),
      };

      // Save locally to localStorage for standalone persistence
      try {
        const existingRaw = localStorage.getItem('psh_admissions_records');
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const updatedList = [payload, ...existingList.filter((item: any) => item.admissionNo !== payload.admissionNo)];
        localStorage.setItem('psh_admissions_records', JSON.stringify(updatedList));
      } catch (lsErr) {
        console.warn('LocalStorage save warning:', lsErr);
      }

      let serverChildId: string | null = null;
      const documentUploadWarnings: string[] = [];

      // Try server API sync if available
      try {
        const hasPersistedChildId = initialChild?.id &&
          !String(initialChild.id).startsWith('seed-') &&
          !String(initialChild.id).startsWith('demo-');
        const apiResponse = await fetch(
          hasPersistedChildId ? `/api/children/${initialChild.id}` : '/api/children',
          {
          method: hasPersistedChildId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          }
        );
        if (apiResponse.ok) {
          const result = await apiResponse.json();
          serverChildId = result.child?.id || (hasPersistedChildId ? String(initialChild.id) : null);
        } else {
          const result = await apiResponse.json().catch(() => ({}));
          console.warn('Server API sync failed:', result.error || apiResponse.statusText);
        }
      } catch (apiErr) {
        console.warn('Server API sync skipped in standalone demo mode:', apiErr);
      }

      const documentsToUpload = [
        { file: bFormFrontFile, title: 'B-Form Front', documentType: 'B_FORM_FRONT' },
        { file: bFormBackFile, title: 'B-Form Back', documentType: 'B_FORM_BACK' },
        ...([
          ['fatherCnicFront', 'FATHER_CNIC_FRONT'],
          ['fatherCnicBack', 'FATHER_CNIC_BACK'],
        ] as const).map(([key, documentType]) => ({
          file: attachments[key].file,
          title: attachments[key].title,
          documentType,
        })),
        ...(enrollmentType === 'Replace' && schoolLeavingCertificateFile
          ? [{
              file: schoolLeavingCertificateFile,
              title: 'School Leaving Certificate',
              documentType: 'SCHOOL_LEAVING_CERTIFICATE',
            }]
          : []),
      ];

      for (const document of documentsToUpload) {
        if (!document.file) continue;
        if (!serverChildId) {
          documentUploadWarnings.push(`${document.title} was not saved because the document vault is unavailable.`);
          continue;
        }

        try {
          const documentForm = new FormData();
          documentForm.append('file', document.file);
          documentForm.append('title', document.title);
          documentForm.append('documentType', document.documentType);
          const uploadResponse = await fetch(`/api/children/${serverChildId}/documents`, {
            method: 'POST',
            body: documentForm,
          });
          if (!uploadResponse.ok) {
            const result = await uploadResponse.json().catch(() => ({}));
            const warning = result.error || `${document.title} could not be uploaded to the document vault.`;
            documentUploadWarnings.push(warning);
            console.warn(`${document.title} upload failed:`, warning);
          }
        } catch (uploadError) {
          const warning = uploadError instanceof Error
            ? uploadError.message
            : `${document.title} could not be uploaded to the document vault.`;
          documentUploadWarnings.push(warning);
          console.warn(`${document.title} upload failed:`, uploadError);
        }
      }

      const successMessage = initialChild
          ? `Record for ${payload.fullName} (${payload.admissionNo}) updated successfully!`
          : `Child ${payload.fullName} enrolled into Pakistan Sweet Home Multan successfully!`;
      setFormSuccess(
        documentUploadWarnings.length > 0
          ? `${successMessage} Document upload warning: ${documentUploadWarnings.join(' ')}`
          : successMessage
      );
      setTimeout(() => {
        onSuccess(payload);
      }, documentUploadWarnings.length > 0 ? 4000 : 900);
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err instanceof Error ? err.message : 'Network error during child admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 sm:p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-700">
            {initialChild ? (
              <span className="flex items-center gap-2 font-extrabold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Editing Admitted Record: <span className="font-mono text-slate-900">{initialChild.admissionNo}</span>
              </span>
            ) : (
              <span className="font-bold text-slate-900">
                Official Child Admission Dossier
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {initialChild && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                ✕ Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleClearForm}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
              title="Reset all form fields"
            >
              🧹 Clear Form
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Quick Presets:
            </span>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('orphan')}
              className="rounded-lg bg-amber-500 px-2.5 py-1.5 font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              ⚡ Orphan
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('poor')}
              className="rounded-lg bg-emerald-600 px-2.5 py-1.5 font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              ⚡ Poorest of Poor
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('replace')}
              className="rounded-lg bg-sky-600 px-2.5 py-1.5 font-bold text-white shadow-sm transition hover:bg-sky-700"
            >
              ⚡ Replace Seat
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('posthumous')}
              className="rounded-lg bg-violet-600 px-2.5 py-1.5 font-bold text-white shadow-sm transition hover:bg-violet-700"
            >
              ⚡ Posthumous
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-slate-50 to-indigo-50 p-4 shadow-[0_10px_24px_rgba(16,185,129,0.08)] transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2 font-bold">
          <span className="flex items-center gap-2 text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[#0D5C3A]">Live Dossier Completion Meter:</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-[#0D5C3A] font-mono text-xs font-black shadow-xs">
              {completionStats.filled} / {completionStats.total} Sections Filled
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-white font-mono text-xs font-black shadow-xs transition-all ${
              completionStats.percent === 100 
                ? 'bg-emerald-600 animate-pulse' 
                : completionStats.percent > 50 
                ? 'bg-[#0D5C3A]' 
                : 'bg-amber-600'
            }`}>
              {completionStats.percent}%
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-200/90 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${Math.max(5, completionStats.percent)}%` }}
          />
        </div>
      </div>

      {/* Top Banner Feedback */}
      {formError && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* ================= 1. CATEGORY ================= */}
      <div>
        <SectionHeading title="Category" isCompleted={completionStats.isCat1Complete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          <FormSelect
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              'Orphan',
              'Divorce',
              'Poorest of the Poor',
            ]}
          />
        </div>
      </div>

      {/* ================= 2. CATEGORY 2 ================= */}
      <div>
        <SectionHeading title="Category 2 (Enrollment Type)" isCompleted={completionStats.isCat2Complete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          <FormSelect
            label="Category 2"
            value={enrollmentType}
            onChange={(e) => setEnrollmentType(e.target.value)}
            options={['New Enrollment', 'Replace']}
          />

          {enrollmentType === 'Replace' ? (
            <>
              <FormInput
                label="Registration No."
                placeholder="Registration Number"
                value={replacedRegistrationNo}
                onChange={(e) => setReplacedRegistrationNo(e.target.value)}
                required
              />
              <FormInput
                label="Class"
                placeholder="Class"
                value={replacedClass}
                onChange={(e) => setReplacedClass(e.target.value)}
                required
              />
              <FormInput
                label="School Name"
                placeholder="School Name"
                value={replacedSchoolName}
                onChange={(e) => setReplacedSchoolName(e.target.value)}
                required
              />
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  School Leaving Certificate <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Choose Certificate</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => setSchoolLeavingCertificateFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {schoolLeavingCertificateFile || savedSchoolLeavingCertificateName ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <span className="max-w-[240px] truncate">
                        ✓ {schoolLeavingCertificateFile?.name || savedSchoolLeavingCertificateName}
                      </span>
                      {schoolLeavingCertificateFile && (
                        <button
                          type="button"
                          onClick={() => setSchoolLeavingCertificateFile(null)}
                          className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                          aria-label="Remove selected school leaving certificate"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No certificate attached</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="relative flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
              <div className="space-y-1">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                  New Enrollment
                </div>
                <div className="text-[11px] text-slate-600">
                  Fresh admission record. No replacement registration is required.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= 3. BASIC INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={1} title="Basic Info" isCompleted={completionStats.isBasicComplete} />
          <div className="mb-2">
            <ChildPhotoPicker
              onFileSelected={(file) => setProfilePhotoFile(file)}
              onRemove={() => setProfilePhotoFile(null)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Exact 3-column layout matching the screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {/* Row 1 */}
          <FormInput
            placeholder="Registration No"
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
            required
          />
          <FormInput
            label="Admission Date"
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            required
          />
          <FormInput
            placeholder="Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {/* Row 2 */}
          <FormInput
            placeholder="B-Form/CNIC No *"
            value={bFormNo}
            onChange={(e) => setBFormNo(formatCNIC(e.target.value))}
            required
          />
          <FormInput
            label="DOB"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
          <FormSelect
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={['Male', 'Female', 'Other']}
          />

          {/* Row 3 */}
          <FormInput
            placeholder="Family Cast"
            value={familyCast}
            onChange={(e) => setFamilyCast(e.target.value)}
          />
          <FormInput
            placeholder="Mother Language"
            value={motherLanguage}
            onChange={(e) => setMotherLanguage(e.target.value)}
          />
          <FormInput
            placeholder="Birth District"
            value={birthDistrict}
            onChange={(e) => setBirthDistrict(e.target.value)}
          />

          {/* Row 4 */}
          <FormInput
            placeholder="Identification Mark"
            value={identificationMark}
            onChange={(e) => setIdentificationMark(e.target.value)}
          />
          <FormInput
            placeholder="Next Of Kin"
            value={nextOfKin}
            onChange={(e) => setNextOfKin(e.target.value)}
          />
          <FormSelect
            label="Sponsorship?"
            value={isSponsored}
            onChange={(e) => setIsSponsored(e.target.value)}
            options={['No', 'Yes']}
          />

          {/* Row 5 */}
          <FormInput
            placeholder="Sponsorship Amount"
            value={sponsorshipAmount}
            onChange={(e) => setSponsorshipAmount(e.target.value)}
            disabled={isSponsored !== 'Yes'}
          />
          <FormSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={['Active', 'Pending', 'Graduated', 'Transferred', 'Deactivated']}
            className="md:col-span-2"
          />

          {/* Row 6 */}
          <FormInput
            label="Date of Status"
            type="date"
            value={dateOfStatus}
            onChange={(e) => setDateOfStatus(e.target.value)}
          />
          <FormInput
            placeholder="Status Remarks"
            value={statusRemarks}
            onChange={(e) => setStatusRemarks(e.target.value)}
            className="md:col-span-2"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-xs font-bold text-slate-800">B-Form / Child Registration Document</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                title: 'B-Form Front',
                documentType: 'B_FORM_FRONT',
                file: bFormFrontFile,
                setFile: setBFormFrontFile,
              },
              {
                title: 'B-Form Back',
                documentType: 'B_FORM_BACK',
                file: bFormBackFile,
                setFile: setBFormBackFile,
              },
            ].map((document) => {
              const savedDocument = Array.isArray(initialChild?.documents)
                ? initialChild.documents
                    .filter((item: any) => item.documentType === document.documentType)
                    .sort((a: any, b: any) =>
                      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                    )[0]
                : null;

              return (
                <div key={document.documentType} className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    {document.title}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      disabled={isSubmitting}
                      onChange={(event) => document.setFile(event.target.files?.[0] || null)}
                      className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700"
                    />
                  </label>
                  {document.file ? (
                    <p className="text-[11px] text-slate-600">Selected: {document.file.name}</p>
                  ) : savedDocument ? (
                    <a
                      href={`/api/children/${initialChild.id}/documents?documentId=${savedDocument.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-[11px] font-semibold text-indigo-700 hover:underline"
                    >
                      View saved {document.title}
                    </a>
                  ) : (
                    <p className="text-[11px] text-slate-400">Optional — no file selected</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= 4. HEALTH INFO ================= */}
      <div>
        <SectionHeading step={2} title="Health Info" isCompleted={completionStats.isHealthComplete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {/* Row 1 */}
          <FormSelect
            label="Is Disable?"
            value={isDisable}
            onChange={(e) => setIsDisable(e.target.value)}
            options={['No', 'Yes']}
          />
          <FormSelect
            label="Blood Group"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
          />
          <FormInput
            placeholder="Mental Health"
            value={mentalHealth}
            onChange={(e) => setMentalHealth(e.target.value)}
          />

          {/* Row 2 */}
          <FormInput
            placeholder="Physical Health"
            value={physicalHealth}
            onChange={(e) => setPhysicalHealth(e.target.value)}
          />
          <FormInput
            placeholder="Vaccination Detail"
            value={vaccinationDetail}
            onChange={(e) => setVaccinationDetail(e.target.value)}
          />
          <FormInput
            placeholder="Any Special Need"
            value={specialNeedDisease}
            onChange={(e) => setSpecialNeedDisease(e.target.value)}
          />
        </div>
      </div>

      {/* ================= APPEARANCE ================= */}
      <div>
        <SectionHeading title="Appearance" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          <FormInput
            label="Height"
            name="height"
            type="number"
            min={0}
            step="any"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <FormInput
            label="Weight"
            name="weight"
            type="number"
            min={0}
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <FormInput
            label="Age"
            name="age"
            type="number"
            min={0}
            step="1"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
      </div>

      {/* ================= 5. FATHER INFO ================= */}
      <div>
        <SectionHeading step={3} title="Father Info" isCompleted={completionStats.isFatherComplete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {/* Row 1 */}
          <FormInput
            placeholder="Father Name"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
          />
          <FormInput
            placeholder="Father CNIC"
            value={fatherCnic}
            onChange={(e) => setFatherCnic(formatCNIC(e.target.value))}
          />
          <FormInput
            placeholder="Father Contact No."
            value={fatherContact}
            onChange={(e) => setFatherContact(formatPhone(e.target.value))}
          />

          {/* Row 2 */}
          <FormSelect
            label="Is Alive?"
            value={fatherIsAlive}
            onChange={(e) => setFatherIsAlive(e.target.value)}
            options={['Yes', 'No']}
          />
          <FormInput
            label="Date of Birth"
            type="date"
            value={fatherDob}
            onChange={(e) => setFatherDob(e.target.value)}
          />
          {fatherIsAlive === 'No' && (
            <>
              <FormInput
                placeholder="Cause of Death"
                value={fatherCauseOfDeath}
                onChange={(e) => setFatherCauseOfDeath(e.target.value)}
              />
              <FormInput
                label="Date of Death"
                type="date"
                value={fatherDod}
                onChange={(e) => setFatherDod(e.target.value)}
              />
            </>
          )}

          {/* Row 3 */}
          <FormInput
            placeholder="Qualification"
            value={fatherQualification}
            onChange={(e) => setFatherQualification(e.target.value)}
          />
          <FormInput
            placeholder="Profession"
            value={fatherProfession}
            onChange={(e) => setFatherProfession(e.target.value)}
          />
          <FormInput
            placeholder="District"
            value={fatherDistrict}
            onChange={(e) => setFatherDistrict(e.target.value)}
          />

          {/* Row 4 */}
          <FormInput
            placeholder="Tehsil"
            value={fatherTehsil}
            onChange={(e) => setFatherTehsil(e.target.value)}
          />
          <FormInput
            placeholder="Union Council No."
            value={fatherUcNumber}
            onChange={(e) => setFatherUcNumber(e.target.value)}
          />
          <FormInput
            placeholder="Union Council Name"
            value={fatherUcName}
            onChange={(e) => setFatherUcName(e.target.value)}
          />
          <FormInput
            placeholder="Street Number"
            value={fatherStreetNumber}
            onChange={(e) => setFatherStreetNumber(e.target.value)}
          />

          {/* Row 5 */}
          <FormInput
            placeholder="House Number"
            value={fatherHouseNumber}
            onChange={(e) => setFatherHouseNumber(e.target.value)}
          />
          <FormInput
            placeholder="Address"
            value={fatherAddress}
            onChange={(e) => setFatherAddress(e.target.value)}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* ================= 6. MOTHER INFO ================= */}
      <div>
        <SectionHeading step={4} title="Mother Info" isCompleted={completionStats.isMotherComplete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {/* Row 1 */}
          <FormInput
            placeholder="Mother Name"
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
          />
          <FormInput
            placeholder="Mother CNIC"
            value={motherCnic}
            onChange={(e) => setMotherCnic(formatCNIC(e.target.value))}
          />
          <FormInput
            placeholder="Mother Contact No."
            value={motherContact}
            onChange={(e) => setMotherContact(formatPhone(e.target.value))}
          />

          {/* Row 2 */}
          <FormSelect
            label="Is Alive?"
            value={motherIsAlive}
            onChange={(e) => setMotherIsAlive(e.target.value)}
            options={['Yes', 'No']}
          />
          <FormInput
            label="Date of Birth"
            type="date"
            value={motherDob}
            onChange={(e) => setMotherDob(e.target.value)}
          />
          {motherIsAlive === 'No' && (
            <>
              <FormInput
                placeholder="Cause of Death"
                value={motherCauseOfDeath}
                onChange={(e) => setMotherCauseOfDeath(e.target.value)}
              />
              <FormInput
                label="Date of Death"
                type="date"
                value={motherDod}
                onChange={(e) => setMotherDod(e.target.value)}
              />
            </>
          )}

          {/* Row 3 */}
          <FormInput
            placeholder="Qualification"
            value={motherQualification}
            onChange={(e) => setMotherQualification(e.target.value)}
          />
          <FormInput
            placeholder="Profession"
            value={motherProfession}
            onChange={(e) => setMotherProfession(e.target.value)}
          />
          <FormInput
            placeholder="District"
            value={motherDistrict}
            onChange={(e) => setMotherDistrict(e.target.value)}
          />

          {/* Row 4 */}
          <FormInput
            placeholder="Tehsil"
            value={motherTehsil}
            onChange={(e) => setMotherTehsil(e.target.value)}
          />
          <FormInput
            placeholder="Union Council No."
            value={motherUcNumber}
            onChange={(e) => setMotherUcNumber(e.target.value)}
          />
          <FormInput
            placeholder="Union Council Name"
            value={motherUcName}
            onChange={(e) => setMotherUcName(e.target.value)}
          />
          <FormInput
            placeholder="Street Number"
            value={motherStreetNumber}
            onChange={(e) => setMotherStreetNumber(e.target.value)}
          />

          {/* Row 5 */}
          <FormInput
            placeholder="House Number"
            value={motherHouseNumber}
            onChange={(e) => setMotherHouseNumber(e.target.value)}
          />
          <FormInput
            placeholder="Address"
            value={motherAddress}
            onChange={(e) => setMotherAddress(e.target.value)}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* ================= 5. SIBLINGS INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={5} title="Siblings Info" isCompleted={completionStats.isSiblingComplete} />
          <button
            type="button"
            onClick={addSibling}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0D5C3A] text-white rounded-lg text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
        <div className="space-y-4">
          {siblings.map((s, idx) => (
            <div key={s.id} className="pt-2 pb-3 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Sibling #{idx + 1}</span>
                {siblings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSibling(s.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
                <FormInput placeholder="Sibling Name" value={s.name} onChange={(e) => updateSibling(s.id, 'name', e.target.value)} />
                <FormSelect label="Gender" value={s.gender} onChange={(e) => updateSibling(s.id, 'gender', e.target.value)} options={['Male', 'Female', 'Other']} />
                <FormInput placeholder="Age" value={s.age} onChange={(e) => updateSibling(s.id, 'age', e.target.value)} />
                <FormInput placeholder="Qualification" value={s.qualification} onChange={(e) => updateSibling(s.id, 'qualification', e.target.value)} />
                <FormInput placeholder="Profession" value={s.profession} onChange={(e) => updateSibling(s.id, 'profession', e.target.value)} />
                <FormInput placeholder="Institution" value={s.institution} onChange={(e) => updateSibling(s.id, 'institution', e.target.value)} />
                <FormInput placeholder="Grade / Class" value={s.gradeClass} onChange={(e) => updateSibling(s.id, 'gradeClass', e.target.value)} />
                <FormSelect label="Marital Status" value={s.maritalStatus} onChange={(e) => updateSibling(s.id, 'maritalStatus', e.target.value)} options={['Single', 'Married', 'Divorced', 'Widow']} />
                <FormInput placeholder="District" value={s.district} onChange={(e) => updateSibling(s.id, 'district', e.target.value)} />
                <FormInput placeholder="Tehsil" value={s.tehsil} onChange={(e) => updateSibling(s.id, 'tehsil', e.target.value)} />
                <FormInput placeholder="Union Council No." value={s.ucNumber} onChange={(e) => updateSibling(s.id, 'ucNumber', e.target.value)} />
                <FormInput placeholder="Union Council Name" value={s.ucName || ''} onChange={(e) => updateSibling(s.id, 'ucName', e.target.value)} />
                <FormInput placeholder="Street Number" value={s.streetNumber} onChange={(e) => updateSibling(s.id, 'streetNumber', e.target.value)} />
                <FormInput placeholder="House Number" value={s.houseNumber} onChange={(e) => updateSibling(s.id, 'houseNumber', e.target.value)} />
                <FormInput placeholder="Address" value={s.address} onChange={(e) => updateSibling(s.id, 'address', e.target.value)} className="md:col-span-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 6. GUARDIAN INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={6} title="Guardian Info" isCompleted={completionStats.isGuardianComplete} />
          <button
            type="button"
            onClick={addGuardian}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0D5C3A] text-white rounded-lg text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {/* Row 1 */}
          <FormInput
            placeholder="Guardian Name"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
          />
          <FormInput
            placeholder="Relation"
            value={guardianRelation}
            onChange={(e) => setGuardianRelation(e.target.value)}
          />
          <FormInput
            placeholder="Guardian Contact No."
            value={guardianContact}
            onChange={(e) => setGuardianContact(formatPhone(e.target.value))}
          />

          {/* Row 2 */}
          <FormInput
            placeholder="Guardian CNIC"
            value={guardianCnic}
            onChange={(e) => setGuardianCnic(formatCNIC(e.target.value))}
          />
          <FormInput
            placeholder="Qualification"
            value={guardianQualification}
            onChange={(e) => setGuardianQualification(e.target.value)}
          />
          <FormInput
            placeholder="Profession"
            value={guardianProfession}
            onChange={(e) => setGuardianProfession(e.target.value)}
          />

          {/* Row 3 */}
          <FormSelect
            label="Permanent Address Type"
            value={guardianAddressType}
            onChange={(e) => setGuardianAddressType(e.target.value)}
            options={['City', 'Village']}
          />
          {guardianAddressType === 'Village' ? (
            <FormInput
              label="Post Office"
              value={guardianPostOffice}
              onChange={(e) => setGuardianPostOffice(e.target.value)}
            />
          ) : guardianAddressType === 'City' ? (
            <FormInput
              label="Colony"
              value={guardianColony}
              onChange={(e) => setGuardianColony(e.target.value)}
            />
          ) : null}
          <FormInput
            label="Permanent Address"
            value={guardianAddress}
            onChange={(e) => setGuardianAddress(e.target.value)}
          />
          <FormInput
            label="District"
            value={guardianDistrict}
            onChange={(e) => setGuardianDistrict(e.target.value)}
          />
          <FormInput
            label="Tehsil"
            value={guardianTehsil}
            onChange={(e) => setGuardianTehsil(e.target.value)}
          />
          <FormInput
            label="Union Council No."
            value={guardianUcNumber}
            onChange={(e) => setGuardianUcNumber(e.target.value)}
          />
          <FormInput
            label="Union Council Name"
            value={guardianUcName}
            onChange={(e) => setGuardianUcName(e.target.value)}
          />
          <FormInput
            label="Street No."
            value={guardianStreetNumber}
            onChange={(e) => setGuardianStreetNumber(e.target.value)}
          />
          <FormInput
            label="House No."
            value={guardianHouseNumber}
            onChange={(e) => setGuardianHouseNumber(e.target.value)}
          />
          <label className="md:col-span-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={sameAsPermanentAddress}
              onChange={(e) => setSameAsPermanentAddress(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Same as Permanent Address
          </label>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 border-t border-slate-200 pt-4">
            <FormSelect
              label="Current / Present Address Type"
              value={currentGuardianAddress.addressType}
              onChange={(e) => updateCurrentGuardianAddress('addressType', e.target.value)}
              options={['City', 'Village']}
              disabled={sameAsPermanentAddress}
            />
            {currentGuardianAddress.addressType === 'Village' ? (
              <FormInput
                label="Post Office"
                value={currentGuardianAddress.postOffice}
                onChange={(e) => updateCurrentGuardianAddress('postOffice', e.target.value)}
                disabled={sameAsPermanentAddress}
              />
            ) : currentGuardianAddress.addressType === 'City' ? (
              <FormInput
                label="Colony"
                value={currentGuardianAddress.colony}
                onChange={(e) => updateCurrentGuardianAddress('colony', e.target.value)}
                disabled={sameAsPermanentAddress}
              />
            ) : null}
            <FormInput
              label="Current / Present Address"
              value={currentGuardianAddress.address}
              onChange={(e) => updateCurrentGuardianAddress('address', e.target.value)}
              disabled={sameAsPermanentAddress}
            />
            <FormInput
              label="District"
              value={currentGuardianAddress.district}
              onChange={(e) => updateCurrentGuardianAddress('district', e.target.value)}
              disabled={sameAsPermanentAddress}
            />
            <FormInput
              label="Tehsil"
              value={currentGuardianAddress.tehsil}
              onChange={(e) => updateCurrentGuardianAddress('tehsil', e.target.value)}
              disabled={sameAsPermanentAddress}
            />
            <FormInput
              label="Union Council No."
              value={currentGuardianAddress.ucNumber}
              onChange={(e) => updateCurrentGuardianAddress('ucNumber', e.target.value)}
              disabled={sameAsPermanentAddress}
            />
            <FormInput
              label="Union Council Name"
              value={currentGuardianAddress.ucName}
              onChange={(e) => updateCurrentGuardianAddress('ucName', e.target.value)}
              disabled={sameAsPermanentAddress}
            />
            <FormInput
              label="Street No."
              value={currentGuardianAddress.streetNumber}
              onChange={(e) => updateCurrentGuardianAddress('streetNumber', e.target.value)}
              disabled={sameAsPermanentAddress}
            />
            <FormInput
              label="House No."
              value={currentGuardianAddress.houseNumber}
              onChange={(e) => updateCurrentGuardianAddress('houseNumber', e.target.value)}
              disabled={sameAsPermanentAddress}
            />
          </div>
        </div>

        {additionalGuardians.map((guardian, index) => (
          <div key={guardian.id} className="mt-4 space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Additional Guardian #{index + 1}</span>
              <button
                type="button"
                onClick={() => setAdditionalGuardians((current) => current.filter((item) => item.id !== guardian.id))}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
              <FormInput
                placeholder="Guardian Name"
                value={guardian.name}
                onChange={(event) => updateGuardian(guardian.id, 'name', event.target.value)}
              />
              <FormInput
                placeholder="Relation"
                value={guardian.relation}
                onChange={(event) => updateGuardian(guardian.id, 'relation', event.target.value)}
              />
              <FormInput
                placeholder="Guardian Contact No."
                value={guardian.contact}
                onChange={(event) => updateGuardian(guardian.id, 'contact', event.target.value)}
              />
              <FormInput
                placeholder="Guardian CNIC"
                value={guardian.cnic}
                onChange={(event) => updateGuardian(guardian.id, 'cnic', event.target.value)}
              />
              <FormInput
                placeholder="Qualification"
                value={guardian.qualification}
                onChange={(event) => updateGuardian(guardian.id, 'qualification', event.target.value)}
              />
              <FormInput
                placeholder="Profession"
                value={guardian.profession}
                onChange={(event) => updateGuardian(guardian.id, 'profession', event.target.value)}
              />
              <FormInput
                label="Address"
                value={guardian.address}
                onChange={(event) => updateGuardian(guardian.id, 'address', event.target.value)}
                className="md:col-span-3"
              />
              <FormInput
                label="District"
                value={guardian.district}
                onChange={(event) => updateGuardian(guardian.id, 'district', event.target.value)}
              />
              <FormInput
                label="Tehsil"
                value={guardian.tehsil}
                onChange={(event) => updateGuardian(guardian.id, 'tehsil', event.target.value)}
              />
              <FormInput
                label="Union Council No."
                value={guardian.ucNumber}
                onChange={(event) => updateGuardian(guardian.id, 'ucNumber', event.target.value)}
              />
              <FormInput
                label="Union Council Name"
                value={guardian.ucName || ''}
                onChange={(event) => updateGuardian(guardian.id, 'ucName', event.target.value)}
              />
              <FormInput
                label="Street No."
                value={guardian.streetNumber}
                onChange={(event) => updateGuardian(guardian.id, 'streetNumber', event.target.value)}
              />
              <FormInput
                label="House No."
                value={guardian.houseNumber}
                onChange={(event) => updateGuardian(guardian.id, 'houseNumber', event.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ================= 8. MEETING PERSON INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={7} title="Meeting Person Info" isCompleted={completionStats.isMeetingComplete} />
          <button
            type="button"
            onClick={addMeetingPerson}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0D5C3A] text-white rounded-lg text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        <div className="space-y-4">
          {meetingPersons.map((p, idx) => (
            <div key={p.id} className="pt-2 pb-3 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Meeting Person #{idx + 1}</span>
                {meetingPersons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMeetingPerson(p.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
                {/* Row 1 */}
                <FormInput
                  placeholder="Meeting Person Name"
                  value={p.name}
                  onChange={(e) => updateMeetingPerson(p.id, 'name', e.target.value)}
                />
                <FormInput
                  placeholder="Relation"
                  value={p.relation}
                  onChange={(e) => updateMeetingPerson(p.id, 'relation', e.target.value)}
                />
                <FormInput
                  placeholder="CNIC"
                  value={p.cnic}
                  onChange={(e) => updateMeetingPerson(p.id, 'cnic', e.target.value)}
                />

                {/* Row 2 */}
                <FormInput
                  placeholder="Contact No."
                  value={p.contact}
                  onChange={(e) => updateMeetingPerson(p.id, 'contact', e.target.value)}
                />
                <FormInput
                  placeholder="Qualification"
                  value={p.qualification}
                  onChange={(e) => updateMeetingPerson(p.id, 'qualification', e.target.value)}
                />
                <FormInput
                  placeholder="Profession"
                  value={p.profession}
                  onChange={(e) => updateMeetingPerson(p.id, 'profession', e.target.value)}
                />

                {/* Row 3 */}
                <FormInput
                  label="Date & Time"
                  type="datetime-local"
                  value={p.dateTime}
                  onChange={(e) => updateMeetingPerson(p.id, 'dateTime', e.target.value)}
                />
                <FormInput
                  label="Start Date & Time"
                  type="datetime-local"
                  value={p.startDateTime}
                  onChange={(e) => updateMeetingPerson(p.id, 'startDateTime', e.target.value)}
                />
                <FormInput
                  label="End Date & Time"
                  type="datetime-local"
                  value={p.endDateTime}
                  onChange={(e) => updateMeetingPerson(p.id, 'endDateTime', e.target.value)}
                />

                {/* Row 4 */}
                <FormInput
                  placeholder="District"
                  value={p.district}
                  onChange={(e) => updateMeetingPerson(p.id, 'district', e.target.value)}
                />
                <FormInput
                  placeholder="Tehsil"
                  value={p.tehsil}
                  onChange={(e) => updateMeetingPerson(p.id, 'tehsil', e.target.value)}
                />
                <FormInput
                  placeholder="Union Council No."
                  value={p.ucNumber}
                  onChange={(e) => updateMeetingPerson(p.id, 'ucNumber', e.target.value)}
                />
                <FormInput
                  placeholder="Union Council Name"
                  value={p.ucName || ''}
                  onChange={(e) => updateMeetingPerson(p.id, 'ucName', e.target.value)}
                />

                {/* Row 5 */}
                <FormInput
                  placeholder="Street Number"
                  value={p.streetNumber}
                  onChange={(e) => updateMeetingPerson(p.id, 'streetNumber', e.target.value)}
                />
                <FormInput
                  placeholder="House Number"
                  value={p.houseNumber}
                  onChange={(e) => updateMeetingPerson(p.id, 'houseNumber', e.target.value)}
                />
                <FormInput
                  placeholder="Address"
                  value={p.address}
                  onChange={(e) => updateMeetingPerson(p.id, 'address', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 8. WITNESS INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={8} title="Witness Info" isCompleted={completionStats.isWitnessComplete} />
          <button
            type="button"
            onClick={addWitness}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0D5C3A] text-white rounded-lg text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        <div className="space-y-4">
          {witnesses.map((w, idx) => (
            <div key={w.id} className="pt-2 pb-3 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Witness #{idx + 1}</span>
                {witnesses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWitness(w.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
                {/* Row 1 */}
                <FormInput
                  placeholder="Name"
                  value={w.name}
                  onChange={(e) => updateWitness(w.id, 'name', e.target.value)}
                />
                <FormInput
                  placeholder="CNIC"
                  value={w.cnic}
                  onChange={(e) => updateWitness(w.id, 'cnic', e.target.value)}
                />
                <FormInput
                  placeholder="Father Name"
                  value={w.fatherName}
                  onChange={(e) => updateWitness(w.id, 'fatherName', e.target.value)}
                />

                {/* Row 2 */}
                <FormInput
                  placeholder="Contact No."
                  value={w.contact}
                  onChange={(e) => updateWitness(w.id, 'contact', e.target.value)}
                />
                <FormInput
                  placeholder="Qualification"
                  value={w.qualification}
                  onChange={(e) => updateWitness(w.id, 'qualification', e.target.value)}
                />
                <FormInput
                  placeholder="Profession"
                  value={w.profession}
                  onChange={(e) => updateWitness(w.id, 'profession', e.target.value)}
                />

                {/* Address */}
                <FormInput
                  label="Address"
                  value={w.address}
                  onChange={(e) => updateWitness(w.id, 'address', e.target.value)}
                  className="md:col-span-3"
                />
                <FormInput
                  label="District"
                  value={w.district || ''}
                  onChange={(e) => updateWitness(w.id, 'district', e.target.value)}
                />
                <FormInput
                  label="Tehsil"
                  value={w.tehsil || ''}
                  onChange={(e) => updateWitness(w.id, 'tehsil', e.target.value)}
                />
                <FormInput
                  label="Union Council No."
                  value={w.ucNumber || ''}
                  onChange={(e) => updateWitness(w.id, 'ucNumber', e.target.value)}
                />
                <FormInput
                  label="Union Council Name"
                  value={w.ucName || ''}
                  onChange={(e) => updateWitness(w.id, 'ucName', e.target.value)}
                />
                <FormInput
                  label="Street No."
                  value={w.streetNumber || ''}
                  onChange={(e) => updateWitness(w.id, 'streetNumber', e.target.value)}
                />
                <FormInput
                  label="House No."
                  value={w.houseNumber || ''}
                  onChange={(e) => updateWitness(w.id, 'houseNumber', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 11. RESULT INFO ================= */}
      <div>
        <SectionHeading step={9} title="Result Info" isCompleted={completionStats.isResultComplete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 mb-4">
          <FormInput
            placeholder="School"
            value={resultSchool}
            onChange={(e) => setResultSchool(e.target.value)}
          />
          <FormInput
            placeholder="Class"
            value={resultClass}
            onChange={(e) => setResultClass(e.target.value)}
          />
          <FormInput
            label="Exam Date"
            type="date"
            value={resultExamDate}
            onChange={(e) => setResultExamDate(e.target.value)}
          />

          <FormSelect
            label="Exam Type"
            value={resultExamType}
            onChange={(e) => setResultExamType(e.target.value)}
            options={['Annual', 'Mid-Term', 'Monthly Assessment', 'Entry Test']}
          />
          <FormInput
            placeholder="Passing Score"
            value={resultPassingScore}
            onChange={(e) => setResultPassingScore(e.target.value)}
            className="md:col-span-2"
          />
        </div>

        {/* Dynamic Subject-wise Results */}
        <div className="mt-3 border border-slate-200 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Subject-wise Result</span>
            <button
              type="button"
              onClick={addSubjectResult}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0D5C3A] text-white rounded text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Obtained Marks</th>
                  <th className="px-3 py-2">Total Marks</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectResults.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={r.subject}
                        onChange={(e) => updateSubjectResult(r.id, 'subject', e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        placeholder="Obtained"
                        value={r.obtainedMarks}
                        onChange={(e) => updateSubjectResult(r.id, 'obtainedMarks', e.target.value)}
                        className="w-28 p-1.5 border border-slate-300 rounded text-xs font-semibold"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        placeholder="Total"
                        value={r.totalMarks}
                        onChange={(e) => updateSubjectResult(r.id, 'totalMarks', e.target.value)}
                        className="w-28 p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {subjectResults.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubjectResult(r.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= 12. HEALTH CARE SECTION ================= */}
      <div>
        <SectionHeading step={10} title="Health Care & Medical Follow-up" isCompleted={completionStats.isHealthCareComplete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          <FormSelect
            label="Check Frequency"
            value={checkFrequency}
            onChange={(e) => setCheckFrequency(e.target.value)}
            options={['Daily', 'Weekly', 'Monthly']}
          />
          <FormInput
            placeholder="Medicine Details"
            value={medicineDetails}
            onChange={(e) => setMedicineDetails(e.target.value)}
          />
          <FormInput
            placeholder="Antibiotic Medicine"
            value={antibioticMedicine}
            onChange={(e) => setAntibioticMedicine(e.target.value)}
          />
          <FormInput
            placeholder="Enter doctor name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
          <FormInput
            placeholder="Enter hospital name"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
          />
          <FormSelect
            label="Hospital Type"
            value={hospitalType}
            onChange={(e) => setHospitalType(e.target.value)}
            options={['Government', 'Private']}
            placeholder="Select hospital type"
          />
          <FormInput
            type="tel"
            placeholder="Enter doctor contact number"
            value={doctorContactNo}
            onChange={(e) => setDoctorContactNo(e.target.value)}
          />

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Prescription Photo / Medical Document
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300 shadow-xs">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Choose Prescription File</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setPrescriptionPhotoFile(e.target.files?.[0] || null)}
                />
              </label>

              <button
                type="button"
                onClick={() => setActiveCameraModal('prescription')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📷 Live Camera Snap</span>
              </button>

              {prescriptionPhotoFile ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <span>✓ {prescriptionPhotoFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setPrescriptionPhotoFile(null)}
                    className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No document attached</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 13. REPORT / COMPLAINT SECTION ================= */}
      <div>
        <SectionHeading step={11} title="Behavioral & Academic Report / Complaints" isCompleted={completionStats.isReportComplete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 mb-3.5">
          <FormSelect
            label="Complain Type"
            value={reportCategory}
            onChange={(e) => setReportCategory(e.target.value)}
            options={['Discipline', 'Behavior', 'Academic', 'Islamic', 'Psychological']}
          />
        </div>

        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Report / complaint details..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-slate-950 focus:outline-hidden focus:ring-1 focus:ring-slate-950 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Written Report / Complaint Document Photo
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300 shadow-xs">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Choose Written File</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setWrittenReportFile(e.target.files?.[0] || null)}
                />
              </label>

              <button
                type="button"
                onClick={() => setActiveCameraModal('report')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D5C3A] hover:bg-[#09482D] text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shimmer-badge"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>📷 Live Camera Photo Snap</span>
              </button>

              {writtenReportFile ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <span>✓ {writtenReportFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setWrittenReportFile(null)}
                    className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No report file attached</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 14. AREA OF INTEREST – CHILD ================= */}
      <div>
        <SectionHeading step={12} title="Area of Interest – Child" isCompleted={completionStats.isInterestComplete} />
        <div className="relative">
          <textarea
            rows={3}
            value={areaOfInterest}
            onChange={(e) => setAreaOfInterest(e.target.value)}
            placeholder="Area of Interest"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-slate-950 focus:outline-hidden focus:ring-1 focus:ring-slate-950 resize-none"
          />
        </div>
      </div>

      {/* ================= 15. ATTACHMENTS (FINAL SECTION) ================= */}
      <div>
        <SectionHeading step={13} title="Mandatory Attachments & Verification" isCompleted={completionStats.isAttachmentsComplete} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {Object.entries(attachments).map(([key, item]) => (
            <div key={key} className="p-3 border border-slate-700 rounded-lg bg-white flex flex-col justify-between gap-2 shadow-xs">
              <span className="text-xs font-bold text-slate-800">{item.title}</span>
              {(() => {
                const documentType = key === 'fatherCnicFront'
                  ? 'FATHER_CNIC_FRONT'
                  : key === 'fatherCnicBack'
                    ? 'FATHER_CNIC_BACK'
                    : null;
                const savedDocument = documentType ? getSavedDocument(documentType) : null;

                return !item.file && savedDocument && initialChild?.id ? (
                  <a
                    href={`/api/children/${initialChild.id}/documents?documentId=${savedDocument.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-700 hover:underline"
                  >
                    View saved file: {savedDocument.title}
                  </a>
                ) : null;
              })()}

              <div className="flex items-center justify-between pt-1 gap-1">
                {item.file ? (
                  <span className="text-xs text-emerald-700 font-semibold truncate max-w-[110px]">
                    ✓ {item.file.name}
                  </span>
                ) : (key === 'fatherCnicFront' && getSavedDocument('FATHER_CNIC_FRONT')) ||
                  (key === 'fatherCnicBack' && getSavedDocument('FATHER_CNIC_BACK')) ? (
                  <span className="text-xs text-emerald-700 font-semibold">✓ Saved</span>
                ) : (
                  <span className="text-[11px] text-slate-400">No file chosen</span>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium cursor-pointer transition-colors">
                    <span>Browse</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      disabled={isSubmitting}
                      onChange={(e) => handleAttachmentUpload(key, e.target.files?.[0] || null)}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setActiveAttachmentKey(key);
                      setActiveCameraModal('attachment');
                    }}
                    className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
                    title={`Snap photo of ${item.title}`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-7 py-2.5 rounded-lg bg-[#0D5C3A] hover:bg-[#0b4d30] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95 shimmer-badge flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Dossier...</span>
            </>
          ) : (
            <span>💾 Save Child Dossier</span>
          )}
        </button>
      </div>

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={activeCameraModal !== 'none'}
        onClose={() => {
          setActiveCameraModal('none');
          setActiveAttachmentKey(null);
        }}
        onCapture={(capturedFile) => {
          if (activeCameraModal === 'prescription') {
            setPrescriptionPhotoFile(capturedFile);
          } else if (activeCameraModal === 'report') {
            setWrittenReportFile(capturedFile);
          } else if (activeCameraModal === 'attachment' && activeAttachmentKey) {
            handleAttachmentUpload(activeAttachmentKey, capturedFile);
          }
        }}
        title={
          activeCameraModal === 'report'
            ? 'Capture Written Report / Complaint Document'
            : activeCameraModal === 'prescription'
            ? 'Capture Medical Prescription'
            : `Capture Document: ${activeAttachmentKey ? attachments[activeAttachmentKey]?.title : 'Attachment'}`
        }
        documentType={
          activeCameraModal === 'report'
            ? 'complaint_report'
            : activeCameraModal === 'prescription'
            ? 'prescription'
            : activeAttachmentKey || 'document'
        }
      />
    </form>
  );
}
