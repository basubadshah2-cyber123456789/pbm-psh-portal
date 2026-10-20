'use client';

import React, { useState, useEffect, useMemo, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
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
  HeartHandshake,
  FileText,
} from 'lucide-react';
import { ChildPhotoPicker } from './ChildPhotoPicker';
import { ProfessionalCareerAccountModal } from './ProfessionalCareerAccountModal';
import { CameraCaptureModal } from '@/components/common/CameraCaptureModal';
import { formatCNIC, formatPhone } from '@/lib/formatters';
import { childPhotoDisplaySrc } from '@/lib/child-photo';
import { createEmptyFollowUp, type FollowUpRecord } from './follow-up';

type RepeatableFormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type SavedChildDocument = { id: string; title: string; documentType: string; uploadedAt: string };

const ATTACHMENT_TYPE_OPTIONS = [
  { title: 'Father CNIC Front', documentType: 'FATHER_CNIC_FRONT' },
  { title: 'Father CNIC Back', documentType: 'FATHER_CNIC_BACK' },
  { title: 'Mother CNIC', documentType: 'MOTHER_CNIC' },
  { title: 'CNIC (Back)', documentType: 'CNIC_BACK' },
  { title: 'Guardian CNIC', documentType: 'GUARDIAN_CNIC' },
  { title: 'Guardian CNIC (Back)', documentType: 'GUARDIAN_CNIC_BACK' },
  { title: 'Any Medical Certificate', documentType: 'MEDICAL_CERTIFICATE' },
  { title: 'Witness CNIC (Front)', documentType: 'WITNESS_CNIC_FRONT' },
  { title: 'Witness CNIC (Back)', documentType: 'WITNESS_CNIC_BACK' },
  { title: 'Father Death Certificate', documentType: 'FATHER_DEATH_CERTIFICATE' },
  { title: 'Mother Death Certificate', documentType: 'MOTHER_DEATH_CERTIFICATE' },
  { title: 'Divorce Certificate', documentType: 'DIVORCE_CERTIFICATE' },
] as const;

function getRepeatableFieldKey(control: RepeatableFormControl): string {
  if (control instanceof HTMLInputElement && ['file', 'checkbox', 'radio', 'submit', 'button'].includes(control.type)) {
    return '';
  }

  const label = control.closest('.relative')?.querySelector('label')?.textContent;
  const identifier = label || control.getAttribute('placeholder') || control.getAttribute('aria-label') || '';

  return identifier
    .replace(/\*/g, '')
    .trim()
    .toLowerCase()
    .replace(/\bno\b/g, 'number')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function updateRepeatableControl(control: RepeatableFormControl, value: string): void {
  if (control.disabled || control.value === value) return;

  const prototype = control instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : control instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLTextAreaElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (!valueSetter) return;

  valueSetter.call(control, value);
  control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
}

function normalizeChildStatus(value: string): string {
  switch (value.trim().toUpperCase()) {
    case 'ACTIVE':
    case 'CURRENT':
    case 'PENDING':
      return 'ACTIVE';
    case 'DROPPED':
    case 'TRANSFERRED':
    case 'DEACTIVATED':
      return 'DROPPED';
    case 'EXPELLED':
      return 'EXPELLED';
    case 'PASSOUT':
    case 'GRADUATED':
      return 'PASSOUT';
    default:
      return value;
  }
}

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
  villageName?: string;
  postOffice?: string;
  cityName?: string;
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
  villageName?: string;
  postOffice?: string;
  cityName?: string;
  colony?: string;
  district: string;
  tehsil: string;
  ucNumber: string;
  ucName?: string;
  streetNumber: string;
  houseNumber: string;
  address: string;
  marriedAddressType?: string;
  marriedVillageName?: string;
  marriedPostOffice?: string;
  marriedCityName?: string;
  marriedColony?: string;
  marriedDistrict?: string;
  marriedTehsil?: string;
  marriedUcNumber?: string;
  marriedUcName?: string;
  marriedStreetNumber?: string;
  marriedHouseNumber?: string;
  marriedAddress?: string;
}

type DisciplinaryProceedingRecord = {
  type: '' | 'DROPPED' | 'EXPELLED';
  name: string;
  fatherName: string;
  pshName: string;
  className: string;
  classSection: string;
  rollNumber: string;
  attendance: string;
  pshRegistrationNumber: string;
  instituteName: string;
  totalMarks: string;
  obtainedMarks: string;
  reason: string;
  date: string;
  approved: string;
  remarks: string;
  expulsionCommitteeMinutes: string;
  counsellingEntries: Array<{ id: string; date: string; details: string }>;
};

const createEmptyDisciplinaryProceeding = (): DisciplinaryProceedingRecord => ({
  type: '',
  name: '',
  fatherName: '',
  pshName: '',
  className: '',
  classSection: '',
  rollNumber: '',
  attendance: '',
  pshRegistrationNumber: '',
  instituteName: '',
  totalMarks: '',
  obtainedMarks: '',
  reason: '',
  date: '',
  approved: '',
  remarks: '',
  expulsionCommitteeMinutes: '',
  counsellingEntries: [],
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
  villageName?: string;
  postOffice?: string;
  cityName?: string;
  colony?: string;
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
  villageName?: string;
  postOffice?: string;
  cityName?: string;
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
  villageName: string;
  postOffice: string;
  cityName: string;
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
  'villageName',
  'postOffice',
  'cityName',
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
  location.addressType === 'Village' ? location.villageName : location.cityName,
  location.addressType === 'Village' ? location.postOffice : '',
  location.addressType === 'City' ? location.colony : '',
  location.district,
  location.tehsil,
  location.ucNumber,
  location.ucName,
  location.streetNumber,
  location.houseNumber,
]);

const getYearValue = (value?: string | number | null) => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (!value) return new Date().getFullYear();
  const yearPrefix = String(value).match(/^(\d{4})(?:-|$)/);
  if (yearPrefix) return Number(yearPrefix[1]);
  const parsedDate = new Date(String(value));
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getFullYear();
  }
  return new Date().getFullYear();
};

const mergeYearlyHistory = <T extends { year?: number | string }>(
  existingEntries: T[] | undefined,
  nextEntry: T,
  yearValue: number
) => {
  const nextHistory = [...(Array.isArray(existingEntries) ? existingEntries : [])];
  const nextEntryWithYear = { ...nextEntry, year: yearValue };
  const index = nextHistory.findIndex((entry) => Number(entry.year) === yearValue);

  if (index >= 0) {
    nextHistory[index] = nextEntryWithYear;
  } else {
    nextHistory.push(nextEntryWithYear);
  }

  return nextHistory.sort((left, right) => Number(right.year) - Number(left.year));
};

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
        options={[
          { label: 'Urban', value: 'City' },
          { label: 'Rural', value: 'Village' },
        ]}
        disabled={disabled}
      />
      <FormInput label="House No." value={values.houseNumber} onChange={(event) => onChange('houseNumber', event.target.value)} disabled={disabled} />
      <FormInput label="Street No." value={values.streetNumber} onChange={(event) => onChange('streetNumber', event.target.value)} disabled={disabled} />
      {values.addressType === 'Village' ? (
        <>
          <FormInput
            label="Village Name/No."
            value={values.villageName}
            onChange={(event) => onChange('villageName', event.target.value)}
            disabled={disabled}
          />
          <FormInput
            label="Post Office"
            value={values.postOffice}
            onChange={(event) => onChange('postOffice', event.target.value)}
            disabled={disabled}
          />
        </>
      ) : values.addressType === 'City' ? (
        <>
          <FormInput
            label="City Name"
            value={values.cityName}
            onChange={(event) => onChange('cityName', event.target.value)}
            disabled={disabled}
          />
          <FormInput
            label="Colony"
            value={values.colony}
            onChange={(event) => onChange('colony', event.target.value)}
            disabled={disabled}
          />
        </>
      ) : null}
      <FormInput label="Tehsil" value={values.tehsil} onChange={(event) => onChange('tehsil', event.target.value)} disabled={disabled} />
      <FormInput label="District" value={values.district} onChange={(event) => onChange('district', event.target.value)} disabled={disabled} />
      <FormInput
        label="Union Council No./Name"
        value={composeAddress([values.ucNumber, values.ucName])}
        onChange={(event) => onChange('ucNumber', event.target.value)}
        disabled={disabled}
      />
      <FormInput
        label={addressLabel}
        value={values.address}
        onChange={(event) => onChange('address', event.target.value)}
        className="md:col-span-3"
        disabled={disabled}
      />
    </>
  );
}

interface AppearanceMeasurement {
  id: string;
  year: string;
  height: string;
  weight: string;
  age: string;
}

interface ResultInfoRecord {
  id: string;
  year: number;
  school: string;
  gradeClass: string;
  examDate: string;
  examType: string;
  passingScore: string;
  subjectResults: SubjectResultRow[];
}

interface GeneralCounsellingEntry {
  id: string;
  date: string;
  details: string;
}

interface AreaOfInterestYearRecord {
  year: number;
  areaOfInterest: string;
  entries: AreaOfInterestEntry[];
}

interface ProfilePhotoYearRecord {
  year: number;
  photo: string;
}

interface HealthCareEntry {
  id: string;
  checkFrequency: string;
  disease: string;
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
  readOnly = false,
  className = '',
  name,
  min,
  max,
  step,
  maxLength,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: string;
  maxLength?: number;
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
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        placeholder={placeholder || (label ? '' : undefined)}
        className="w-full h-12 sm:h-11 px-3.5 py-2 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.02)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed transition-all duration-200"
      />
    </div>
  );
}

function getAgeAtDateOf(dateOfBirth: string, comparisonDate: string): string {
  const parseDate = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const [, year, month, day] = match;
    return { year: Number(year), month: Number(month), day: Number(day) };
  };

  const birthDate = parseDate(dateOfBirth);
  const admission = parseDate(comparisonDate);
  if (!birthDate || !admission) return '';

  const toTimestamp = (date: { year: number; month: number; day: number }) =>
    Date.UTC(date.year, date.month - 1, date.day);
  const birthTimestamp = toTimestamp(birthDate);
  const admissionTimestamp = toTimestamp(admission);
  if (
    new Date(birthTimestamp).toISOString().slice(0, 10) !== dateOfBirth ||
    new Date(admissionTimestamp).toISOString().slice(0, 10) !== comparisonDate ||
    admissionTimestamp < birthTimestamp
  ) {
    return '';
  }

  const addMonths = (date: { year: number; month: number; day: number }, months: number) => {
    const monthIndex = date.year * 12 + date.month - 1 + months;
    const year = Math.floor(monthIndex / 12);
    const month = monthIndex % 12 + 1;
    const day = Math.min(date.day, new Date(Date.UTC(year, month, 0)).getUTCDate());
    return { year, month, day };
  };
  const isAfter = (
    left: { year: number; month: number; day: number },
    right: { year: number; month: number; day: number }
  ) => toTimestamp(left) > toTimestamp(right);

  let years = admission.year - birthDate.year;
  let yearDate = addMonths(birthDate, years * 12);
  if (isAfter(yearDate, admission)) {
    years -= 1;
    yearDate = addMonths(birthDate, years * 12);
  }

  let months = (admission.year - yearDate.year) * 12 + admission.month - yearDate.month;
  let monthDate = addMonths(yearDate, months);
  if (isAfter(monthDate, admission)) {
    months -= 1;
    monthDate = addMonths(yearDate, months);
  }

  const days = (admissionTimestamp - toTimestamp(monthDate)) / 86_400_000;
  const formatUnit = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`;

  return `${formatUnit(years, 'year')}, ${formatUnit(months, 'month')}, ${formatUnit(days, 'day')}`;
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
  const repeatableFieldGroupId = useId();
  const repeatedValues = useRef(new Map<string, string>());
  const isSyncingRepeatedValues = useRef(false);
  const persistedInitialChildId = initialChild?.id &&
    !String(initialChild.id).startsWith('seed-') &&
    !String(initialChild.id).startsWith('demo-')
      ? String(initialChild.id)
      : undefined;

  const getRepeatableFieldControls = (form: HTMLFormElement) => {
    const groupId = form.dataset.repeatableFieldGroup;
    return Array.from(document.querySelectorAll<RepeatableFormControl>(
      '[data-repeatable-field-group] input, [data-repeatable-field-group] select, [data-repeatable-field-group] textarea'
    )).filter((control) =>
      control.closest<HTMLElement>('[data-repeatable-field-group]')?.dataset.repeatableFieldGroup === groupId
    );
  };

  const handleRepeatedFieldChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    if (isSyncingRepeatedValues.current) return;

    const source = event.target;
    if (!(source instanceof HTMLInputElement || source instanceof HTMLSelectElement || source instanceof HTMLTextAreaElement)) return;

    const fieldKey = getRepeatableFieldKey(source);
    if (!fieldKey) return;

    repeatedValues.current.set(fieldKey, source.value);
    isSyncingRepeatedValues.current = true;
    try {
      getRepeatableFieldControls(event.currentTarget).forEach((control) => {
        if (control === source || getRepeatableFieldKey(control) !== fieldKey) return;
        updateRepeatableControl(control, source.value);
      });
    } finally {
      isSyncingRepeatedValues.current = false;
    }
  };

  const handleRepeatedFieldFocus = (event: React.FocusEvent<HTMLFormElement>) => {
    if (isSyncingRepeatedValues.current) return;

    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    if (target.value) {
      const fieldKey = getRepeatableFieldKey(target);
      if (fieldKey && !repeatedValues.current.has(fieldKey)) repeatedValues.current.set(fieldKey, target.value);
      return;
    }

    const fieldKey = getRepeatableFieldKey(target);
    if (!fieldKey) return;

    const previousValue = repeatedValues.current.get(fieldKey) ??
      getRepeatableFieldControls(event.currentTarget)
        .find((control) =>
          control !== target &&
          getRepeatableFieldKey(control) === fieldKey &&
          Boolean(control.value)
        )?.value;

    if (previousValue) updateRepeatableControl(target, previousValue);
  };

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
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('MALE');
  const [familyCast, setFamilyCast] = useState<string>('');
  const [motherLanguage, setMotherLanguage] = useState<string>('');
  const [birthDistrict, setBirthDistrict] = useState<string>('');
  const [identificationMark, setIdentificationMark] = useState<string>('');
  const [nextOfKin, setNextOfKin] = useState<string>('');
  const [isSponsored, setIsSponsored] = useState<string>('');
  const [sponsorshipAmount, setSponsorshipAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorFatherName, setDonorFatherName] = useState<string>('');
  const [donorCnic, setDonorCnic] = useState<string>('');
  const [donorMaritalStatus, setDonorMaritalStatus] = useState<string>('');
  const [donorAddress, setDonorAddress] = useState<string>('');
  const [donorContactNo, setDonorContactNo] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorDocumentFile, setDonorDocumentFile] = useState<File | null>(null);
  const [donorDocumentPreview, setDonorDocumentPreview] = useState<string>('');
  const [savedDonorDocumentName, setSavedDonorDocumentName] = useState<string>('');
  const [savedDonorDocumentUrl, setSavedDonorDocumentUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [dateOfStatus, setDateOfStatus] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusRemarks, setStatusRemarks] = useState<string>('');
  const [disciplinaryProceeding, setDisciplinaryProceeding] = useState<DisciplinaryProceedingRecord>(createEmptyDisciplinaryProceeding);

  // ================= 3. HEALTH INFO =================
  const [isDisable, setIsDisable] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [mentalHealth, setMentalHealth] = useState<string>('');
  const [physicalHealth, setPhysicalHealth] = useState<string>('');
  const [vaccinationDetail, setVaccinationDetail] = useState<string>('');
  const [specialNeedDisease, setSpecialNeedDisease] = useState<string>('');
  const [appearanceMeasurements, setAppearanceMeasurements] = useState<AppearanceMeasurement[]>([
    { id: '1', year: String(new Date().getFullYear()), height: '', weight: '', age: '' },
  ]);
  const admissionAge = initialChild ? '' : getAgeAtDateOf(dateOfBirth, admissionDate);

  const addAppearanceMeasurement = () => {
    setAppearanceMeasurements((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        year: String(new Date().getFullYear()),
        height: '',
        weight: '',
        age: '',
      },
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
  const [fatherVillageName, setFatherVillageName] = useState('');
  const [fatherPostOffice, setFatherPostOffice] = useState('');
  const [fatherCityName, setFatherCityName] = useState('');
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
        villageName: fatherVillageName,
        postOffice: fatherPostOffice,
        cityName: fatherCityName,
        colony: fatherColony,
        district: fatherDistrict,
        tehsil: fatherTehsil,
        ucNumber: fatherUcNumber,
        ucName: field === 'ucNumber' ? '' : fatherUcName,
        streetNumber: fatherStreetNumber,
        houseNumber: fatherHouseNumber,
        [field]: value,
      };
      if (field === 'addressType') setFatherAddressType(value);
      if (field === 'villageName') setFatherVillageName(value);
      if (field === 'postOffice') setFatherPostOffice(value);
      if (field === 'cityName') setFatherCityName(value);
      if (field === 'colony') setFatherColony(value);
      if (field === 'district') setFatherDistrict(value);
      if (field === 'tehsil') setFatherTehsil(value);
      if (field === 'ucNumber') {
        setFatherUcNumber(value);
        setFatherUcName('');
      }
      if (field === 'ucName') setFatherUcName(value);
      if (field === 'streetNumber') setFatherStreetNumber(value);
      if (field === 'houseNumber') setFatherHouseNumber(value);
      setFatherAddress(composeLocationAddress(parts));
      return;
    }

    const parts = {
      addressType: motherAddressType,
      villageName: motherVillageName,
      postOffice: motherPostOffice,
      cityName: motherCityName,
      colony: motherColony,
      district: motherDistrict,
      tehsil: motherTehsil,
      ucNumber: motherUcNumber,
      ucName: field === 'ucNumber' ? '' : motherUcName,
      streetNumber: motherStreetNumber,
      houseNumber: motherHouseNumber,
      [field]: value,
    };
    if (field === 'addressType') setMotherAddressType(value);
    if (field === 'villageName') setMotherVillageName(value);
    if (field === 'postOffice') setMotherPostOffice(value);
    if (field === 'cityName') setMotherCityName(value);
    if (field === 'colony') setMotherColony(value);
    if (field === 'district') setMotherDistrict(value);
    if (field === 'tehsil') setMotherTehsil(value);
    if (field === 'ucNumber') {
      setMotherUcNumber(value);
      setMotherUcName('');
    }
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
  const [motherVillageName, setMotherVillageName] = useState('');
  const [motherPostOffice, setMotherPostOffice] = useState('');
  const [motherCityName, setMotherCityName] = useState('');
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
  const [guardianVillageName, setGuardianVillageName] = useState('');
  const [guardianPostOffice, setGuardianPostOffice] = useState('');
  const [guardianCityName, setGuardianCityName] = useState('');
  const [guardianColony, setGuardianColony] = useState('');
  const [sameAsPermanentAddress, setSameAsPermanentAddress] = useState(false);
  const [currentGuardianAddress, setCurrentGuardianAddress] = useState({
    addressType: '',
    villageName: '',
    postOffice: '',
    cityName: '',
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
      villageName: guardianVillageName,
      postOffice: guardianPostOffice,
      cityName: guardianCityName,
      colony: guardianColony,
      district: guardianDistrict,
      tehsil: guardianTehsil,
      ucNumber: guardianUcNumber,
      ucName: field === 'ucNumber' ? '' : guardianUcName,
      streetNumber: guardianStreetNumber,
      houseNumber: guardianHouseNumber,
      [field]: value,
    };
    if (field === 'addressType') setGuardianAddressType(value);
    if (field === 'villageName') setGuardianVillageName(value);
    if (field === 'postOffice') setGuardianPostOffice(value);
    if (field === 'cityName') setGuardianCityName(value);
    if (field === 'colony') setGuardianColony(value);
    if (field === 'district') setGuardianDistrict(value);
    if (field === 'tehsil') setGuardianTehsil(value);
    if (field === 'ucNumber') {
      setGuardianUcNumber(value);
      setGuardianUcName('');
    }
    if (field === 'ucName') setGuardianUcName(value);
    if (field === 'streetNumber') setGuardianStreetNumber(value);
    if (field === 'houseNumber') setGuardianHouseNumber(value);
    setGuardianAddress(composeLocationAddress(parts));
  };

  useEffect(() => {
    if (!sameAsPermanentAddress) return;
    setCurrentGuardianAddress({
      addressType: guardianAddressType,
      villageName: guardianVillageName,
      postOffice: guardianPostOffice,
      cityName: guardianCityName,
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
    guardianVillageName,
    guardianPostOffice,
    guardianCityName,
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
      const updated = {
        ...current,
        [field]: value,
        ...(field === 'ucNumber' ? { ucName: '' } : {}),
      };
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
        villageName: '',
        postOffice: '',
        cityName: '',
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
      const updated = {
        ...guardian,
        [field]: formattedValue,
        ...(field === 'ucNumber' ? { ucName: '' } : {}),
      };
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
      villageName: '',
      postOffice: '',
      cityName: '',
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
        villageName: '',
        postOffice: '',
        cityName: '',
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
      const updated = {
        ...person,
        [field]: formattedVal,
        ...(field === 'ucNumber' ? { ucName: '' } : {}),
      };
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
      villageName: '',
      postOffice: '',
      cityName: '',
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
        villageName: '',
        postOffice: '',
        cityName: '',
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
      const updated = {
        ...sibling,
        [field]: value,
        ...(field === 'ucNumber' ? { ucName: '' } : {}),
      };
      return addressComponentFields.has(field)
        ? { ...updated, address: composeLocationAddress(updated) }
        : updated;
    }));
  };

  const updateMarriedSiblingAddress = (id: string, field: keyof AddressRecord, value: string) => {
    const marriedFieldByAddressField: Record<keyof AddressRecord, keyof SiblingRecord> = {
      addressType: 'marriedAddressType',
      villageName: 'marriedVillageName',
      postOffice: 'marriedPostOffice',
      cityName: 'marriedCityName',
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
      const updated = {
        ...sibling,
        [marriedFieldByAddressField[field]]: value,
        ...(field === 'ucNumber' ? { marriedUcName: '' } : {}),
      };
      if (!addressComponentFields.has(field)) return updated;

      return {
        ...updated,
        marriedAddress: composeLocationAddress({
          addressType: updated.marriedAddressType || '',
          villageName: updated.marriedVillageName || '',
          postOffice: updated.marriedPostOffice || '',
          cityName: updated.marriedCityName || '',
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
      villageName: '',
      postOffice: '',
      cityName: '',
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
        villageName: '',
        postOffice: '',
        cityName: '',
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
      const updated = {
        ...witness,
        [field]: formattedVal,
        ...(field === 'ucNumber' ? { ucName: '' } : {}),
      };
      return addressComponentFields.has(field)
        ? { ...updated, address: composeLocationAddress(updated) }
        : updated;
    }));
  };

  // ================= 10. RESULT INFO =================
  const [resultEntryId, setResultEntryId] = useState<string>('new-result');
  const [resultSchool, setResultSchool] = useState<string>('');
  const [resultClass, setResultClass] = useState<string>('');
  const [resultExamDate, setResultExamDate] = useState<string>('');
  const [resultExamType, setResultExamType] = useState<string>('');
  const [resultPassingScore, setResultPassingScore] = useState<string>('');
  const [resultInfoHistory, setResultInfoHistory] = useState<ResultInfoRecord[]>([]);
  const [counsellingEntries, setCounsellingEntries] = useState<GeneralCounsellingEntry[]>([]);

  const [subjectResults, setSubjectResults] = useState<SubjectResultRow[]>([
    { id: '1', subject: '', obtainedMarks: '', totalMarks: '' },
  ]);

  const startNewResultEntry = () => {
    setResultEntryId(`new-result-${Date.now()}`);
    setResultSchool('');
    setResultClass('');
    setResultExamDate('');
    setResultExamType('');
    setResultPassingScore('');
    setSubjectResults([{ id: `${Date.now()}-subject`, subject: '', obtainedMarks: '', totalMarks: '' }]);
  };

  const editResultEntry = (entry: ResultInfoRecord) => {
    setResultEntryId(entry.id);
    setResultSchool(entry.school || '');
    setResultClass(entry.gradeClass || '');
    setResultExamDate(entry.examDate || '');
    setResultExamType(entry.examType || '');
    setResultPassingScore(entry.passingScore || '');
    setSubjectResults(
      entry.subjectResults.length > 0
        ? entry.subjectResults
        : [{ id: `${entry.id}-subject`, subject: '', obtainedMarks: '', totalMarks: '' }]
    );
  };

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
  const [disease, setDisease] = useState<string>('');
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
        disease: '',
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
  const [areaOfInterestHistory, setAreaOfInterestHistory] = useState<AreaOfInterestYearRecord[]>([]);
  const [profilePhotoHistory, setProfilePhotoHistory] = useState<ProfilePhotoYearRecord[]>([]);

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
  const [attachments, setAttachments] = useState<Record<string, { file: File | null; title: string; documentType: string }>>({
    fatherCnicFront: { file: null, title: 'Father CNIC Front', documentType: 'FATHER_CNIC_FRONT' },
    fatherCnicBack: { file: null, title: 'Father CNIC Back', documentType: 'FATHER_CNIC_BACK' },
    motherCnic: { file: null, title: 'Mother CNIC', documentType: 'MOTHER_CNIC' },
    cnicBack: { file: null, title: 'CNIC (Back)', documentType: 'CNIC_BACK' },
    guardianCnic: { file: null, title: 'Guardian CNIC', documentType: 'GUARDIAN_CNIC' },
    guardianCnicBack: { file: null, title: 'Guardian CNIC (Back)', documentType: 'GUARDIAN_CNIC_BACK' },
    medicalCertificate: { file: null, title: 'Any Medical Certificate', documentType: 'MEDICAL_CERTIFICATE' },
    witnessCnicFront: { file: null, title: 'Witness CNIC (Front)', documentType: 'WITNESS_CNIC_FRONT' },
    witnessCnicBack: { file: null, title: 'Witness CNIC (Back)', documentType: 'WITNESS_CNIC_BACK' },
    fatherDeathCertificate: { file: null, title: 'Father Death Certificate', documentType: 'FATHER_DEATH_CERTIFICATE' },
    motherDeathCertificate: { file: null, title: 'Mother Death Certificate', documentType: 'MOTHER_DEATH_CERTIFICATE' },
    divorceCertificate: { file: null, title: 'Divorce Certificate', documentType: 'DIVORCE_CERTIFICATE' },
  });
  const [newAttachmentType, setNewAttachmentType] = useState('');

  const handleAttachmentUpload = (key: string, file: File | null) => {
    setAttachments((prev) => ({
      ...prev,
      [key]: { ...prev[key], file },
    }));
  };

  const addAttachment = () => {
    const selectedType = ATTACHMENT_TYPE_OPTIONS.find((option) => option.documentType === newAttachmentType);
    if (!selectedType) return;

    setAttachments((current) => {
      const sameTypeCount = Object.values(current).filter((item) => item.documentType === selectedType.documentType).length;
      return {
        ...current,
        [`additional-${crypto.randomUUID()}`]: {
          file: null,
          title: sameTypeCount > 0 ? `${selectedType.title} (${sameTypeCount + 1})` : selectedType.title,
          documentType: selectedType.documentType,
        },
      };
    });
    setNewAttachmentType('');
  };

  const getSavedDocumentsByType = (documentType: string): SavedChildDocument[] => {
    const documents: SavedChildDocument[] = Array.isArray(initialChild?.documents)
      ? initialChild.documents
      : [];
    return documents.filter((document) => document.documentType === documentType);
  };

  const getSavedDocument = (documentType: string) => (
    getSavedDocumentsByType(documentType)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0] || null
  );

  const getSavedAttachment = (documentType: string, index: number) => (
    getSavedDocumentsByType(documentType)
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())[index] || null
  );

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isDemoDataLoaded, setIsDemoDataLoaded] = useState(false);
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);
  const [disciplinaryDraft, setDisciplinaryDraft] = useState<DisciplinaryProceedingRecord>(createEmptyDisciplinaryProceeding);
  const [isDisciplinaryProceedingsOpen, setIsDisciplinaryProceedingsOpen] = useState(false);
  const [expulsionMinutesPhotoFile, setExpulsionMinutesPhotoFile] = useState<File | null>(null);
  const [expulsionMinutesPhotoError, setExpulsionMinutesPhotoError] = useState('');
  const [droppedAffidavitFile, setDroppedAffidavitFile] = useState<File | null>(null);
  const [droppedApplicationFile, setDroppedApplicationFile] = useState<File | null>(null);
  const [droppedAttachmentError, setDroppedAttachmentError] = useState('');
  const [expelledAffidavitFile, setExpelledAffidavitFile] = useState<File | null>(null);
  const [expelledApplicationFile, setExpelledApplicationFile] = useState<File | null>(null);
  const [expelledAttachmentError, setExpelledAttachmentError] = useState('');
  const [isProfessionalCareerOpen, setIsProfessionalCareerOpen] = useState(false);
  const [careerAccountChildId, setCareerAccountChildId] = useState<string | undefined>(persistedInitialChildId);
  const [careerSetupAfterSave, setCareerSetupAfterSave] = useState(false);
  const [childAfterCareerSetup, setChildAfterCareerSetup] = useState<Record<string, unknown> | null>(null);
  const [careerCredentialsDraft, setCareerCredentialsDraft] = useState<{ username: string; password: string } | null>(null);

  const openCareerAccountSetup = (childId = careerAccountChildId || persistedInitialChildId) => {
    setCareerAccountChildId(childId);
    setIsProfessionalCareerOpen(true);
  };

  const openDisciplinaryProceedingsForm = () => {
    setDisciplinaryDraft({
      ...createEmptyDisciplinaryProceeding(),
      ...disciplinaryProceeding,
      name: disciplinaryProceeding.name || fullName,
      fatherName: disciplinaryProceeding.fatherName || fatherName,
      className: disciplinaryProceeding.className || resultClass,
      instituteName: disciplinaryProceeding.instituteName || resultSchool,
    });
    setIsDisciplinaryProceedingsOpen(true);
  };

  const saveDisciplinaryProceeding = () => {
    setDisciplinaryProceeding(disciplinaryDraft);
    setIsDisciplinaryProceedingsOpen(false);
  };

  const closeCareerAccountSetup = () => {
    setIsProfessionalCareerOpen(false);
    if (childAfterCareerSetup) {
      const savedChild = childAfterCareerSetup;
      setChildAfterCareerSetup(null);
      onSuccess(savedChild);
    }
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
      checkFrequency || disease || medicineDetails || antibioticMedicine || doctorName || hospitalName || doctorContactNo || hospitalType ||
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
        checkFrequency || disease || medicineDetails || antibioticMedicine || doctorName || hospitalName || doctorContactNo || hospitalType ||
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
    disease,
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
    repeatedValues.current.clear();
    if (initialChild) {
      setResultEntryId('new-result');
      setResultSchool('');
      setResultClass('');
      setResultExamDate('');
      setResultExamType('');
      setResultPassingScore('');
      setSubjectResults([{ id: '1', subject: '', obtainedMarks: '', totalMarks: '' }]);
      setResultInfoHistory([]);
      setCounsellingEntries([]);
      setAreaOfInterest('');
      setAdditionalAreaOfInterestEntries([]);
      setAreaOfInterestHistory([]);
      setProfilePhotoHistory([]);

      let psh: any = null;
      try {
        psh = typeof initialChild.notes === 'string' ? JSON.parse(initialChild.notes) : initialChild.notes;
      } catch {
        psh = null;
      }
      const savedBaseStatus = psh?.basicInfo?.status || initialChild.status || 'ACTIVE';
      const normalizedStatus = normalizeChildStatus(savedBaseStatus);
      const savedDisciplinaryType = psh?.disciplinaryProceedings?.type;
      const legacyDisciplinaryType = normalizedStatus === 'DROPPED' || normalizedStatus === 'EXPELLED'
        ? normalizedStatus
        : '';
      setStatus(
        normalizedStatus === 'DROPPED' || normalizedStatus === 'EXPELLED'
          ? 'ACTIVE'
          : normalizedStatus
      );
      setDisciplinaryProceeding({
        ...createEmptyDisciplinaryProceeding(),
        ...(psh?.disciplinaryProceedings || {}),
        counsellingEntries: Array.isArray(psh?.disciplinaryProceedings?.counsellingEntries)
          ? psh.disciplinaryProceedings.counsellingEntries.map((entry: { id?: string; date?: string; details?: string }, index: number) => ({
              id: entry.id || `saved-counselling-${index}`,
              date: entry.date || '',
              details: entry.details || '',
            }))
          : [],
        type: savedDisciplinaryType === 'DROPPED' || savedDisciplinaryType === 'EXPELLED'
          ? savedDisciplinaryType
          : legacyDisciplinaryType,
      });
      const legacyDataYear = getYearValue(initialChild.updatedAt || initialChild.admissionDate || initialChild.createdAt);
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
      setDateOfBirth(initialChild.dateOfBirth || '');
      setGender(initialChild.gender || 'MALE');
      setBloodGroup(initialChild.bloodGroup || 'B+');
      setAppearanceMeasurements([{
        id: '1',
        year: String(new Date().getFullYear()),
        height: '',
        weight: '',
        age: '',
      }]);
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
          setIsSponsored(psh.basicInfo.isSponsored === 'Yes' ? 'SPONSORED BY PBM' : (psh.basicInfo.isSponsored || ''));
          setSponsorshipAmount(psh.basicInfo.sponsorshipAmount || '');
          setDonorName(psh.donorInfo?.name || psh.basicInfo.donorName || '');
          setDonorFatherName(psh.donorInfo?.fatherName || psh.basicInfo.donorFatherName || '');
          setDonorCnic(psh.donorInfo?.cnic || psh.basicInfo.donorCnic || '');
          setDonorMaritalStatus(psh.donorInfo?.maritalStatus || psh.basicInfo.donorMaritalStatus || '');
          setDonorAddress(psh.donorInfo?.address || psh.basicInfo.donorAddress || '');
          setDonorContactNo(psh.donorInfo?.contactNo || psh.basicInfo.donorContactNo || '');
          setDonorEmail(psh.donorInfo?.email || psh.basicInfo.donorEmail || '');
          setSavedDonorDocumentName(psh.donorInfo?.document?.fileName || psh.donorInfo?.fileName || '');
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
        const savedMeasurements = Array.isArray(psh.appearanceHistory) && psh.appearanceHistory.length > 0
          ? psh.appearanceHistory
          : Array.isArray(psh.appearance?.measurements) && psh.appearance.measurements.length > 0
            ? psh.appearance.measurements
            : psh.appearance
              ? [psh.appearance]
              : [];
        const normalizedMeasurements = savedMeasurements.map((measurement: any, index: number) => ({
          id: typeof measurement.id === 'string' ? measurement.id : `saved-measurement-${index}`,
          year: String(getYearValue(measurement.year ?? legacyDataYear)),
          height: measurement.height === null || measurement.height === undefined ? '' : String(measurement.height),
          weight: measurement.weight === null || measurement.weight === undefined ? '' : String(measurement.weight),
          age: measurement.age === null || measurement.age === undefined ? '' : String(measurement.age),
        }));
        setAppearanceMeasurements(
          normalizedMeasurements.length > 0
            ? normalizedMeasurements
            : [{ id: '1', year: String(new Date().getFullYear()), height: '', weight: '', age: '' }]
        );

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
          setFatherVillageName(psh.fatherInfo.villageName || '');
          setFatherPostOffice(psh.fatherInfo.postOffice || '');
          setFatherCityName(psh.fatherInfo.cityName || '');
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
          setMotherVillageName(psh.motherInfo.villageName || '');
          setMotherPostOffice(psh.motherInfo.postOffice || '');
          setMotherCityName(psh.motherInfo.cityName || '');
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
          setGuardianVillageName(psh.guardianInfo.villageName || '');
          setGuardianPostOffice(psh.guardianInfo.postOffice || '');
          setGuardianCityName(psh.guardianInfo.cityName || '');
          setGuardianColony(psh.guardianInfo.colony || '');
          setSameAsPermanentAddress(Boolean(psh.guardianInfo.sameAsPermanentAddress));
          setCurrentGuardianAddress({
            addressType: psh.guardianInfo.currentAddress?.addressType || '',
            villageName: psh.guardianInfo.currentAddress?.villageName || '',
            postOffice: psh.guardianInfo.currentAddress?.postOffice || '',
            cityName: psh.guardianInfo.currentAddress?.cityName || '',
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
                villageName: guardian.villageName || '',
                postOffice: guardian.postOffice || '',
                cityName: guardian.cityName || '',
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
            villageName: person.villageName || '',
            postOffice: person.postOffice || '',
            cityName: person.cityName || '',
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
            villageName: sibling.villageName || '',
            postOffice: sibling.postOffice || '',
            cityName: sibling.cityName || '',
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
            villageName: w.villageName || '',
            postOffice: w.postOffice || '',
            cityName: w.cityName || '',
            colony: w.colony || '',
            district: w.district || '',
            tehsil: w.tehsil || '',
            ucNumber: w.ucNumber || '',
            ucName: w.ucName || '',
            streetNumber: w.streetNumber || '',
            houseNumber: w.houseNumber || '',
          })));
        }

        const savedResults = Array.isArray(psh.resultInfoHistory) && psh.resultInfoHistory.length > 0
          ? psh.resultInfoHistory
          : psh.resultInfo
            ? [psh.resultInfo]
            : [];
        setCounsellingEntries(
          Array.isArray(psh.counsellingEntries)
            ? psh.counsellingEntries.map((entry: Partial<GeneralCounsellingEntry>, index: number) => ({
                id: entry.id || `saved-general-counselling-${index}`,
                date: entry.date || '',
                details: entry.details || '',
              }))
            : typeof psh.counsellingReport === 'string' && psh.counsellingReport.trim()
              ? [{ id: 'saved-counselling-report', date: '', details: psh.counsellingReport }]
              : []
        );
        const normalizedResults: ResultInfoRecord[] = savedResults.map((entry: any, index: number) => ({
          id: typeof entry.id === 'string' ? entry.id : `saved-result-${index}`,
          year: getYearValue(entry.year ?? entry.examDate ?? legacyDataYear),
          school: entry.school || entry.schoolName || '',
          gradeClass: entry.gradeClass || entry.class || '',
          examDate: entry.examDate || '',
          examType: entry.examType || '',
          passingScore: entry.passingScore || '',
          subjectResults: Array.isArray(entry.subjectResults)
            ? entry.subjectResults.map((result: Partial<SubjectResultRow>, resultIndex: number) => ({
                id: result.id || `saved-result-${index}-subject-${resultIndex}`,
                subject: result.subject || '',
                obtainedMarks: result.obtainedMarks || '',
                totalMarks: result.totalMarks || '',
              }))
            : [],
        })).sort((left: ResultInfoRecord, right: ResultInfoRecord) => right.year - left.year || right.examDate.localeCompare(left.examDate));
        setResultInfoHistory(normalizedResults);
        if (normalizedResults.length > 0) {
          const latestResult = normalizedResults[0];
          setResultEntryId(latestResult.id);
          setResultSchool(latestResult.school);
          setResultClass(latestResult.gradeClass);
          setResultExamDate(latestResult.examDate);
          setResultExamType(latestResult.examType);
          setResultPassingScore(latestResult.passingScore);
          setSubjectResults(
            latestResult.subjectResults.length > 0
              ? latestResult.subjectResults
              : [{ id: `${latestResult.id}-subject`, subject: '', obtainedMarks: '', totalMarks: '' }]
          );
        } else {
          setResultEntryId('new-result');
          setResultSchool('');
          setResultClass('');
          setResultExamDate('');
          setResultExamType('');
          setResultPassingScore('');
          setSubjectResults([{ id: '1', subject: '', obtainedMarks: '', totalMarks: '' }]);
        }

        if (psh.healthCare) {
          setCheckFrequency(psh.healthCare.checkFrequency || '');
          setDisease(psh.healthCare.disease || '');
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
                  disease: entry.disease || '',
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
          setReportCategory(psh.reports.category === 'Islamic' ? 'Islamic Knowledge' : psh.reports.category || '');
          setReportDetails(psh.reports.details || '');
          setAdditionalReportEntries(
            Array.isArray(psh.reports.additionalEntries)
              ? psh.reports.additionalEntries.map((entry: Partial<ReportEntry>, index: number) => ({
                  id: entry.id || `saved-report-${index}`,
                  category: entry.category === 'Islamic' ? 'Islamic Knowledge' : entry.category || '',
                  details: entry.details || '',
                }))
              : []
          );
        }

        const savedInterestHistory = Array.isArray(psh.areaOfInterestHistory) && psh.areaOfInterestHistory.length > 0
          ? psh.areaOfInterestHistory
          : psh.areaOfInterest || (Array.isArray(psh.areaOfInterestEntries) && psh.areaOfInterestEntries.length > 0)
            ? [{
                year: legacyDataYear,
                areaOfInterest: psh.areaOfInterest || '',
                entries: psh.areaOfInterestEntries || [],
              }]
            : [];
        const normalizedInterestHistory: AreaOfInterestYearRecord[] = savedInterestHistory
          .map((entry: any, index: number) => ({
            year: getYearValue(entry.year ?? legacyDataYear),
            areaOfInterest: entry.areaOfInterest || '',
            entries: (Array.isArray(entry.entries) ? entry.entries : entry.areaOfInterestEntries || [])
              .map((interest: Partial<AreaOfInterestEntry>, interestIndex: number) => ({
                id: interest.id || `saved-interest-${index}-${interestIndex}`,
                details: interest.details || '',
              })),
          }))
          .sort((left: AreaOfInterestYearRecord, right: AreaOfInterestYearRecord) => right.year - left.year);
        setAreaOfInterestHistory(normalizedInterestHistory);
        setAreaOfInterest(normalizedInterestHistory[0]?.areaOfInterest || '');
        setAdditionalAreaOfInterestEntries(normalizedInterestHistory[0]?.entries || []);
        setProfilePhotoHistory(
          Array.isArray(psh.profilePhotoHistory)
            ? psh.profilePhotoHistory
                .filter((entry: any) => typeof entry.photo === 'string' && entry.photo)
                .map((entry: any) => ({
                  year: getYearValue(entry.year ?? legacyDataYear),
                  photo: entry.photo,
                }))
                .sort((left: ProfilePhotoYearRecord, right: ProfilePhotoYearRecord) => right.year - left.year)
            : []
        );
      }
    }
  }, [initialChild]);

  const handleClearForm = () => {
    repeatedValues.current.clear();
    setIsDemoDataLoaded(false);
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
    setDateOfBirth('');
    setGender('MALE');
    setFamilyCast('');
    setMotherLanguage('');
    setBirthDistrict('');
    setIdentificationMark('');
    setNextOfKin('');
    setIsSponsored('');
    setSponsorshipAmount('');
    setDonorName('');
    setDonorFatherName('');
    setDonorCnic('');
    setDonorMaritalStatus('');
    setDonorAddress('');
    setDonorContactNo('');
    setDonorEmail('');
    setDonorDocumentFile(null);
    setDonorDocumentPreview('');
    setSavedDonorDocumentName('');
    setSavedDonorDocumentUrl('');
    setStatus('ACTIVE');
    setDateOfStatus(new Date().toISOString().split('T')[0]);
    setStatusRemarks('');
    setDisciplinaryProceeding(createEmptyDisciplinaryProceeding());
    setDisciplinaryDraft(createEmptyDisciplinaryProceeding());
    setIsDisciplinaryProceedingsOpen(false);
    setIsDisable('No');
    setBloodGroup('');
    setMentalHealth('');
    setPhysicalHealth('');
    setVaccinationDetail('');
    setSpecialNeedDisease('');
    setAppearanceMeasurements([{
      id: '1',
      year: String(new Date().getFullYear()),
      height: '',
      weight: '',
      age: '',
    }]);
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
    setFatherVillageName('');
    setFatherPostOffice('');
    setFatherCityName('');
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
    setMotherVillageName('');
    setMotherPostOffice('');
    setMotherCityName('');
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
    setGuardianVillageName('');
    setGuardianPostOffice('');
    setGuardianCityName('');
    setGuardianColony('');
    setSameAsPermanentAddress(false);
    setCurrentGuardianAddress({
      addressType: '',
      villageName: '',
      postOffice: '',
      cityName: '',
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
    setMeetingPersons([{ id: '1', name: '', relation: '', cnic: '', contact: '', qualification: '', profession: '', dateTime: '', startDateTime: '', endDateTime: '', addressType: '', villageName: '', postOffice: '', cityName: '', colony: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setSiblings([{ id: '1', name: '', gender: '', age: '', qualification: '', profession: '', institution: '', gradeClass: '', maritalStatus: '', addressType: '', villageName: '', postOffice: '', cityName: '', colony: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setWitnesses([{ id: '1', name: '', cnic: '', fatherName: '', contact: '', qualification: '', profession: '', addressType: '', villageName: '', postOffice: '', cityName: '', colony: '', district: '', tehsil: '', ucNumber: '', ucName: '', streetNumber: '', houseNumber: '', address: '' }]);
    setResultSchool('');
    setResultClass('');
    setResultExamDate('');
    setResultExamType('');
    setResultPassingScore('');
    setResultEntryId('new-result');
    setResultInfoHistory([]);
    setCounsellingEntries([]);
    setFollowUpRecords([]);
    setCareerSetupAfterSave(false);
    setChildAfterCareerSetup(null);
    setCareerCredentialsDraft(null);
    setSubjectResults([{ id: '1', subject: '', obtainedMarks: '', totalMarks: '' }]);
    setCheckFrequency('');
    setDisease('');
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
    setAreaOfInterestHistory([]);
    setProfilePhotoHistory([]);
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
      setFullName('Muhammad Zahid');
      setBFormNo('31201-7654321-1');
      setDateOfBirth('2017-06-18');
      setGender('MALE');
      setFamilyCast('Arain');
      setMotherLanguage('Saraiki');
      setBirthDistrict('Bahawalpur');
      setIdentificationMark('Birthmark on left arm');
      setNextOfKin('Ghulam Rasool (Father)');
      setIsSponsored('SPONSORED BY PBM');
      setSponsorshipAmount('12000');
      setStatus('ACTIVE');
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

      setResultSchool('Govt Primary School Bahawalpur');
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
      setIsSponsored('');
      setSponsorshipAmount('');
      setStatus('ACTIVE');
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
      setIsSponsored('SPONSORED BY DONOR');
      setSponsorshipAmount('12000');
      setDonorName('Haji Abdul Rehman');
      setDonorFatherName('Muhammad Din');
      setDonorCnic('32304-7788990-1');
      setDonorMaritalStatus('Married');
      setStatus('ACTIVE');
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
    setIsSponsored('SPONSORED BY PBM');
    setSponsorshipAmount('15000');
    setStatus('ACTIVE');
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
          const uploadRes = await fetch('/api/pbm/children/photo', { method: 'POST', body });
          const uploadResult = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadResult.error || 'Unable to upload the child photo.');
          photoUrl = uploadResult.url;
        } catch (uploadErr) {
          throw new Error(uploadErr instanceof Error ? uploadErr.message : 'Unable to upload the child photo.');
        }
      }

      const savedAppearanceMeasurements = appearanceMeasurements
        .filter((measurement, index) =>
          measurement.height ||
          measurement.weight ||
          (index === 0 && !initialChild ? admissionAge : measurement.age)
        )
        .map((measurement, index) => ({
          id: measurement.id,
          year: getYearValue(measurement.year),
          height: measurement.height,
          weight: measurement.weight,
          age: index === 0 && !initialChild ? admissionAge : measurement.age,
          index,
        }))
        .sort((left, right) => right.year - left.year || right.index - left.index)
        .map(({ index: _index, ...measurement }) => measurement);
      const latestAppearanceMeasurement = savedAppearanceMeasurements[0] || {
        year: new Date().getFullYear(),
        height: '',
        weight: '',
        age: '',
      };
      const currentYear = new Date().getFullYear();
      const resultEntry: ResultInfoRecord = {
        id: resultEntryId,
        year: getYearValue(resultExamDate),
        school: resultSchool,
        gradeClass: resultClass,
        examDate: resultExamDate,
        examType: resultExamType,
        passingScore: resultPassingScore,
        subjectResults: subjectResults.filter((result) =>
          result.subject.trim() || result.obtainedMarks.trim() || result.totalMarks.trim()
        ),
      };
      const hasResultData = Boolean(
        resultEntry.school.trim() ||
        resultEntry.gradeClass.trim() ||
        resultEntry.examDate ||
        resultEntry.examType ||
        resultEntry.passingScore.trim() ||
        resultEntry.subjectResults.length
      );
      const nextResultInfoHistory = hasResultData
        ? [
            ...resultInfoHistory.filter((entry) => entry.id !== resultEntry.id),
            resultEntry,
          ].sort((left, right) => right.year - left.year || right.examDate.localeCompare(left.examDate))
        : resultInfoHistory;
      const currentInterestEntries = additionalAreaOfInterestEntries
        .filter((entry) => entry.details.trim())
        .map((entry) => ({ ...entry }));
      const hasInterestData = Boolean(areaOfInterest.trim() || currentInterestEntries.length);
      const nextAreaOfInterestHistory = hasInterestData
        ? mergeYearlyHistory(
            areaOfInterestHistory,
            { year: currentYear, areaOfInterest, entries: currentInterestEntries },
            currentYear
          )
        : areaOfInterestHistory;
      const legacyPhotoYear = getYearValue(initialChild?.updatedAt || initialChild?.admissionDate || initialChild?.createdAt);
      const nextProfilePhotoHistory = (profilePhotoHistory.length > 0
        ? profilePhotoHistory
        : initialChild?.photo
          ? [{ year: legacyPhotoYear, photo: initialChild.photo }]
          : []
      );
      const currentProfilePhoto = photoUrl || initialChild?.photo || null;
      const archivedProfilePhotoHistory = currentProfilePhoto
        ? mergeYearlyHistory(
            nextProfilePhotoHistory,
            { year: currentYear, photo: currentProfilePhoto },
            currentYear
          )
        : nextProfilePhotoHistory;

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
          sponsorshipAmount: isSponsored && isSponsored !== 'No' ? sponsorshipAmount : null,
          donorName: isSponsored === 'SPONSORED BY DONOR' ? donorName : null,
          donorFatherName: isSponsored === 'SPONSORED BY DONOR' ? donorFatherName : null,
          donorCnic: isSponsored === 'SPONSORED BY DONOR' ? donorCnic : null,
          donorMaritalStatus: isSponsored === 'SPONSORED BY DONOR' ? donorMaritalStatus : null,
          donorAddress: isSponsored === 'SPONSORED BY DONOR' ? donorAddress : null,
          donorContactNo: isSponsored === 'SPONSORED BY DONOR' ? donorContactNo : null,
          donorEmail: isSponsored === 'SPONSORED BY DONOR' ? donorEmail : null,
          status: disciplinaryProceeding.type || status || 'ACTIVE',
          dateOfStatus,
          statusRemarks,
        },
        disciplinaryProceedings: disciplinaryProceeding.type ? disciplinaryProceeding : null,
        donorInfo: isSponsored === 'SPONSORED BY DONOR' ? {
          name: donorName,
          fatherName: donorFatherName,
          cnic: donorCnic,
          maritalStatus: donorMaritalStatus,
          address: donorAddress,
          contactNo: donorContactNo,
          email: donorEmail,
          document: donorDocumentFile ? { fileName: donorDocumentFile.name } : savedDonorDocumentName ? { fileName: savedDonorDocumentName } : null,
        } : null,
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
        appearanceHistory: savedAppearanceMeasurements,
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
          villageName: fatherVillageName,
          postOffice: fatherPostOffice,
          cityName: fatherCityName,
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
          villageName: motherVillageName,
          postOffice: motherPostOffice,
          cityName: motherCityName,
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
          villageName: guardianVillageName,
          postOffice: guardianPostOffice,
          cityName: guardianCityName,
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
        resultInfo: nextResultInfoHistory[0] || resultEntry,
        resultInfoHistory: nextResultInfoHistory,
        counsellingEntries: counsellingEntries.filter((entry) => entry.date || entry.details.trim()),
        followUps: followUpRecords,
        healthCare: {
          checkFrequency,
          disease,
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
        areaOfInterest: nextAreaOfInterestHistory[0]?.areaOfInterest || '',
        areaOfInterestEntries: (nextAreaOfInterestHistory[0]?.entries || []).map(({ details }) => ({ details })),
        areaOfInterestHistory: nextAreaOfInterestHistory,
        profilePhotoHistory: archivedProfilePhotoHistory,
        attachmentsSummary: Object.entries(attachments).map(([key, attachment], index, entries) => {
          const sameTypeIndex = entries
            .slice(0, index)
            .filter(([, previous]) => previous.documentType === attachment.documentType).length;
          return {
            slot: key,
            title: attachment.title,
            attached: !!attachment.file || !!getSavedAttachment(attachment.documentType, sameTypeIndex),
          };
        }),
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
        status: disciplinaryProceeding.type || status || 'ACTIVE',
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

      let serverChildId: string | null = null;
      const documentUploadWarnings: string[] = [];

      const hasPersistedChildId = initialChild?.id &&
        !String(initialChild.id).startsWith('seed-') &&
        !String(initialChild.id).startsWith('demo-');
      const apiResponse = await fetch(
        hasPersistedChildId ? `/api/pbm/children/${initialChild.id}` : '/api/pbm/children',
        {
          method: hasPersistedChildId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(!hasPersistedChildId ? { 'x-pbm-admission': 'new' } : {}),
          },
          body: JSON.stringify(payload),
        }
      );
      const savedResult = await apiResponse.json();
      if (!apiResponse.ok) throw new Error(savedResult.error || 'Unable to save the child record.');
      serverChildId = savedResult.child?.id;
      if (!serverChildId) throw new Error('The server did not return the saved child record.');
      const uploadedDocuments = Array.isArray(initialChild?.documents) ? [...initialChild.documents] : [];

      const documentsToUpload = [
        { file: bFormFrontFile, title: 'B-Form Front', documentType: 'B_FORM_FRONT' },
        { file: bFormBackFile, title: 'B-Form Back', documentType: 'B_FORM_BACK' },
        ...(disciplinaryProceeding.type === 'EXPELLED' && expulsionMinutesPhotoFile
          ? [{
              file: expulsionMinutesPhotoFile,
              title: 'Minutes of the Expulsion Committee',
              documentType: 'EXPULSION_COMMITTEE_MINUTES',
            }]
          : []),
        ...(disciplinaryProceeding.type === 'DROPPED' && droppedApplicationFile
          ? [{
              file: droppedApplicationFile,
              title: 'Application',
              documentType: 'DROPPED_APPLICATION',
            }]
          : []),
        ...(disciplinaryProceeding.type === 'DROPPED' && droppedAffidavitFile
          ? [{
              file: droppedAffidavitFile,
              title: 'Affidavit',
              documentType: 'DROPPED_AFFIDAVIT',
            }]
          : []),
        ...(disciplinaryProceeding.type === 'EXPELLED' && expelledApplicationFile
          ? [{
              file: expelledApplicationFile,
              title: 'Application',
              documentType: 'EXPELLED_APPLICATION',
            }]
          : []),
        ...(disciplinaryProceeding.type === 'EXPELLED' && expelledAffidavitFile
          ? [{
              file: expelledAffidavitFile,
              title: 'Affidavit',
              documentType: 'EXPELLED_AFFIDAVIT',
            }]
          : []),
        ...Object.values(attachments).map((attachment) => ({
          file: attachment.file,
          title: attachment.title,
          documentType: attachment.documentType,
        })),
        ...(enrollmentType === 'Replace' && schoolLeavingCertificateFile
          ? [{
              file: schoolLeavingCertificateFile,
              title: 'School Leaving Certificate',
              documentType: 'SCHOOL_LEAVING_CERTIFICATE',
            }]
          : []),
        ...(isSponsored === 'SPONSORED BY DONOR' && donorDocumentFile
          ? [{
              file: donorDocumentFile,
              title: 'Donor Document / Photo',
              documentType: 'DONOR_DOCUMENT',
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
          const uploadResponse = await fetch(`/api/pbm/children/${serverChildId}/documents`, {
            method: 'POST',
            body: documentForm,
          });
          const uploadResult = await uploadResponse.json();
          if (!uploadResponse.ok) {
            const warning = uploadResult.error || `${document.title} could not be uploaded to the document vault.`;
            documentUploadWarnings.push(warning);
            console.warn(`${document.title} upload failed:`, warning);
          } else if (uploadResult.document) {
            uploadedDocuments.push(uploadResult.document);
          }
        } catch (uploadError) {
          const warning = uploadError instanceof Error
            ? uploadError.message
            : `${document.title} could not be uploaded to the document vault.`;
          documentUploadWarnings.push(warning);
          console.warn(`${document.title} upload failed:`, uploadError);
        }
      }

      const savedPayload = { ...payload, id: serverChildId, documents: uploadedDocuments };
      const successMessage = initialChild
          ? `Record for ${payload.fullName} (${payload.admissionNo}) updated successfully!`
          : `Child ${payload.fullName} enrolled into Pakistan Sweet Home Multan successfully!`;
      setFormSuccess(
        documentUploadWarnings.length > 0
          ? `${successMessage} Document upload warning: ${documentUploadWarnings.join(' ')}`
          : successMessage
      );
      if (careerSetupAfterSave) {
        setCareerAccountChildId(serverChildId);
        setChildAfterCareerSetup(savedPayload);
        setCareerSetupAfterSave(false);
        try {
          if (!careerCredentialsDraft) {
            throw new Error('Career username and password are missing. Reopen Professional Career Setup to enter them.');
          }
          const accountResponse = await fetch(`/api/pbm/children/${serverChildId}/career-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(careerCredentialsDraft),
          });
          const accountResult = await accountResponse.json();
          if (!accountResponse.ok) {
            throw new Error(accountResult.error || 'Unable to create career login.');
          }
          setCareerCredentialsDraft({
            ...careerCredentialsDraft,
            username: accountResult.account.username,
          });
        } catch (accountError: unknown) {
          setFormError(
            `The child dossier was saved, but career login setup needs attention: ${
              accountError instanceof Error ? accountError.message : 'Unable to create career login.'
            }`
          );
        }
        setIsProfessionalCareerOpen(true);
        return;
      }
      setTimeout(() => {
        onSuccess(savedPayload);
      }, documentUploadWarnings.length > 0 ? 4000 : 900);
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err instanceof Error ? err.message : 'Network error during child admission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onChangeCapture={handleRepeatedFieldChange}
      onFocusCapture={handleRepeatedFieldFocus}
      data-repeatable-field-group={repeatableFieldGroupId}
      className="space-y-6 text-slate-800"
    >
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-3 sm:p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => {
                handleAutoFillDemo('orphan');
                setIsDemoDataLoaded(true);
                setFormError(null);
                setFormSuccess(null);
              }}
              disabled={isSubmitting || Boolean(initialChild)}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-violet-300 bg-violet-600 px-2 py-2 text-center text-[11px] font-bold leading-tight text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-3"
              title={initialChild ? 'Demo data is available only when creating a new child dossier' : 'Fill this form with sample data to demonstrate it'}
            >
              <Sparkles className="h-4 w-4" />
              Demo Data
            </button>
            <button
              type="button"
              onClick={() => openCareerAccountSetup()}
              disabled={isSubmitting}
              className="col-span-2 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-2 py-2 text-center text-[11px] font-bold leading-tight text-emerald-800 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50 sm:col-span-1 sm:w-auto sm:px-3"
            >
              <Award className="h-4 w-4" />
              Professional Career Setup
            </button>
            {initialChild && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="col-span-2 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 sm:col-span-1 sm:w-auto sm:px-3 sm:py-1.5"
              >
                ✕ Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleClearForm}
              className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 sm:w-auto sm:px-3 sm:py-1.5"
              title="Reset all form fields"
            >
              🧹 Clear Form
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="grid grid-cols-2 items-center gap-2 text-xs sm:flex sm:flex-wrap">
            <span className="col-span-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:col-span-1">
              Quick Presets:
            </span>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('orphan')}
              className="min-h-10 rounded-lg bg-amber-500 px-2 py-1.5 text-center font-bold text-white shadow-sm transition hover:bg-amber-600 sm:px-2.5"
            >
              ⚡ Orphan
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('poor')}
              className="min-h-10 rounded-lg bg-emerald-600 px-2 py-1.5 text-center font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:px-2.5"
            >
              ⚡ Poorest of Poor
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('replace')}
              className="min-h-10 rounded-lg bg-sky-600 px-2 py-1.5 text-center font-bold text-white shadow-sm transition hover:bg-sky-700 sm:px-2.5"
            >
              ⚡ Replace Seat
            </button>
          </div>
        </div>
      </div>

      {isDemoDataLoaded && (
        <p role="status" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-xs font-semibold text-violet-800">
          Sample demo data is loaded for presentation only. It has not been saved; do not save this example as a real child record.
        </p>
      )}

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
              currentPhoto={initialChild?.photo}
              onFileSelected={(file) => setProfilePhotoFile(file)}
              onRemove={() => setProfilePhotoFile(null)}
              disabled={isSubmitting}
            />
            {profilePhotoHistory.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {profilePhotoHistory.map((entry) => {
                  const photoSrc = childPhotoDisplaySrc(entry.photo);
                  return photoSrc ? (
                    <div key={entry.year} className="w-12">
                      <img
                        src={photoSrc}
                        alt={`Profile photo from ${entry.year}`}
                        className="h-14 w-12 rounded border border-slate-200 object-cover"
                      />
                      <p className="mt-0.5 text-center text-[10px] text-slate-500">{entry.year}</p>
                    </div>
                  ) : null;
                })}
              </div>
            )}
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
          <FormInput
            label={initialChild && gender.toUpperCase() !== 'MALE' ? 'Gender (saved record)' : 'Gender'}
            value={gender.toUpperCase() === 'MALE' ? 'Male' : gender}
            onChange={() => {}}
            readOnly
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
            options={['SPONSORED BY PBM', 'SPONSORED BY DONOR']}
          />

          {/* Row 5 */}
          <FormInput
            placeholder="Sponsorship Amount"
            value={sponsorshipAmount}
            onChange={(e) => setSponsorshipAmount(e.target.value)}
            disabled={!isSponsored || isSponsored === 'No'}
          />

          {/* Dynamic Donor Form: Appears when SPONSORED BY DONOR is selected */}
          {isSponsored === 'SPONSORED BY DONOR' && (
            <div className="md:col-span-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 border-2 border-indigo-200/90 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <HeartHandshake className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Donor Information</h4>
                    <p className="text-[11px] text-slate-500">Provide personal and identification details of the sponsoring donor</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Donor Sponsered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <FormInput
                  label="Donor Name"
                  placeholder="Donor Full Name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required={isSponsored === 'SPONSORED BY DONOR'}
                />
                <FormInput
                  label="Father Name"
                  placeholder="Father Name"
                  value={donorFatherName}
                  onChange={(e) => setDonorFatherName(e.target.value)}
                  required={isSponsored === 'SPONSORED BY DONOR'}
                />
                <FormInput
                  label="ID Card No"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={donorCnic}
                  onChange={(e) => setDonorCnic(formatCNIC(e.target.value))}
                  maxLength={15}
                  required={isSponsored === 'SPONSORED BY DONOR'}
                />
                <FormSelect
                  label="Marital Status"
                  value={donorMaritalStatus}
                  onChange={(e) => setDonorMaritalStatus(e.target.value)}
                  options={['Single', 'Married', 'Divorced', 'Widow']}
                  required={isSponsored === 'SPONSORED BY DONOR'}
                />

                {/* Additional Requested Fields: Address, Contact No, Email */}
                <FormInput
                  label="Address"
                  placeholder="Residential Address"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  className="sm:col-span-2"
                />
                <FormInput
                  label="Contact No."
                  placeholder="03XX-XXXXXXX"
                  value={donorContactNo}
                  onChange={(e) => setDonorContactNo(formatPhone(e.target.value))}
                  maxLength={12}
                />
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="donor@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />

                {/* Document / Photo Upload */}
                <div className="sm:col-span-2 lg:col-span-4 pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Donor Document / Photo (شناختی دستاویز یا تصویر)
                    </label>
                    <p className="text-[11px] text-slate-500">Upload CNIC copy, photo, or pledge document (Image or PDF)</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-indigo-200 shadow-xs">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <span>{donorDocumentFile || savedDonorDocumentName ? 'Change File' : 'Upload Document / Photo'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setDonorDocumentFile(f);
                          if (f && f.type.startsWith('image/')) {
                            setDonorDocumentPreview(URL.createObjectURL(f));
                          } else {
                            setDonorDocumentPreview('');
                          }
                        }}
                      />
                    </label>
                    {(donorDocumentFile || savedDonorDocumentName) && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                        {donorDocumentPreview ? (
                          <img src={donorDocumentPreview} alt="Preview" className="w-5 h-5 rounded object-cover border border-emerald-300" />
                        ) : (
                          <FileText className="w-4 h-4 text-emerald-600" />
                        )}
                        <span className="max-w-[200px] truncate">{donorDocumentFile?.name || savedDonorDocumentName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDonorDocumentFile(null);
                            setDonorDocumentPreview('');
                            setSavedDonorDocumentName('');
                            setSavedDonorDocumentUrl('');
                          }}
                          className="text-red-500 hover:text-red-700 ml-1"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <FormSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: 'REGULAR', value: 'ACTIVE' },
              { label: 'PASSOUT', value: 'PASSOUT' },
            ]}
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
                      href={`/api/pbm/children/${initialChild.id}/documents?documentId=${savedDocument.id}`}
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
                <span className="text-xs font-semibold text-slate-600">
                  Appearance Entry {measurement.year || index + 1}
                </span>
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
              <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-4">
                <FormInput
                  label="Year"
                  name={`appearance-year-${measurement.id}`}
                  type="number"
                  min={measurement.year && Number(measurement.year) < 2010 ? Number(measurement.year) : 2010}
                  max={new Date().getFullYear() + 1}
                  value={measurement.year}
                  onChange={(e) => updateAppearanceMeasurement(measurement.id, 'year', e.target.value)}
                />
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
                  label={index === 0 && !initialChild ? 'Age at Admission' : 'Age'}
                  name={`age-${measurement.id}`}
                  type={index === 0 && !initialChild ? 'text' : 'number'}
                  min={index === 0 && !initialChild ? undefined : 0}
                  step={index === 0 && !initialChild ? undefined : '1'}
                  value={index === 0 && !initialChild ? admissionAge : measurement.age}
                  readOnly={index === 0 && !initialChild}
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
                villageName: fatherVillageName,
                postOffice: fatherPostOffice,
                cityName: fatherCityName,
                colony: fatherColony,
                district: fatherDistrict,
                tehsil: fatherTehsil,
                ucNumber: fatherUcNumber,
                ucName: fatherUcName,
                streetNumber: fatherStreetNumber,
                houseNumber: fatherHouseNumber,
                address: fatherAddress,
              }}
              onChange={(field, value) => field === 'address'
                ? setFatherAddress(value)
                : updateParentAddressPart('father', field, value)}
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
                villageName: motherVillageName,
                postOffice: motherPostOffice,
                cityName: motherCityName,
                colony: motherColony,
                district: motherDistrict,
                tehsil: motherTehsil,
                ucNumber: motherUcNumber,
                ucName: motherUcName,
                streetNumber: motherStreetNumber,
                houseNumber: motherHouseNumber,
                address: motherAddress,
              }}
              onChange={(field, value) => field === 'address'
                ? setMotherAddress(value)
                : updateParentAddressPart('mother', field, value)}
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
                      villageName: s.villageName || '',
                      postOffice: s.postOffice || '',
                      cityName: s.cityName || '',
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
                          villageName: s.marriedVillageName || '',
                          postOffice: s.marriedPostOffice || '',
                          cityName: s.marriedCityName || '',
                          colony: s.marriedColony || '',
                          district: s.marriedDistrict || '',
                          tehsil: s.marriedTehsil || '',
                          ucNumber: s.marriedUcNumber || '',
                          ucName: s.marriedUcName || '',
                          streetNumber: s.marriedStreetNumber || '',
                          houseNumber: s.marriedHouseNumber || '',
                          address: s.marriedAddress || '',
                        }}
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
              values={{
                addressType: guardianAddressType,
                villageName: guardianVillageName,
                postOffice: guardianPostOffice,
                cityName: guardianCityName,
                colony: guardianColony,
                district: guardianDistrict,
                tehsil: guardianTehsil,
                ucNumber: guardianUcNumber,
                ucName: guardianUcName,
                streetNumber: guardianStreetNumber,
                houseNumber: guardianHouseNumber,
                address: guardianAddress,
              }}
              onChange={(field, value) => field === 'address'
                ? setGuardianAddress(value)
                : updatePermanentGuardianAddressPart(field, value)}
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
                    villageName: guardian.villageName || '',
                    postOffice: guardian.postOffice || '',
                    cityName: guardian.cityName || '',
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
                      villageName: p.villageName || '',
                      postOffice: p.postOffice || '',
                      cityName: p.cityName || '',
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
                      villageName: w.villageName || '',
                      postOffice: w.postOffice || '',
                      cityName: w.cityName || '',
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
        <div className="flex items-start justify-between gap-3">
          <SectionHeading step={11} title="Result Info" isCompleted={completionStats.isResultComplete} />
          <button
            type="button"
            onClick={startNewResultEntry}
            className="inline-flex shrink-0 items-center gap-1 rounded bg-[#0D5C3A] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#0b4d30]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Test Record
          </button>
        </div>
        {resultInfoHistory.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Saved test history</p>
            {resultInfoHistory.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">
                    {entry.year} · {entry.examType || 'Exam'}{entry.examDate ? ` · ${entry.examDate}` : ''}
                  </p>
                  <p className="text-slate-600">
                    {entry.school || 'School not recorded'}{entry.gradeClass ? ` · ${entry.gradeClass}` : ''}
                    {entry.subjectResults.length ? ` · ${entry.subjectResults.length} subjects` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => editResultEntry(entry)}
                  className="rounded border border-blue-200 bg-white px-2.5 py-1 font-semibold text-blue-800 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
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
            options={['Daily Test', 'Monthly Test', 'Monthly Assessment', 'Mid-Term', 'Annual', 'Entry Test']}
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
        <section className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Counselling</h3>
              <p className="mt-1 text-xs text-slate-600">Record teacher counselling dates and reports.</p>
            </div>
            <button
              type="button"
              onClick={() => setCounsellingEntries((current) => [
                ...current,
                { id: `${Date.now()}-${current.length}`, date: '', details: '' },
              ])}
              className="inline-flex items-center gap-1 rounded bg-[#0D5C3A] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#0b4d30]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New
            </button>
          </div>
          {counsellingEntries.length === 0 ? (
            <p className="text-xs text-slate-500">No counselling entries added.</p>
          ) : (
            <div className="space-y-3">
              {counsellingEntries.map((entry, index) => (
                <div key={entry.id} className="grid gap-3 rounded-lg border border-indigo-100 bg-white p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start">
                  <label className="block text-xs font-semibold text-slate-700">
                    Counselling Date
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(event) => setCounsellingEntries((current) => current.map((item) =>
                        item.id === entry.id ? { ...item, date: event.target.value } : item
                      ))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Counselling Details
                    <textarea
                      rows={3}
                      maxLength={3000}
                      value={entry.details}
                      onChange={(event) => setCounsellingEntries((current) => current.map((item) =>
                        item.id === entry.id ? { ...item, details: event.target.value } : item
                      ))}
                      placeholder={`Teacher counselling report ${index + 1}`}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCounsellingEntries((current) => current.filter((item) => item.id !== entry.id))}
                    aria-label={`Remove counselling entry ${index + 1}`}
                    className="mt-5 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
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
            options={['Daily', 'Weekly', 'Monthly', 'Annual', 'Bi-Annual']}
          />
          <FormInput
            placeholder="Disease"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
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
                options={['Daily', 'Weekly', 'Monthly', 'Annual', 'Bi-Annual']}
              />
              <FormInput
                placeholder="Disease"
                value={entry.disease}
                onChange={(e) => updateHealthCareEntry(entry.id, 'disease', e.target.value)}
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
            options={['Discipline', 'Behavior', 'Academic', 'Psychological', 'Islamic Knowledge']}
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
                options={['Discipline', 'Behavior', 'Academic', 'Psychological', 'Islamic Knowledge']}
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
        {areaOfInterestHistory.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Saved yearly interest history</p>
            {areaOfInterestHistory.map((entry) => (
              <div key={entry.year} className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-xs font-bold text-amber-900">{entry.year}</p>
                {entry.areaOfInterest && (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">{entry.areaOfInterest}</p>
                )}
                {entry.entries.map((interest, index) => (
                  <p key={interest.id || `${entry.year}-${index}`} className="mt-1 whitespace-pre-wrap text-xs text-slate-700">
                    {interest.details}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= 15. ATTACHMENTS (FINAL SECTION) ================= */}
      <div>
        <SectionHeading step={15} title="Mandatory Attachments & Verification" isCompleted={completionStats.isAttachmentsComplete} />
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="text-xs font-semibold text-slate-700">
            Add another document
            <select
              value={newAttachmentType}
              onChange={(event) => setNewAttachmentType(event.target.value)}
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:min-w-64"
            >
              <option value="">Choose document type</option>
              {ATTACHMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.documentType} value={option.documentType}>{option.title}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={addAttachment}
            disabled={isSubmitting || !newAttachmentType}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5">
          {Object.entries(attachments).map(([key, item], attachmentIndex, entries) => {
            const sameTypeIndex = entries
              .slice(0, attachmentIndex)
              .filter(([, previous]) => previous.documentType === item.documentType).length;
            const savedDocument = getSavedAttachment(item.documentType, sameTypeIndex);
            const isAdditional = key.startsWith('additional-');

            return (
              <div key={key} className="p-3 border border-slate-700 rounded-lg bg-white flex flex-col justify-between gap-2 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">{item.title}</span>
                  {isAdditional && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setAttachments((current) => {
                        const next = { ...current };
                        delete next[key];
                        return next;
                      })}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                      aria-label={`Remove ${item.title}`}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!item.file && savedDocument && initialChild?.id && (
                  <a
                    href={`/api/pbm/children/${initialChild.id}/documents?documentId=${savedDocument.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-700 hover:underline"
                  >
                    View saved file: {savedDocument.title}
                  </a>
                )}

                <div className="flex items-center justify-between pt-1 gap-1">
                  {item.file ? (
                    <span className="text-xs text-emerald-700 font-semibold truncate max-w-[110px]">
                      ✓ {item.file.name}
                    </span>
                  ) : savedDocument ? (
                    <span className="text-xs text-emerald-700 font-semibold">✓ Saved</span>
                  ) : (
                    <span className="text-[11px] text-slate-400">No file chosen</span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    <label className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium cursor-pointer transition-colors">
                      <span>Browse</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
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
            );
          })}
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      {careerSetupAfterSave && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Career username and password are ready. Save the child dossier to activate the account and generate its login link.
        </p>
      )}
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
          onClick={openDisciplinaryProceedingsForm}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-red-300 bg-red-50 text-red-800 text-xs sm:text-sm font-bold hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
        >
          Disciplinary Proceedings{disciplinaryProceeding.type ? ` (${disciplinaryProceeding.type})` : ''}
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

      {isDisciplinaryProceedingsOpen && createPortal(
        <div data-repeatable-field-group={repeatableFieldGroupId} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disciplinary-proceedings-title"
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="disciplinary-proceedings-title" className="text-lg font-bold text-slate-900">
                  Disciplinary Proceedings
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  These details are saved with the child dossier when you save the dossier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDisciplinaryProceedingsOpen(false)}
                className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close disciplinary proceedings form"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormSelect
                label="Proceeding Type"
                value={disciplinaryDraft.type}
                onChange={(event) => setDisciplinaryDraft((current) => ({
                  ...current,
                  type: event.target.value as DisciplinaryProceedingRecord['type'],
                }))}
                options={[
                  { label: 'DROPPED', value: 'DROPPED' },
                  { label: 'EXPELLED', value: 'EXPELLED' },
                ]}
                required
              />
            </div>

            {disciplinaryDraft.type === 'EXPELLED' ? (
              <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {([
                  ['name', 'Name'],
                  ['fatherName', 'Father Name'],
                  ['pshName', 'PBM Sweet Home'],
                  ['pshRegistrationNumber', 'PBM Registration No.'],
                  ['className', 'Class'],
                  ['rollNumber', 'Roll No.'],
                  ['instituteName', 'Institute'],
                  ['totalMarks', 'Total Marks'],
                  ['obtainedMarks', 'Obtained Marks'],
                  ['reason', 'Reason of Expulsion'],
                  ['date', 'Date of Expulsion'],
                  ['remarks', 'Remarks'],
                ] as const).map(([field, label]) => (
                  <FormInput
                    key={field}
                    label={label}
                    type={field === 'date' ? 'date' : field === 'totalMarks' || field === 'obtainedMarks' ? 'number' : 'text'}
                    min={field === 'totalMarks' || field === 'obtainedMarks' ? 0 : undefined}
                    value={disciplinaryDraft[field]}
                    onChange={(event) => setDisciplinaryDraft((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))}
                  />
                ))}
                <FormSelect
                  label="Approved"
                  value={disciplinaryDraft.approved}
                  onChange={(event) => setDisciplinaryDraft((current) => ({
                    ...current,
                    approved: event.target.value,
                  }))}
                  options={['Yes', 'No']}
                />
                <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 sm:col-span-2 lg:col-span-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Counselling</h3>
                      <p className="mt-1 text-xs font-normal text-slate-600">Record counselling dates and details.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDisciplinaryDraft((current) => ({
                        ...current,
                        counsellingEntries: [
                          ...current.counsellingEntries,
                          { id: `${Date.now()}-${current.counsellingEntries.length}`, date: '', details: '' },
                        ],
                      }))}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add New
                    </button>
                  </div>
                  {disciplinaryDraft.counsellingEntries.length === 0 ? (
                    <p className="text-xs text-slate-500">No counselling entries added.</p>
                  ) : (
                    <div className="space-y-3">
                      {disciplinaryDraft.counsellingEntries.map((entry, index) => (
                        <div key={entry.id} className="grid gap-3 rounded-lg border border-indigo-100 bg-white p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start">
                          <label className="block text-xs font-semibold text-slate-700">
                            Counselling Date
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(event) => setDisciplinaryDraft((current) => ({
                                ...current,
                                counsellingEntries: current.counsellingEntries.map((item) =>
                                  item.id === entry.id ? { ...item, date: event.target.value } : item
                                ),
                              }))}
                              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Counselling Details
                            <textarea
                              rows={3}
                              maxLength={3000}
                              value={entry.details}
                              onChange={(event) => setDisciplinaryDraft((current) => ({
                                ...current,
                                counsellingEntries: current.counsellingEntries.map((item) =>
                                  item.id === entry.id ? { ...item, details: event.target.value } : item
                                ),
                              }))}
                              placeholder={`Counselling details ${index + 1}`}
                              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setDisciplinaryDraft((current) => ({
                              ...current,
                              counsellingEntries: current.counsellingEntries.filter((item) => item.id !== entry.id),
                            }))}
                            aria-label={`Remove counselling entry ${index + 1}`}
                            className="mt-5 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
                  Minutes of the Expulsion Committee
                  <textarea
                    rows={4}
                    maxLength={5000}
                    value={disciplinaryDraft.expulsionCommitteeMinutes}
                    onChange={(event) => setDisciplinaryDraft((current) => ({
                      ...current,
                      expulsionCommitteeMinutes: event.target.value,
                    }))}
                    placeholder="Enter the written minutes of the expulsion committee"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">
                  Upload Photo of Written Minutes
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setExpulsionMinutesPhotoError('');
                      if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                        setExpulsionMinutesPhotoError('Choose a JPEG, PNG, or WebP photo.');
                        setExpulsionMinutesPhotoFile(null);
                        event.target.value = '';
                        return;
                      }
                      if (file && file.size > 8 * 1024 * 1024) {
                        setExpulsionMinutesPhotoError('Choose a photo no larger than 8 MB.');
                        setExpulsionMinutesPhotoFile(null);
                        event.target.value = '';
                        return;
                      }
                      setExpulsionMinutesPhotoFile(file);
                    }}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-red-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-red-800"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    JPEG, PNG, or WebP; maximum 8 MB.
                    {expulsionMinutesPhotoFile ? ` Selected: ${expulsionMinutesPhotoFile.name}` : ''}
                  </span>
                  {expulsionMinutesPhotoError && (
                    <span role="alert" className="mt-1 block text-xs font-semibold text-red-700">{expulsionMinutesPhotoError}</span>
                  )}
                  {getSavedDocument('EXPULSION_COMMITTEE_MINUTES') && (
                    <a
                      href={`/api/pbm/children/${initialChild?.id}/documents?documentId=${getSavedDocument('EXPULSION_COMMITTEE_MINUTES').id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-bold text-red-700 underline"
                    >
                      View previously uploaded minutes photo
                    </a>
                  )}
                </label>
                <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:col-span-2 lg:col-span-3">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Attachments</h3>
                    <p className="mt-1 text-xs font-normal text-slate-600">Upload an application and affidavit (PDF or image, up to 12 MB each).</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {([
                      { title: 'Application', documentType: 'EXPELLED_APPLICATION', file: expelledApplicationFile, setFile: setExpelledApplicationFile },
                      { title: 'Affidavit', documentType: 'EXPELLED_AFFIDAVIT', file: expelledAffidavitFile, setFile: setExpelledAffidavitFile },
                    ] as const).map((attachment) => {
                      const savedDocument = getSavedDocument(attachment.documentType);
                      return (
                        <label key={attachment.documentType} className="block text-sm font-semibold text-slate-700">
                          {attachment.title}
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setExpelledAttachmentError('');
                              if (file && !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                setExpelledAttachmentError('Choose a PDF, JPEG, PNG, or WebP file.');
                                attachment.setFile(null);
                                event.target.value = '';
                                return;
                              }
                              if (file && file.size > 12 * 1024 * 1024) {
                                setExpelledAttachmentError('Each attachment must be no larger than 12 MB.');
                                attachment.setFile(null);
                                event.target.value = '';
                                return;
                              }
                              attachment.setFile(file);
                            }}
                            className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-normal text-slate-900 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-amber-900"
                          />
                          {attachment.file && <span className="mt-1 block text-xs font-normal text-slate-500">{attachment.file.name}</span>}
                          {savedDocument && (
                            <a
                              href={`/api/pbm/children/${initialChild?.id}/documents?documentId=${savedDocument.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-xs font-bold text-amber-800 underline"
                            >
                              View previously uploaded {attachment.title.toLowerCase()}
                            </a>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {expelledAttachmentError && (
                    <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{expelledAttachmentError}</p>
                  )}
                </section>
              </div>
            ) : disciplinaryDraft.type === 'DROPPED' ? (
              <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {([
                  ['name', 'Name'],
                  ['fatherName', 'Father Name'],
                  ['pshName', 'PBM Sweet Home'],
                  ['pshRegistrationNumber', 'PBM Registration No.'],
                  ['className', 'Class'],
                  ['classSection', 'Section'],
                  ['rollNumber', 'Roll No.'],
                  ['attendance', 'Attendance'],
                  ['instituteName', 'Institute'],
                  ['totalMarks', 'Total Marks'],
                  ['obtainedMarks', 'Obtained Marks'],
                  ['date', 'Date of Dropped out'],
                  ['reason', 'Reason of Dropped out'],
                  ['remarks', 'Remarks'],
                ] as const).map(([field, label]) => (
                  <FormInput
                    key={field}
                    label={label}
                    type={field === 'date' ? 'date' : field === 'totalMarks' || field === 'obtainedMarks' ? 'number' : 'text'}
                    min={field === 'totalMarks' || field === 'obtainedMarks' ? 0 : undefined}
                    value={disciplinaryDraft[field]}
                    onChange={(event) => setDisciplinaryDraft((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))}
                  />
                ))}
                <FormSelect
                  label="Approved"
                  value={disciplinaryDraft.approved}
                  onChange={(event) => setDisciplinaryDraft((current) => ({
                    ...current,
                    approved: event.target.value,
                  }))}
                  options={['Yes', 'No']}
                />
                <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 sm:col-span-2 lg:col-span-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Counselling</h3>
                      <p className="mt-1 text-xs font-normal text-slate-600">Record counselling dates and details.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDisciplinaryDraft((current) => ({
                        ...current,
                        counsellingEntries: [
                          ...current.counsellingEntries,
                          { id: `${Date.now()}-${current.counsellingEntries.length}`, date: '', details: '' },
                        ],
                      }))}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-800"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add New
                    </button>
                  </div>
                  {disciplinaryDraft.counsellingEntries.length === 0 ? (
                    <p className="text-xs text-slate-500">No counselling entries added.</p>
                  ) : (
                    <div className="space-y-3">
                      {disciplinaryDraft.counsellingEntries.map((entry, index) => (
                        <div key={entry.id} className="grid gap-3 rounded-lg border border-indigo-100 bg-white p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start">
                          <label className="block text-xs font-semibold text-slate-700">
                            Counselling Date
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(event) => setDisciplinaryDraft((current) => ({
                                ...current,
                                counsellingEntries: current.counsellingEntries.map((item) =>
                                  item.id === entry.id ? { ...item, date: event.target.value } : item
                                ),
                              }))}
                              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-700">
                            Counselling Details
                            <textarea
                              rows={3}
                              maxLength={3000}
                              value={entry.details}
                              onChange={(event) => setDisciplinaryDraft((current) => ({
                                ...current,
                                counsellingEntries: current.counsellingEntries.map((item) =>
                                  item.id === entry.id ? { ...item, details: event.target.value } : item
                                ),
                              }))}
                              placeholder={`Counselling details ${index + 1}`}
                              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setDisciplinaryDraft((current) => ({
                              ...current,
                              counsellingEntries: current.counsellingEntries.filter((item) => item.id !== entry.id),
                            }))}
                            aria-label={`Remove counselling entry ${index + 1}`}
                            className="mt-5 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:col-span-2 lg:col-span-3">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Attachments</h3>
                    <p className="mt-1 text-xs font-normal text-slate-600">Upload an application and affidavit (PDF or image, up to 12 MB each).</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {([
                      { title: 'Application', documentType: 'DROPPED_APPLICATION', file: droppedApplicationFile, setFile: setDroppedApplicationFile },
                      { title: 'Affidavit', documentType: 'DROPPED_AFFIDAVIT', file: droppedAffidavitFile, setFile: setDroppedAffidavitFile },
                    ] as const).map((attachment) => {
                      const savedDocument = getSavedDocument(attachment.documentType);
                      return (
                        <label key={attachment.documentType} className="block text-sm font-semibold text-slate-700">
                          {attachment.title}
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setDroppedAttachmentError('');
                              if (file && !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                setDroppedAttachmentError('Choose a PDF, JPEG, PNG, or WebP file.');
                                attachment.setFile(null);
                                event.target.value = '';
                                return;
                              }
                              if (file && file.size > 12 * 1024 * 1024) {
                                setDroppedAttachmentError('Each attachment must be no larger than 12 MB.');
                                attachment.setFile(null);
                                event.target.value = '';
                                return;
                              }
                              attachment.setFile(file);
                            }}
                            className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-normal text-slate-900 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-amber-900"
                          />
                          {attachment.file && <span className="mt-1 block text-xs font-normal text-slate-500">{attachment.file.name}</span>}
                          {savedDocument && (
                            <a
                              href={`/api/pbm/children/${initialChild?.id}/documents?documentId=${savedDocument.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-xs font-bold text-amber-800 underline"
                            >
                              View previously uploaded {attachment.title.toLowerCase()}
                            </a>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {droppedAttachmentError && (
                    <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{droppedAttachmentError}</p>
                  )}
                </section>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsDisciplinaryProceedingsOpen(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDisciplinaryProceeding}
                disabled={!disciplinaryDraft.type || isSubmitting}
                className="rounded-lg bg-red-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Proceedings
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ProfessionalCareerAccountModal
        isOpen={isProfessionalCareerOpen}
        childId={careerAccountChildId || persistedInitialChildId}
        childName={fullName}
        initialCredentials={careerCredentialsDraft || undefined}
        onSetupDraft={(credentials) => {
          setCareerCredentialsDraft(credentials);
          setCareerSetupAfterSave(true);
          setIsProfessionalCareerOpen(false);
        }}
        onClose={closeCareerAccountSetup}
      />

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
