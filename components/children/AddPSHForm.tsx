'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Sparkles,
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
  addressType?: string;
  postOffice?: string;
  colony?: string;
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
  addressType?: string;
  postOffice?: string;
  colony?: string;
  district: string;
  tehsil: string;
  ucNumber: string;
  ucName?: string;
  streetNumber: string;
  houseNumber: string;
  address: string;
  marriedAddressType?: string;
  marriedPostOffice?: string;
  marriedColony?: string;
  marriedDistrict?: string;
  marriedTehsil?: string;
  marriedUcNumber?: string;
  marriedUcName?: string;
  marriedStreetNumber?: string;
  marriedHouseNumber?: string;
  marriedAddress?: string;
}

interface FollowUpRecord {
  id: string;
  name: string;
  className: string;
  instituteName: string;
  passedFrom: string;
  boardRegistrationNumber: string;
  rollNumber: string;
  passingYear: string;
  totalMarks: string;
  obtainedMarks: string;
  pshRegistrationNumber: string;
  passedFromPsh: string;
}

const createEmptyFollowUp = (): FollowUpRecord => ({
  id: '',
  name: '',
  className: '',
  instituteName: '',
  passedFrom: '',
  boardRegistrationNumber: '',
  rollNumber: '',
  passingYear: '',
  totalMarks: '',
  obtainedMarks: '',
  pshRegistrationNumber: '',
  passedFromPsh: '',
});

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
  addressType?: string;
  postOffice?: string;
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
  addressType?: string;
  postOffice?: string;
  colony?: string;
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

type AddressRecord = {
  addressType: string;
  postOffice: string;
  colony: string;
  district: string;
  tehsil: string;
  ucNumber: string;
  ucName: string;
  streetNumber: string;
  houseNumber: string;
  address: string;
};

type AddressComponentField = keyof Omit<AddressRecord, 'address'>;

const addressComponentFields = new Set<string>([
  'addressType',
  'postOffice',
  'colony',
  'district',
  'tehsil',
  'ucNumber',
  'ucName',
  'streetNumber',
  'houseNumber',
]);

const composeAddress = (parts: Array<string | null | undefined>) =>
  parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part)).join(', ');

const composeLocationAddress = (location: Partial<AddressRecord>) => composeAddress([
  location.addressType,
  location.addressType === 'Village' ? location.postOffice : location.colony,
  location.district,
  location.tehsil,
  location.ucNumber,
  location.ucName,
  location.streetNumber,
  location.houseNumber,
]);

function AddressFields({
  values,
  onChange,
  addressLabel = 'Full Address',
  typeLabel = 'Address Type',
  disabled = false,
}: {
  values: AddressRecord;
  onChange: (field: keyof AddressRecord, value: string) => void;
  addressLabel?: string;
  typeLabel?: string;
  disabled?: boolean;
}) {
  return (
    <>
      <FormSelect
        label={typeLabel}
        value={values.addressType}
        onChange={(event) => onChange('addressType', event.target.value)}
        options={['City', 'Village']}
        disabled={disabled}
      />
      {values.addressType === 'Village' ? (
        <FormInput
          label="Post Office"
          value={values.postOffice}
          onChange={(event) => onChange('postOffice', event.target.value)}
          disabled={disabled}
        />
      ) : values.addressType === 'City' ? (
        <FormInput
          label="Colony"
          value={values.colony}
          onChange={(event) => onChange('colony', event.target.value)}
          disabled={disabled}
        />
      ) : <div />}
      <FormInput label="District" value={values.district} onChange={(event) => onChange('district', event.target.value)} disabled={disabled} />
      <FormInput label="Tehsil" value={values.tehsil} onChange={(event) => onChange('tehsil', event.target.value)} disabled={disabled} />
      <FormInput label="Union Council No." value={values.ucNumber} onChange={(event) => onChange('ucNumber', event.target.value)} disabled={disabled} />
      <FormInput label="Union Council Name" value={values.ucName} onChange={(event) => onChange('ucName', event.target.value)} disabled={disabled} />
      <FormInput label="Street No." value={values.streetNumber} onChange={(event) => onChange('streetNumber', event.target.value)} disabled={disabled} />
      <FormInput label="House No." value={values.houseNumber} onChange={(event) => onChange('houseNumber', event.target.value)} disabled={disabled} />
      <FormInput
        label={addressLabel}
        value={values.address}
        onChange={(event) => onChange('address', event.target.value)}
        className="md:col-span-3"
      />
    </>
  );
}

interface AppearanceMeasurement {
  id: string;
  height: string;
  weight: string;
  age: string;
}

interface HealthCareEntry {
  id: string;
  checkFrequency: string;
  medicineDetails: string;
  antibioticMedicine: string;
  doctorName: string;
  hospitalName: string;
  doctorContactNo: string;
  hospitalType: string;
}

interface ReportEntry {
  id: string;
  category: string;
  details: string;
}

interface AreaOfInterestEntry {
  id: string;
  details: string;
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
  isBold = true,
}: {
  title: string;
  step?: number;
  isCompleted?: boolean;
  isBold?: boolean;
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
      <h3 className={`text-slate-900 ${isBold ? 'font-bold' : 'font-normal'} text-sm sm:text-base tracking-tight`}>
        {typeof step === 'number' ? `${step}. ${title}` : title}
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
  const [appearanceMeasurements, setAppearanceMeasurements] = useState<AppearanceMeasurement[]>([
    { id: '1', height: '', weight: '', age: '' },
  ]);

  const addAppearanceMeasurement = () => {
    setAppearanceMeasurements((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, height: '', weight: '', age: '' },
    ]);
  };

  const updateAppearanceMeasurement = (
    id: string,
    field: keyof Omit<AppearanceMeasurement, 'id'>,
    value: string
  ) => {
    setAppearanceMeasurements((current) =>
      current.map((measurement) =>
        measurement.id === id ? { ...measurement, [field]: value } : measurement
      )
    );
  };

  const removeAppearanceMeasurement = (id: string) => {
    setAppearanceMeasurements((current) =>
      current.length > 1 ? current.filter((measurement) => measurement.id !== id) : current
    );
  };

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
  const [fatherAddressType, setFatherAddressType] = useState('');
  const [fatherPostOffice, setFatherPostOffice] = useState('');
  const [fatherColony, setFatherColony] = useState('');
  const [fatherDistrict, setFatherDistrict] = useState<string>('');
  const [fatherTehsil, setFatherTehsil] = useState<string>('');
  const [fatherStreetNumber, setFatherStreetNumber] = useState<string>('');
  const [fatherHouseNumber, setFatherHouseNumber] = useState<string>('');
  const [fatherUcNumber, setFatherUcNumber] = useState<string>('');
  const [fatherUcName, setFatherUcName] = useState<string>('');
  const [fatherAddress, setFatherAddress] = useState<string>('');

  const updateParentAddressPart = (
    parent: 'father' | 'mother',
    field: AddressComponentField,
    value: string
  ) => {
    if (parent === 'father') {
      const parts = {
        addressType: fatherAddressType,
        postOffice: fatherPostOffice,
        colony: fatherColony,
        district: fatherDistrict,
        tehsil: fatherTehsil,
        ucNumber: fatherUcNumber,
        ucName: fatherUcName,
        streetNumber: fatherStreetNumber,
        houseNumber: fatherHouseNumber,
        [field]: value,
      };
      if (field === 'addressType') setFatherAddressType(value);
      if (field === 'postOffice') setFatherPostOffice(value);
      if (field === 'colony') setFatherColony(value);
      if (field === 'district') setFatherDistrict(value);
      if (field === 'tehsil') setFatherTehsil(value);
      if (field === 'ucNumber') setFatherUcNumber(value);
      if (field === 'ucName') setFatherUcName(value);
      if (field === 'streetNumber') setFatherStreetNumber(value);
      if (field === 'houseNumber') setFatherHouseNumber(value);
      setFatherAddress(composeLocationAddress(parts));
      return;
    }

    const parts = {
      addressType: motherAddressType,
      postOffice: motherPostOffice,
      colony: motherColony,
      district: motherDistrict,
      tehsil: motherTehsil,
      ucNumber: motherUcNumber,
      ucName: motherUcName,
      streetNumber: motherStreetNumber,
      houseNumber: motherHouseNumber,
      [field]: value,
    };
    if (field === 'addressType') setMotherAddressType(value);
    if (field === 'postOffice') setMotherPostOffice(value);
    if (field === 'colony') setMotherColony(value);
    if (field === 'district') setMotherDistrict(value);
    if (field === 'tehsil') setMotherTehsil(value);
    if (field === 'ucNumber') setMotherUcNumber(value);
    if (field === 'ucName') setMotherUcName(value);
    if (field === 'streetNumber') setMotherStreetNumber(value);
    if (field === 'houseNumber') setMotherHouseNumber(value);
    setMotherAddress(composeLocationAddress(parts));
  };

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
  const [motherAddressType, setMotherAddressType] = useState('');
  const [motherPostOffice, setMotherPostOffice] = useState('');
  const [motherColony, setMotherColony] = useState('');
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

  const updatePermanentGuardianAddressPart = (
    field: AddressComponentField,
    value: string
  ) => {
    const parts = {
      addressType: guardianAddressType,
      postOffice: guardianPostOffice,
      colony: guardianColony,
      district: guardianDistrict,
      tehsil: guardianTehsil,
      ucNumber: guardianUcNumber,
      ucName: guardianUcName,
      streetNumber: guardianStreetNumber,
      houseNumber: guardianHouseNumber,
      [field]: value,
    };
    if (field === 'addressType') setGuardianAddressType(value);
    if (field === 'postOffice') setGuardianPostOffice(value);
    if (field === 'colony') setGuardianColony(value);
    if (field === 'district') setGuardianDistrict(value);
    if (field === 'tehsil') setGuardianTehsil(value);
    if (field === 'ucNumber') setGuardianUcNumber(value);
    if (field === 'ucName') setGuardianUcName(value);
    if (field === 'streetNumber') setGuardianStreetNumber(value);
    if (field === 'houseNumber') setGuardianHouseNumber(value);
    setGuardianAddress(composeLocationAddress(parts));
  };

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
    setCurrentGuardianAddress((current) => {
      const updated = { ...current, [field]: value };
      if (field === 'address') return updated;
      return {
        ...updated,
        address: composeLocationAddress(updated),
      };
    });
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
        addressType: '',
        postOffice: '',
        colony: '',
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
    setAdditionalGuardians((current) => current.map((guardian) => {
      if (guardian.id !== id) return guardian;
      const updated = { ...guardian, [field]: formattedValue };
      return addressComponentFields.has(field)
        ? { ...updated, address: composeLocationAddress(updated) }
        : updated;
    }));
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
      addressType: '',
      postOffice: '',
      colony: '',
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
        addressType: '',
        postOffice: '',
        colony: '',
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
    setMeetingPersons((prev) => prev.map((person) => {
      if (person.id !== id) return person;
      const updated = { ...person, [field]: formattedVal };
      return addressComponentFields.has(field)
        ? { ...updated, address: composeLocationAddress(updated) }
        : updated;
    }));
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
      addressType: '',
      postOffice: '',
      colony: '',
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
        addressType: '',
        postOffice: '',
        colony: '',
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
    setSiblings((prev) => prev.map((sibling) => {
      if (sibling.id !== id) return sibling;
      const updated = { ...sibling, [field]: value };
      return addressComponentFields.has(field)
        ? { ...updated, address: composeLocationAddress(updated) }
        : updated;
    }));
  };

  const updateMarriedSiblingAddress = (id: string, field: keyof AddressRecord, value: string) => {
    const marriedFieldByAddressField: Record<keyof AddressRecord, keyof SiblingRecord> = {
      addressType: 'marriedAddressType',
      postOffice: 'marriedPostOffice',
      colony: 'marriedColony',
      district: 'marriedDistrict',
      tehsil: 'marriedTehsil',
      ucNumber: 'marriedUcNumber',
      ucName: 'marriedUcName',
      streetNumber: 'marriedStreetNumber',
      houseNumber: 'marriedHouseNumber',
      address: 'marriedAddress',
    };

    setSiblings((prev) => prev.map((sibling) => {
      if (sibling.id !== id) return sibling;
      const updated = { ...sibling, [marriedFieldByAddressField[field]]: value };
      if (!addressComponentFields.has(field)) return updated;

      return {
        ...updated,
        marriedAddress: composeLocationAddress({
          addressType: updated.marriedAddressType || '',
          postOffice: updated.marriedPostOffice || '',
          colony: updated.marriedColony || '',
          district: updated.marriedDistrict || '',
          tehsil: updated.marriedTehsil || '',
          ucNumber: updated.marriedUcNumber || '',
          ucName: updated.marriedUcName || '',
          streetNumber: updated.marriedStreetNumber || '',
          houseNumber: updated.marriedHouseNumber || '',
        }),
      };
    }));
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
      addressType: '',
      postOffice: '',
      colony: '',
      district: '',
      tehsil: '',
      ucNumber: '',
      ucName: '',
      streetNumber: '',
      houseNumber: '',
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
        addressType: '',
        postOffice: '',
        colony: '',
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

  const removeWitness = (id: string) => {
    if (witnesses.length <= 1) return;
    setWitnesses((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWitness = (id: string, field: keyof WitnessRecord, value: string) => {
    let formattedVal = value;
    if (field === 'cnic') formattedVal = formatCNIC(value);
    if (field === 'contact') formattedVal = formatPhone(value);
    setWitnesses((prev) => prev.map((witness) => {
      if (witness.id !== id) return witness;
      const updated = { ...witness, [field]: formattedVal };
      return addressComponentFields.has(field)
        ? { ...updated, address: composeLocationAddress(updated) }
        : updated;
    }));
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
  const [additionalHealthCareEntries, setAdditionalHealthCareEntries] = useState<HealthCareEntry[]>([]);

  const addHealthCareEntry = () => {
    setAdditionalHealthCareEntries((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        checkFrequency: '',
        medicineDetails: '',
        antibioticMedicine: '',
        doctorName: '',
        hospitalName: '',
        doctorContactNo: '',
        hospitalType: '',
      },
    ]);
  };

  const updateHealthCareEntry = (id: string, field: keyof Omit<HealthCareEntry, 'id'>, value: string) => {
    setAdditionalHealthCareEntries((current) =>
      current.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry)
    );
  };

  // ================= 12. NEW REPORT SECTION =================
  const [reportCategory, setReportCategory] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [writtenReportFile, setWrittenReportFile] = useState<File | null>(null);
  const [additionalReportEntries, setAdditionalReportEntries] = useState<ReportEntry[]>([]);

  const addReportEntry = () => {
    setAdditionalReportEntries((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, category: '', details: '' },
    ]);
  };

  const updateReportEntry = (id: string, field: keyof Omit<ReportEntry, 'id'>, value: string) => {
    setAdditionalReportEntries((current) =>
      current.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry)
    );
  };

  // ================= 13. AREA OF INTEREST – CHILD =================
  const [areaOfInterest, setAreaOfInterest] = useState<string>('');
  const [additionalAreaOfInterestEntries, setAdditionalAreaOfInterestEntries] = useState<AreaOfInterestEntry[]>([]);

  const addAreaOfInterestEntry = () => {
    setAdditionalAreaOfInterestEntries((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, details: '' },
    ]);
  };

  const updateAreaOfInterestEntry = (id: string, details: string) => {
    setAdditionalAreaOfInterestEntries((current) =>
      current.map((entry) => entry.id === id ? { ...entry, details } : entry)
    );
  };

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
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);
  const [followUpDraft, setFollowUpDraft] = useState<FollowUpRecord>(createEmptyFollowUp());
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const openFollowUpForm = () => {
    setFollowUpDraft({
      ...createEmptyFollowUp(),
      name: fullName,
      className: resultClass,
      instituteName: resultSchool,
    });
    setFollowUpError(null);
    setIsFollowUpOpen(true);
  };

  const saveFollowUpDraft = () => {
    if (!followUpDraft.name.trim()) {
      setFollowUpError('Enter the student name before adding this follow-up.');
      return;
    }

    setFollowUpRecords((current) => [
      ...current,
      { ...followUpDraft, id: Date.now().toString() },
    ]);
    setIsFollowUpOpen(false);
    setFollowUpError(null);
    setFollowUpDraft(createEmptyFollowUp());
  };

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
    if (
      checkFrequency || medicineDetails || antibioticMedicine || doctorName || hospitalName || doctorContactNo || hospitalType ||
      additionalHealthCareEntries.some((entry) => Object.values(entry).some((value) => value.trim()))
    ) filled++;
    // 13. Report
    if (reportCategory || reportDetails || additionalReportEntries.some((entry) => entry.category || entry.details)) filled++;
    // 14. Area of Interest
    if (areaOfInterest.trim() || additionalAreaOfInterestEntries.some((entry) => entry.details.trim())) filled++;
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
      isHealthCareComplete: !!(
        checkFrequency || medicineDetails || antibioticMedicine || doctorName || hospitalName || doctorContactNo || hospitalType ||
        additionalHealthCareEntries.some((entry) => Object.values(entry).some((value) => value.trim()))
      ),
      isReportComplete: !!(reportCategory || reportDetails || additionalReportEntries.some((entry) => entry.category || entry.details)),
      isInterestComplete: !!(areaOfInterest.trim() || additionalAreaOfInterestEntries.some((entry) => entry.details.trim())),
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
    antibioticMedicine,
    additionalHealthCareEntries,
    reportCategory,
    reportDetails,
    additionalReportEntries,
    areaOfInterest,
    additionalAreaOfInterestEntries,
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
      setFollowUpRecords(
        Array.isArray(psh?.followUps)
          ? psh.followUps.map((record: Partial<FollowUpRecord>, index: number) => ({
              ...createEmptyFollowUp(),
              ...record,
              id: record.id || `saved-${index}`,
            }))
          : []
      );

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
      setAppearanceMeasurements([{ id: '1', height: '', weight: '', age: '' }]);
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
          const savedMeasurements = Array.isArray(psh.appearance.measurements)
            ? psh.appearance.measurements
            : [psh.appearance];
          setAppearanceMeasurements(
            savedMeasurements.length > 0
              ? savedMeasurements.map((measurement: any, index: number) => ({
                  id: typeof measurement.id === 'string' ? measurement.id : `saved-${index}`,
                  height: measurement.height === null || measurement.height === undefined ? '' : String(measurement.height),
                  weight: measurement.weight === null || measurement.weight === undefined ? '' : String(measurement.weight),
                  age: measurement.age === null || measurement.age === undefined ? '' : String(measurement.age),
                }))
              : [{ id: '1', height: '', weight: '', age: '' }]
          );
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
          setFatherAddressType(psh.fatherInfo.addressType || '');
          setFatherPostOffice(psh.fatherInfo.postOffice || '');
          setFatherColony(psh.fatherInfo.colony || '');
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
          setMotherAddressType(psh.motherInfo.addressType || '');
          setMotherPostOffice(psh.motherInfo.postOffice || '');
          setMotherColony(psh.motherInfo.colony || '');
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
                addressType: guardian.addressType || '',
                postOffice: guardian.postOffice || '',
                colony: guardian.colony || '',
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
            addressType: person.addressType || '',
            postOffice: person.postOffice || '',
            colony: person.colony || '',
            district: person.district || '',
            tehsil: person.tehsil || '',
            ucNumber: person.ucNumber || '',
            ucName: person.ucName || '',
            streetNumber: person.streetNumber || '',
            houseNumber: person.houseNumber || '',
            address: person.address || '',
          })));
        }
        if (Array.isArray(psh.siblings) && psh.siblings.length > 0) {
          setSiblings(psh.siblings.map((sibling: SiblingRecord, index: number) => ({
            ...sibling,
            id: sibling.id || `saved-${index}`,
            profession: sibling.profession || '',
            addressType: sibling.addressType || '',
            postOffice: sibling.postOffice || '',
            colony: sibling.colony || '',
            district: sibling.district || '',
            tehsil: sibling.tehsil || '',
            ucNumber: sibling.ucNumber || '',
            ucName: sibling.ucName || '',
            streetNumber: sibling.streetNumber || '',
            houseNumber: sibling.houseNumber || '',
            address: sibling.address || '',
          })));
        }
        if (Array.isArray(psh.witnesses) && psh.witnesses.length > 0) {
          setWitnesses(psh.witnesses.map((w: WitnessRecord) => ({
            ...w,
            addressType: w.addressType || '',
            postOffice: w.postOffice || '',
            colony: w.colony || '',
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
          setAdditionalHealthCareEntries(
            Array.isArray(psh.healthCare.additionalEntries)
              ? psh.healthCare.additionalEntries.map((entry: Partial<HealthCareEntry>, index: number) => ({
                  id: entry.id || `saved-health-${index}`,
                  checkFrequency: entry.checkFrequency || '',
                  medicineDetails: entry.medicineDetails || '',
                  antibioticMedicine: entry.antibioticMedicine || '',
                  doctorName: entry.doctorName || '',
                  hospitalName: entry.hospitalName || '',
                  doctorContactNo: entry.doctorContactNo || '',
                  hospitalType: entry.hospitalType || '',
                }))
              : []
          );
        }

        if (psh.reports) {
          setReportCategory(psh.reports.category || '');
          setReportDetails(psh.reports.details || '');
          setAdditionalReportEntries(
            Array.isArray(psh.reports.additionalEntries)
              ? psh.reports.additionalEntries.map((entry: Partial<ReportEntry>, index: number) => ({
                  id: entry.id || `saved-report-${index}`,
                  category: entry.category || '',
                  details: entry.details || '',
                }))
              : []
          );
        }

        setAreaOfInterest(psh.areaOfInterest || '');
        setAdditionalAreaOfInterestEntries(
          Array.isArray(psh.areaOfInterestEntries)
            ? psh.areaOfInterestEntries.map((entry: Partial<AreaOfInterestEntry>, index: number) => ({
                id: entry.id || `saved-interest-${index}`,
                details: entry.details || '',
              }))
            : []
        );
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
    setAppearanceMeasurements([{ id: '1', height: '', weight: '', age: '' }]);
    setFatherName('');
    setFatherCnic('');
    setFatherContact('');
    setFatherIsAlive('');
    setFatherDob('');
    setFatherDod('');
    setFatherCauseOfDeath('');
    setFatherQualification('');
    setFatherProfession('');
    setFatherAddressType('');
    setFatherPostOffice('');
    setFatherColony('');
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
    setMotherAddressType('');
    setMotherPostOffice('');
    setMotherColony('');
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
    setMeetingPersons([{ id: '1', name: '', relation: '', cnic: '', contact: '', qualification: '', profession: '', dateTime: '', startDateTime: '', endDateTime: '', addressType: '', postOffice: '', colony: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setSiblings([{ id: '1', name: '', gender: '', age: '', qualification: '', profession: '', institution: '', gradeClass: '', maritalStatus: '', addressType: '', postOffice: '', colony: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setWitnesses([{ id: '1', name: '', cnic: '', fatherName: '', contact: '', qualification: '', profession: '', addressType: '', postOffice: '', colony: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setResultSchool('');
    setResultClass('');
    setResultExamDate('');
    setResultExamType('');
    setResultPassingScore('');
    setFollowUpRecords([]);
    setFollowUpDraft(createEmptyFollowUp());
    setIsFollowUpOpen(false);
    setFollowUpError(null);
    setSubjectResults([{ id: '1', subject: '', obtainedMarks: '', totalMarks: '' }]);
    setCheckFrequency('');
    setMedicineDetails('');
    setAntibioticMedicine('');
    setDoctorName('');
    setHospitalName('');
    setDoctorContactNo('');
    setHospitalType('');
    setAdditionalHealthCareEntries([]);
    setReportCategory('');
    setReportDetails('');
    setAdditionalReportEntries([]);
    setAreaOfInterest('');
    setAdditionalAreaOfInterestEntries([]);
  };

  const handleAutoFillDemo = (profileType: 'orphan' | 'poor' | 'replace' | 'posthumous' = 'orphan') => {
    setAdditionalHealthCareEntries([]);
    setAdditionalReportEntries([]);
    setAdditionalAreaOfInterestEntries([]);

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

      const savedAppearanceMeasurements = appearanceMeasurements
        .filter((measurement) => measurement.height || measurement.weight || measurement.age)
        .map(({ id, ...measurement }) => ({ id, ...measurement }));
      const latestAppearanceMeasurement = savedAppearanceMeasurements[savedAppearanceMeasurements.length - 1] || {
        height: '',
        weight: '',
        age: '',
      };

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
          ...latestAppearanceMeasurement,
          measurements: savedAppearanceMeasurements,
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
          addressType: fatherAddressType,
          postOffice: fatherPostOffice,
          colony: fatherColony,
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
          addressType: motherAddressType,
          postOffice: motherPostOffice,
          colony: motherColony,
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
        followUps: followUpRecords,
        healthCare: {
          checkFrequency,
          medicineDetails,
          antibioticMedicine,
          doctorName,
          hospitalName,
          doctorContactNo: doctorContactNo.trim() || null,
          hospitalType,
          additionalEntries: additionalHealthCareEntries
            .filter((entry) => Object.entries(entry).some(([key, value]) => key !== 'id' && Boolean(value.trim())))
            .map(({ id: _id, ...entry }) => entry),
        },
        reports: {
          category: reportCategory,
          details: reportDetails,
          additionalEntries: additionalReportEntries
            .filter((entry) => Boolean(entry.category || entry.details.trim()))
            .map(({ id: _id, ...entry }) => entry),
        },
        areaOfInterest,
        areaOfInterestEntries: additionalAreaOfInterestEntries
          .filter((entry) => Boolean(entry.details.trim()))
          .map(({ id: _id, ...entry }) => entry),
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
        height: latestAppearanceMeasurement.height || null,
        weight: latestAppearanceMeasurement.weight || null,
        age: latestAppearanceMeasurement.age || null,
        heightCm: latestAppearanceMeasurement.height.trim() && Number.isFinite(Number(latestAppearanceMeasurement.height))
          ? Number(latestAppearanceMeasurement.height)
          : 135,
        weightKg: latestAppearanceMeasurement.weight.trim() && Number.isFinite(Number(latestAppearanceMeasurement.weight))
          ? Number(latestAppearanceMeasurement.weight)
          : 30,
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
        <SectionHeading step={1} title="Category" isCompleted={completionStats.isCat1Complete} />
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
        <SectionHeading step={2} title="Enrollment Type" isCompleted={completionStats.isCat2Complete} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
          <FormSelect
            label="Enrollment Type"
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
          <SectionHeading step={3} title="Basic Info" isCompleted={completionStats.isBasicComplete} />
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
        <SectionHeading step={4} title="Health Info" isCompleted={completionStats.isHealthComplete} />
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
        <div className="flex items-center justify-between gap-3">
          <SectionHeading title="Appearance" isBold={false} />
          <button
            type="button"
            onClick={addAppearanceMeasurement}
            className="mb-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
        <div className="space-y-3">
          {appearanceMeasurements.map((measurement, index) => (
            <div key={measurement.id} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">Appearance Entry {index + 1}</span>
                {appearanceMeasurements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAppearanceMeasurement(measurement.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    aria-label={`Remove appearance entry ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-3">
                <FormInput
                  label="Height"
                  name={`height-${measurement.id}`}
                  type="number"
                  min={0}
                  step="any"
                  value={measurement.height}
                  onChange={(e) => updateAppearanceMeasurement(measurement.id, 'height', e.target.value)}
                />
                <FormInput
                  label="Weight"
                  name={`weight-${measurement.id}`}
                  type="number"
                  min={0}
                  step="any"
                  value={measurement.weight}
                  onChange={(e) => updateAppearanceMeasurement(measurement.id, 'weight', e.target.value)}
                />
                <FormInput
                  label="Age"
                  name={`age-${measurement.id}`}
                  type="number"
                  min={0}
                  step="1"
                  value={measurement.age}
                  onChange={(e) => updateAppearanceMeasurement(measurement.id, 'age', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 5. FATHER INFO ================= */}
      <div>
        <SectionHeading step={5} title="Father Info" isCompleted={completionStats.isFatherComplete} />
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
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 border-t border-slate-200 pt-4">
            <AddressFields
              values={{
                addressType: fatherAddressType,
                postOffice: fatherPostOffice,
                colony: fatherColony,
                district: fatherDistrict,
                tehsil: fatherTehsil,
                ucNumber: fatherUcNumber,
                ucName: fatherUcName,
                streetNumber: fatherStreetNumber,
                houseNumber: fatherHouseNumber,
                address: fatherAddress,
              }}
              onChange={(field, value) => {
                if (field === 'address') setFatherAddress(value);
                else updateParentAddressPart('father', field, value);
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= 6. MOTHER INFO ================= */}
      <div>
        <SectionHeading step={6} title="Mother Info" isCompleted={completionStats.isMotherComplete} />
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
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 border-t border-slate-200 pt-4">
            <AddressFields
              values={{
                addressType: motherAddressType,
                postOffice: motherPostOffice,
                colony: motherColony,
                district: motherDistrict,
                tehsil: motherTehsil,
                ucNumber: motherUcNumber,
                ucName: motherUcName,
                streetNumber: motherStreetNumber,
                houseNumber: motherHouseNumber,
                address: motherAddress,
              }}
              onChange={(field, value) => {
                if (field === 'address') setMotherAddress(value);
                else updateParentAddressPart('mother', field, value);
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= 5. SIBLINGS INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={7} title="Siblings Info" isCompleted={completionStats.isSiblingComplete} />
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
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 border-t border-slate-200 pt-4">
                  <AddressFields
                    values={{
                      addressType: s.addressType || '',
                      postOffice: s.postOffice || '',
                      colony: s.colony || '',
                      district: s.district,
                      tehsil: s.tehsil,
                      ucNumber: s.ucNumber,
                      ucName: s.ucName || '',
                      streetNumber: s.streetNumber,
                      houseNumber: s.houseNumber,
                      address: s.address,
                    }}
                    onChange={(field, value) => updateSibling(s.id, field, value)}
                  />
                </div>
                {s.maritalStatus === 'Married' && (
                  <div className="md:col-span-3 border-t border-slate-200 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">Address After Marriage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
                      <AddressFields
                        values={{
                          addressType: s.marriedAddressType || '',
                          postOffice: s.marriedPostOffice || '',
                          colony: s.marriedColony || '',
                          district: s.marriedDistrict || '',
                          tehsil: s.marriedTehsil || '',
                          ucNumber: s.marriedUcNumber || '',
                          ucName: s.marriedUcName || '',
                          streetNumber: s.marriedStreetNumber || '',
                          houseNumber: s.marriedHouseNumber || '',
                          address: s.marriedAddress || '',
                        }}
                        typeLabel="Married Address Type"
                        addressLabel="Married Full Address"
                        onChange={(field, value) => updateMarriedSiblingAddress(s.id, field, value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 6. GUARDIAN INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={8} title="Guardian Info" isCompleted={completionStats.isGuardianComplete} />
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
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
            <AddressFields
              typeLabel="Permanent Address Type"
              addressLabel="Permanent Full Address"
              values={{
                addressType: guardianAddressType,
                postOffice: guardianPostOffice,
                colony: guardianColony,
                district: guardianDistrict,
                tehsil: guardianTehsil,
                ucNumber: guardianUcNumber,
                ucName: guardianUcName,
                streetNumber: guardianStreetNumber,
                houseNumber: guardianHouseNumber,
                address: guardianAddress,
              }}
              onChange={(field, value) => {
                if (field === 'address') setGuardianAddress(value);
                else updatePermanentGuardianAddressPart(field, value);
              }}
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
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
                <AddressFields
                  values={{
                    addressType: guardian.addressType || '',
                    postOffice: guardian.postOffice || '',
                    colony: guardian.colony || '',
                    district: guardian.district,
                    tehsil: guardian.tehsil,
                    ucNumber: guardian.ucNumber,
                    ucName: guardian.ucName || '',
                    streetNumber: guardian.streetNumber,
                    houseNumber: guardian.houseNumber,
                    address: guardian.address,
                  }}
                  onChange={(field, value) => updateGuardian(guardian.id, field, value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= 8. MEETING PERSON INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={9} title="Meeting Person Info" isCompleted={completionStats.isMeetingComplete} />
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

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 border-t border-slate-200 pt-4">
                  <AddressFields
                    values={{
                      addressType: p.addressType || '',
                      postOffice: p.postOffice || '',
                      colony: p.colony || '',
                      district: p.district,
                      tehsil: p.tehsil,
                      ucNumber: p.ucNumber,
                      ucName: p.ucName || '',
                      streetNumber: p.streetNumber,
                      houseNumber: p.houseNumber,
                      address: p.address,
                    }}
                    onChange={(field, value) => updateMeetingPerson(p.id, field, value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 8. WITNESS INFO ================= */}
      <div>
        <div className="flex items-center justify-between">
          <SectionHeading step={10} title="Witness Info" isCompleted={completionStats.isWitnessComplete} />
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

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 border-t border-slate-200 pt-4">
                  <AddressFields
                    values={{
                      addressType: w.addressType || '',
                      postOffice: w.postOffice || '',
                      colony: w.colony || '',
                      district: w.district || '',
                      tehsil: w.tehsil || '',
                      ucNumber: w.ucNumber || '',
                      ucName: w.ucName || '',
                      streetNumber: w.streetNumber || '',
                      houseNumber: w.houseNumber || '',
                      address: w.address,
                    }}
                    onChange={(field, value) => updateWitness(w.id, field, value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 11. RESULT INFO ================= */}
      <div>
        <SectionHeading step={11} title="Result Info" isCompleted={completionStats.isResultComplete} />
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
        <div className="flex items-start justify-between gap-3">
          <SectionHeading step={12} title="Health Care & Medical Follow-up" isCompleted={completionStats.isHealthCareComplete} />
          <button
            type="button"
            onClick={addHealthCareEntry}
            className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 bg-[#0D5C3A] text-white rounded text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
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
        </div>

        {additionalHealthCareEntries.map((entry, index) => (
          <div key={entry.id} className="mt-3 border border-slate-200 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Additional Medical Follow-up {index + 1}</span>
              <button
                type="button"
                onClick={() => setAdditionalHealthCareEntries((current) => current.filter((item) => item.id !== entry.id))}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`Remove medical follow-up ${index + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5">
              <FormSelect
                label="Check Frequency"
                value={entry.checkFrequency}
                onChange={(e) => updateHealthCareEntry(entry.id, 'checkFrequency', e.target.value)}
                options={['Daily', 'Weekly', 'Monthly']}
              />
              <FormInput
                placeholder="Medicine Details"
                value={entry.medicineDetails}
                onChange={(e) => updateHealthCareEntry(entry.id, 'medicineDetails', e.target.value)}
              />
              <FormInput
                placeholder="Antibiotic Medicine"
                value={entry.antibioticMedicine}
                onChange={(e) => updateHealthCareEntry(entry.id, 'antibioticMedicine', e.target.value)}
              />
              <FormInput
                placeholder="Enter doctor name"
                value={entry.doctorName}
                onChange={(e) => updateHealthCareEntry(entry.id, 'doctorName', e.target.value)}
              />
              <FormInput
                placeholder="Enter hospital name"
                value={entry.hospitalName}
                onChange={(e) => updateHealthCareEntry(entry.id, 'hospitalName', e.target.value)}
              />
              <FormSelect
                label="Hospital Type"
                value={entry.hospitalType}
                onChange={(e) => updateHealthCareEntry(entry.id, 'hospitalType', e.target.value)}
                options={['Government', 'Private']}
                placeholder="Select hospital type"
              />
              <FormInput
                type="tel"
                placeholder="Enter doctor contact number"
                value={entry.doctorContactNo}
                onChange={(e) => updateHealthCareEntry(entry.id, 'doctorContactNo', e.target.value)}
              />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3.5 mt-3.5">
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
        <div className="flex items-start justify-between gap-3">
          <SectionHeading step={13} title="Behavioral & Academic Report / Complaints" isCompleted={completionStats.isReportComplete} />
          <button
            type="button"
            onClick={addReportEntry}
            className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 bg-[#0D5C3A] text-white rounded text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
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

          {additionalReportEntries.map((entry, index) => (
            <div key={entry.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Additional Report / Complaint {index + 1}</span>
                <button
                  type="button"
                  onClick={() => setAdditionalReportEntries((current) => current.filter((item) => item.id !== entry.id))}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label={`Remove report or complaint ${index + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <FormSelect
                label="Complain Type"
                value={entry.category}
                onChange={(e) => updateReportEntry(entry.id, 'category', e.target.value)}
                options={['Discipline', 'Behavior', 'Academic', 'Islamic', 'Psychological']}
              />
              <textarea
                rows={3}
                value={entry.details}
                onChange={(e) => updateReportEntry(entry.id, 'details', e.target.value)}
                placeholder="Report / complaint details..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-slate-950 focus:outline-hidden focus:ring-1 focus:ring-slate-950 resize-none"
              />
            </div>
          ))}

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
        <div className="flex items-start justify-between gap-3">
          <SectionHeading step={14} title="Area of Interest – Child" isCompleted={completionStats.isInterestComplete} />
          <button
            type="button"
            onClick={addAreaOfInterestEntry}
            className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 bg-[#0D5C3A] text-white rounded text-xs font-semibold hover:bg-[#0b4d30] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
        <div className="relative">
          <textarea
            rows={3}
            value={areaOfInterest}
            onChange={(e) => setAreaOfInterest(e.target.value)}
            placeholder="Area of Interest"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-slate-950 focus:outline-hidden focus:ring-1 focus:ring-slate-950 resize-none"
          />
        </div>
        {additionalAreaOfInterestEntries.map((entry, index) => (
          <div key={entry.id} className="relative mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">Additional Area of Interest {index + 1}</span>
              <button
                type="button"
                onClick={() => setAdditionalAreaOfInterestEntries((current) => current.filter((item) => item.id !== entry.id))}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`Remove area of interest ${index + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={3}
              value={entry.details}
              onChange={(e) => updateAreaOfInterestEntry(entry.id, e.target.value)}
              placeholder="Area of Interest"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-slate-950 focus:outline-hidden focus:ring-1 focus:ring-slate-950 resize-none"
            />
          </div>
        ))}
      </div>

      {/* ================= 15. ATTACHMENTS (FINAL SECTION) ================= */}
      <div>
        <SectionHeading step={15} title="Mandatory Attachments & Verification" isCompleted={completionStats.isAttachmentsComplete} />
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
          type="button"
          onClick={openFollowUpForm}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-800 text-xs sm:text-sm font-bold hover:bg-indigo-100 transition-all cursor-pointer disabled:opacity-50"
        >
          Follow Up{followUpRecords.length > 0 ? ` (${followUpRecords.length})` : ''}
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

      {isFollowUpOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="follow-up-title"
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="follow-up-title" className="text-lg font-bold text-slate-900">Follow Up Form</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Follow-up details are saved with the child dossier when you save the dossier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFollowUpOpen(false)}
                className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close follow-up form"
              >
                ×
              </button>
            </div>

            {followUpError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {followUpError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {([
                ['name', 'Name'],
                ['className', 'Class'],
                ['instituteName', 'Institute Name'],
                ['passedFrom', 'Passed From'],
                ['boardRegistrationNumber', 'Board Registration Number'],
                ['rollNumber', 'Roll Number'],
                ['passingYear', 'Passing Year'],
                ['totalMarks', 'Total Marks'],
                ['obtainedMarks', 'Obtained Marks'],
                ['pshRegistrationNumber', 'PSH Registration Number'],
                ['passedFromPsh', 'Passed From Which PSH'],
              ] as const).map(([field, label]) => (
                <FormInput
                  key={field}
                  label={label}
                  value={followUpDraft[field]}
                  required={field === 'name'}
                  onChange={(event) => {
                    setFollowUpDraft((current) => ({ ...current, [field]: event.target.value }));
                    if (followUpError) setFollowUpError(null);
                  }}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsFollowUpOpen(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveFollowUpDraft}
                className="rounded-lg bg-[#0D5C3A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0b4d30]"
              >
                Add Follow Up
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
