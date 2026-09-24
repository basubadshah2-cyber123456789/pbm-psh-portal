'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { ChildPhotoPicker } from './ChildPhotoPicker';

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
  institution: string;
  gradeClass: string;
  maritalStatus: string;
  district: string;
  tehsil: string;
  ucNumber: string;
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
  qualification: string;
  profession: string;
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
}) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] sm:text-xs font-bold text-slate-900 z-10 select-none">
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
        placeholder={placeholder || (label ? '' : undefined)}
        className="w-full h-10 sm:h-11 px-3.5 py-2 bg-white border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-500 focus:border-slate-950 focus:outline-hidden focus:ring-1 focus:ring-slate-950 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed transition-colors"
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
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] sm:text-xs font-bold text-slate-900 z-10 select-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full h-10 sm:h-11 px-3.5 py-2 bg-white border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 focus:border-slate-950 focus:outline-hidden focus:ring-1 focus:ring-slate-950 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed transition-colors"
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

// Section Header with Warm Orange/Terracotta Color
function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="text-[#C86A28] font-semibold text-sm sm:text-base mt-6 mb-3 tracking-normal">
      {title}
    </h3>
  );
}

export function AddPSHForm({ onSuccess, onCancel }: AddPSHFormProps) {
  const generateAdmissionNo = () => `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // ================= 1. CATEGORY =================
  const [category, setCategory] = useState<string>('');
  const [replacedRegistrationNo, setReplacedRegistrationNo] = useState<string>('');

  // ================= 2. BASIC INFO =================
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [registrationNo, setRegistrationNo] = useState<string>(generateAdmissionNo());
  const [admissionDate, setAdmissionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fullName, setFullName] = useState<string>('');
  const [bFormNo, setBFormNo] = useState<string>('');
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

  // ================= 4. FATHER INFO =================
  const [fatherName, setFatherName] = useState<string>('');
  const [fatherCnic, setFatherCnic] = useState<string>('');
  const [fatherContact, setFatherContact] = useState<string>('');
  const [fatherIsAlive, setFatherIsAlive] = useState<string>('');
  const [fatherDob, setFatherDob] = useState<string>('');
  const [fatherDod, setFatherDod] = useState<string>('');
  const [fatherQualification, setFatherQualification] = useState<string>('');
  const [fatherProfession, setFatherProfession] = useState<string>('');
  const [fatherDistrict, setFatherDistrict] = useState<string>('');
  const [fatherTehsil, setFatherTehsil] = useState<string>('');
  const [fatherStreetNumber, setFatherStreetNumber] = useState<string>('');
  const [fatherHouseNumber, setFatherHouseNumber] = useState<string>('');
  const [fatherUcNumber, setFatherUcNumber] = useState<string>('');
  const [fatherAddress, setFatherAddress] = useState<string>('');

  // ================= 5. MOTHER INFO =================
  const [motherName, setMotherName] = useState<string>('');
  const [motherCnic, setMotherCnic] = useState<string>('');
  const [motherContact, setMotherContact] = useState<string>('');
  const [motherIsAlive, setMotherIsAlive] = useState<string>('');
  const [motherDob, setMotherDob] = useState<string>('');
  const [motherDod, setMotherDod] = useState<string>('');
  const [motherQualification, setMotherQualification] = useState<string>('');
  const [motherProfession, setMotherProfession] = useState<string>('');
  const [motherDistrict, setMotherDistrict] = useState<string>('');
  const [motherTehsil, setMotherTehsil] = useState<string>('');
  const [motherStreetNumber, setMotherStreetNumber] = useState<string>('');
  const [motherHouseNumber, setMotherHouseNumber] = useState<string>('');
  const [motherUcNumber, setMotherUcNumber] = useState<string>('');
  const [motherAddress, setMotherAddress] = useState<string>('');

  // ================= 6. GUARDIAN INFO =================
  const [guardianName, setGuardianName] = useState<string>('');
  const [guardianRelation, setGuardianRelation] = useState<string>('');
  const [guardianContact, setGuardianContact] = useState<string>('');
  const [guardianCnic, setGuardianCnic] = useState<string>('');
  const [guardianQualification, setGuardianQualification] = useState<string>('');
  const [guardianProfession, setGuardianProfession] = useState<string>('');
  const [guardianAddress, setGuardianAddress] = useState<string>('');

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
    setMeetingPersons((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
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
      institution: '',
      gradeClass: '',
      maritalStatus: '',
      district: '',
      tehsil: '',
      ucNumber: '',
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
        institution: '',
        gradeClass: '',
        maritalStatus: '',
        district: '',
        tehsil: '',
        ucNumber: '',
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
    setWitnesses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
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
  const [prescriptionPhotoFile, setPrescriptionPhotoFile] = useState<File | null>(null);

  // ================= 12. NEW REPORT SECTION =================
  const [reportCategory, setReportCategory] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [writtenReportFile, setWrittenReportFile] = useState<File | null>(null);

  // ================= 13. AREA OF INTEREST – CHILD =================
  const [areaOfInterest, setAreaOfInterest] = useState<string>('');

  // ================= 14. ATTACHMENTS =================
  const [attachments, setAttachments] = useState<Record<string, { file: File | null; title: string }>>({
    profilePic: { file: null, title: 'Profile Pic' },
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

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleAutoFillDemo = () => {
    setCategory('Orphan');
    setReplacedRegistrationNo('');

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
        category: {
          type: category || 'Orphan',
          replacedRegistrationNo: category === 'Replace' ? replacedRegistrationNo : null,
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
        fatherInfo: {
          name: fatherName,
          cnic: fatherCnic,
          contact: fatherContact,
          isAlive: fatherIsAlive,
          dob: fatherDob,
          dod: fatherIsAlive === 'No' ? fatherDod : null,
          qualification: fatherQualification,
          profession: fatherProfession,
          district: fatherDistrict,
          tehsil: fatherTehsil,
          streetNumber: fatherStreetNumber,
          houseNumber: fatherHouseNumber,
          ucNumber: fatherUcNumber,
          address: fatherAddress,
        },
        motherInfo: {
          name: motherName,
          cnic: motherCnic,
          contact: motherContact,
          isAlive: motherIsAlive,
          dob: motherDob,
          dod: motherIsAlive === 'No' ? motherDod : null,
          qualification: motherQualification,
          profession: motherProfession,
          district: motherDistrict,
          tehsil: motherTehsil,
          streetNumber: motherStreetNumber,
          houseNumber: motherHouseNumber,
          ucNumber: motherUcNumber,
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
        },
        meetingPersons,
        siblings,
        witnesses,
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
        },
        reports: {
          category: reportCategory,
          details: reportDetails,
        },
        areaOfInterest,
        attachmentsSummary: Object.keys(attachments).map((k) => ({
          slot: k,
          title: attachments[k].title,
          attached: !!attachments[k].file,
        })),
      };

      const payload = {
        id: `demo-${Date.now()}`,
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
        photo: photoUrl,
        status: status || 'ACTIVE',
        bloodGroup: bloodGroup || 'B+',
        allergies: 'None',
        chronicConditions: specialNeedDisease || 'None',
        heightCm: 135,
        weightKg: 30,
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

      // Try server API sync if available
      try {
        await fetch('/api/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (apiErr) {
        console.warn('Server API sync skipped in standalone demo mode:', apiErr);
      }

      setFormSuccess('Child enrolled into Pakistan Sweet Home Multan successfully!');
      setTimeout(() => {
        onSuccess(payload);
      }, 1000);
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err instanceof Error ? err.message : 'Network error during child admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
      {/* Top Banner with Auto-Fill Demo Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg">
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-900">Pakistan Sweet Home Official Admission Form</span> (14 Sections)
        </div>
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Auto-fill form with realistic demo child data"
        >
          <span>⚡ Auto-Fill Demo Data</span>
        </button>
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
        <SectionHeading title="Category" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          <FormSelect
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              'Orphan',
              'Divorce',
              'Posthumous',
              'Poorest of the Poor',
              'Replace',
              'New Enrollment',
            ]}
          />

          {category === 'Replace' ? (
            <FormInput
              placeholder="Registration Number"
              value={replacedRegistrationNo}
              onChange={(e) => setReplacedRegistrationNo(e.target.value)}
              required
            />
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* ================= 2. BASIC INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading title="Basic Info" />
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
            onChange={(e) => setBFormNo(e.target.value)}
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
      </div>

      {/* ================= 3. HEALTH INFO ================= */}
      <div>
        <SectionHeading title="Health Info" />
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

      {/* ================= 4. FATHER INFO ================= */}
      <div>
        <SectionHeading title="Father Info" />
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
            onChange={(e) => setFatherCnic(e.target.value)}
          />
          <FormInput
            placeholder="Father Contact"
            value={fatherContact}
            onChange={(e) => setFatherContact(e.target.value)}
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
          {fatherIsAlive === 'No' ? (
            <FormInput
              label="Date of Death"
              type="date"
              value={fatherDod}
              onChange={(e) => setFatherDod(e.target.value)}
            />
          ) : (
            <div />
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
            placeholder="Union Council Number"
            value={fatherUcNumber}
            onChange={(e) => setFatherUcNumber(e.target.value)}
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

      {/* ================= 5. MOTHER INFO ================= */}
      <div>
        <SectionHeading title="Mother Info" />
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
            onChange={(e) => setMotherCnic(e.target.value)}
          />
          <FormInput
            placeholder="Mother Contact"
            value={motherContact}
            onChange={(e) => setMotherContact(e.target.value)}
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
          {motherIsAlive === 'No' ? (
            <FormInput
              label="Date of Death"
              type="date"
              value={motherDod}
              onChange={(e) => setMotherDod(e.target.value)}
            />
          ) : (
            <div />
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
            placeholder="Union Council Number"
            value={motherUcNumber}
            onChange={(e) => setMotherUcNumber(e.target.value)}
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

      {/* ================= 6. GUARDIAN INFO ================= */}
      <div>
        <SectionHeading title="Guardian Info" />
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
            placeholder="Guardian Contact"
            value={guardianContact}
            onChange={(e) => setGuardianContact(e.target.value)}
          />

          {/* Row 2 */}
          <FormInput
            placeholder="Guardian CNIC"
            value={guardianCnic}
            onChange={(e) => setGuardianCnic(e.target.value)}
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
          <FormInput
            placeholder="Address"
            value={guardianAddress}
            onChange={(e) => setGuardianAddress(e.target.value)}
            className="md:col-span-3"
          />
        </div>
      </div>

      {/* ================= 7. MEETING PERSON INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading title="Meeting Person Info" />
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
                  placeholder="Contact"
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
                  placeholder="Union Council Number"
                  value={p.ucNumber}
                  onChange={(e) => updateMeetingPerson(p.id, 'ucNumber', e.target.value)}
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

      {/* ================= 8. SIBLINGS INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading title="Siblings Info" />
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
                {/* Row 1 */}
                <FormInput
                  placeholder="Sibling Name"
                  value={s.name}
                  onChange={(e) => updateSibling(s.id, 'name', e.target.value)}
                />
                <FormSelect
                  label="Gender"
                  value={s.gender}
                  onChange={(e) => updateSibling(s.id, 'gender', e.target.value)}
                  options={['Male', 'Female', 'Other']}
                />
                <FormInput
                  placeholder="Age"
                  value={s.age}
                  onChange={(e) => updateSibling(s.id, 'age', e.target.value)}
                />

                {/* Row 2 */}
                <FormInput
                  placeholder="Qualification"
                  value={s.qualification}
                  onChange={(e) => updateSibling(s.id, 'qualification', e.target.value)}
                />
                <FormInput
                  placeholder="Institution"
                  value={s.institution}
                  onChange={(e) => updateSibling(s.id, 'institution', e.target.value)}
                />
                <FormInput
                  placeholder="Grade / Class"
                  value={s.gradeClass}
                  onChange={(e) => updateSibling(s.id, 'gradeClass', e.target.value)}
                />

                {/* Row 3 */}
                <FormSelect
                  label="Marital Status"
                  value={s.maritalStatus}
                  onChange={(e) => updateSibling(s.id, 'maritalStatus', e.target.value)}
                  options={['Single', 'Married', 'Divorced', 'Widow']}
                />
                <FormInput
                  placeholder="District"
                  value={s.district}
                  onChange={(e) => updateSibling(s.id, 'district', e.target.value)}
                />
                <FormInput
                  placeholder="Tehsil"
                  value={s.tehsil}
                  onChange={(e) => updateSibling(s.id, 'tehsil', e.target.value)}
                />

                {/* Row 4 */}
                <FormInput
                  placeholder="Union Council Number"
                  value={s.ucNumber}
                  onChange={(e) => updateSibling(s.id, 'ucNumber', e.target.value)}
                />
                <FormInput
                  placeholder="Street Number"
                  value={s.streetNumber}
                  onChange={(e) => updateSibling(s.id, 'streetNumber', e.target.value)}
                />
                <FormInput
                  placeholder="House Number"
                  value={s.houseNumber}
                  onChange={(e) => updateSibling(s.id, 'houseNumber', e.target.value)}
                />

                {/* Row 5 */}
                <FormInput
                  placeholder="Address"
                  value={s.address}
                  onChange={(e) => updateSibling(s.id, 'address', e.target.value)}
                  className="md:col-span-3"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 9. WITNESS INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading title="Witness Info" />
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
                  placeholder="Contact"
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

                {/* Row 3 */}
                <FormInput
                  placeholder="Address"
                  value={w.address}
                  onChange={(e) => updateWitness(w.id, 'address', e.target.value)}
                  className="md:col-span-3"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 10. RESULT INFO ================= */}
      <div>
        <SectionHeading title="Result Info" />
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

      {/* ================= 11. NEW HEALTH SECTION ================= */}
      <div>
        <SectionHeading title="Health" />
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

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Prescription Photo Upload
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Choose Prescription File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setPrescriptionPhotoFile(e.target.files?.[0] || null)}
                />
              </label>
              {prescriptionPhotoFile ? (
                <span className="text-xs text-emerald-700 font-semibold truncate max-w-xs">
                  {prescriptionPhotoFile.name}
                </span>
              ) : (
                <span className="text-xs text-slate-400">No file chosen</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 12. NEW REPORT SECTION ================= */}
      <div>
        <SectionHeading title="Report" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 mb-3.5">
          <FormSelect
            label="Report Category"
            value={reportCategory}
            onChange={(e) => setReportCategory(e.target.value)}
            options={['Discipline', 'Behavior', 'Academic', 'Islamic']}
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
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Written Report Upload
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Choose Written Report File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setWrittenReportFile(e.target.files?.[0] || null)}
                />
              </label>
              {writtenReportFile ? (
                <span className="text-xs text-emerald-700 font-semibold truncate max-w-xs">
                  {writtenReportFile.name}
                </span>
              ) : (
                <span className="text-xs text-slate-400">No file chosen</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 13. AREA OF INTEREST – CHILD ================= */}
      <div>
        <SectionHeading title="Area of Interest – Child" />
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

      {/* ================= 14. ATTACHMENTS (FINAL SECTION) ================= */}
      <div>
        <SectionHeading title="Attachments" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {Object.entries(attachments).map(([key, item]) => (
            <div key={key} className="p-3 border border-slate-700 rounded-lg bg-white flex flex-col justify-between gap-2">
              <span className="text-xs font-medium text-slate-800">{item.title}</span>

              <div className="flex items-center justify-between pt-1">
                {item.file ? (
                  <span className="text-xs text-emerald-700 font-semibold truncate max-w-[140px]">
                    {item.file.name}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">No file chosen</span>
                )}

                <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium cursor-pointer transition-colors shrink-0">
                  <span>Browse</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleAttachmentUpload(key, e.target.files?.[0] || null)}
                  />
                </label>
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
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#0D5C3A] hover:bg-[#0b4d30] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
