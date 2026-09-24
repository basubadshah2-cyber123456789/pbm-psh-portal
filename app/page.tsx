'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  FileText,
  Printer,
  X,
  CheckCircle,
  Users,
  Eye,
  Trash2,
  Edit,
  Calendar,
  Phone,
  MapPin,
  Heart,
  Award,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  CreditCard,
  UserCheck,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AddPSHForm } from '@/components/children/AddPSHForm';

// ================= TYPES =================
export interface EnrolledChild {
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
  allergies?: string;
  chronicConditions?: string;
  heightCm?: number;
  weightKg?: number;
  notes?: string;
}

// ================= REALISTIC DEFAULT SEED CHILDREN DATA =================
const DEFAULT_SEED_CHILDREN: EnrolledChild[] = [
  {
    id: 'seed-01',
    admissionNo: 'ADM-2026-101',
    fullName: 'Muhammad Ali Khan',
    fatherGuardianName: 'Muhammad Tariq Khan (Late)',
    dateOfBirth: '2016-04-12',
    gender: 'MALE',
    bFormNo: '36302-1234567-1',
    admissionDate: '2026-09-01',
    guardianName: 'Rashid Mehmood',
    guardianRelation: 'Paternal Uncle (Chacha)',
    guardianContact: '0301-5554321',
    address: 'Mohallah Gulgasht, Multan, Punjab',
    photo: null,
    status: 'Active',
    bloodGroup: 'B+',
    allergies: 'None',
    chronicConditions: 'None',
    heightCm: 135,
    weightKg: 30,
    notes: JSON.stringify({
      enrollmentType: { type: 'New Enrollment', replacedRegistrationNo: null },
      category: { type: 'Orphan' },
      basicInfo: {
        registrationNo: 'ADM-2026-101',
        admissionDate: '2026-09-01',
        fullName: 'Muhammad Ali Khan',
        bFormNo: '36302-1234567-1',
        dateOfBirth: '2016-04-12',
        gender: 'MALE',
        familyCast: 'Rajput',
        motherLanguage: 'Urdu / Saraiki',
        birthDistrict: 'Multan',
        identificationMark: 'Mole on right cheek',
        nextOfKin: 'Rashid Mehmood (Uncle)',
        isSponsored: 'Yes',
        sponsorshipAmount: '15000',
        status: 'Active',
        dateOfStatus: '2026-09-01',
        statusRemarks: 'Enrolled under regular welfare quota',
      },
      healthInfo: {
        isDisable: 'No',
        bloodGroup: 'B+',
        mentalHealth: 'Normal & Active',
        physicalHealth: 'Fit',
        vaccinationDetail: 'Complete EPI Schedule',
        specialNeedDisease: 'None',
      },
      fatherInfo: {
        name: 'Muhammad Tariq Khan (Late)',
        cnic: '36302-9876543-1',
        contact: '0300-1234567',
        isAlive: 'No',
        dob: '1982-03-10',
        dod: '2022-11-15',
        qualification: 'Matric',
        profession: 'Laborer',
        district: 'Multan',
        tehsil: 'Multan City',
        streetNumber: 'Street 04',
        houseNumber: 'House 12-A',
        ucNumber: 'UC-14',
        address: 'Mohallah Gulgasht, Multan',
      },
      motherInfo: {
        name: 'Parveen Bibi',
        cnic: '36302-7654321-2',
        contact: '0312-9876543',
        isAlive: 'Yes',
        dob: '1987-08-20',
        dod: null,
        qualification: 'Primary',
        profession: 'Housewife',
        district: 'Multan',
        tehsil: 'Multan City',
        streetNumber: 'Street 04',
        houseNumber: 'House 12-A',
        ucNumber: 'UC-14',
        address: 'Mohallah Gulgasht, Multan',
      },
      guardianInfo: {
        name: 'Rashid Mehmood',
        relation: 'Paternal Uncle (Chacha)',
        contact: '0301-5554321',
        cnic: '36302-4567890-3',
        qualification: 'Intermediate (FA)',
        profession: 'Shopkeeper',
        address: 'Main Bazaar, Eidgah Road, Multan',
      },
      meetingPersons: [
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
      ],
      siblings: [
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
      ],
      witnesses: [
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
      ],
      resultInfo: {
        school: 'Govt Primary School No. 1 Multan',
        gradeClass: 'Grade 4',
        examDate: '2026-03-20',
        examType: 'Annual Examination',
        passingScore: '82% (A Grade)',
        subjectResults: [
          { id: '1', subject: 'Mathematics', obtainedMarks: '88', totalMarks: '100' },
          { id: '2', subject: 'English', obtainedMarks: '82', totalMarks: '100' },
          { id: '3', subject: 'Urdu', obtainedMarks: '85', totalMarks: '100' },
          { id: '4', subject: 'General Science', obtainedMarks: '79', totalMarks: '100' },
          { id: '5', subject: 'Islamiat', obtainedMarks: '94', totalMarks: '100' },
        ],
      },
      healthCare: {
        checkFrequency: 'Monthly',
        medicineDetails: 'Daily Multivitamins & Iron Syrup',
        antibioticMedicine: 'None',
      },
      reports: {
        category: 'Academic',
        details: 'The child shows strong potential in science and mathematics. Good discipline and respectful behavior.',
      },
      areaOfInterest: 'Cricket, Computer Studies, and Islamic Studies.',
      attachmentsSummary: [
        { slot: 'profilePic', title: 'Profile Pic', attached: true },
        { slot: 'motherCnic', title: 'Mother CNIC', attached: true },
        { slot: 'guardianCnic', title: 'Guardian CNIC', attached: true },
        { slot: 'fatherDeathCertificate', title: 'Father Death Certificate', attached: true },
      ],
    }),
  },
  {
    id: 'seed-02',
    admissionNo: 'ADM-2026-204',
    fullName: 'Fatima Zahra',
    fatherGuardianName: 'Ghulam Rasool',
    dateOfBirth: '2017-06-18',
    gender: 'FEMALE',
    bFormNo: '31201-7654321-2',
    admissionDate: '2026-09-10',
    guardianName: 'Ghulam Rasool',
    guardianRelation: 'Father',
    guardianContact: '0302-9988776',
    address: 'Basti Noor, Bahawalpur, Punjab',
    photo: null,
    status: 'Active',
    bloodGroup: 'O+',
    allergies: 'None',
    chronicConditions: 'None',
    heightCm: 128,
    weightKg: 26,
    notes: JSON.stringify({
      enrollmentType: { type: 'New Enrollment', replacedRegistrationNo: null },
      category: { type: 'Poorest of the Poor' },
      basicInfo: {
        registrationNo: 'ADM-2026-204',
        admissionDate: '2026-09-10',
        fullName: 'Fatima Zahra',
        bFormNo: '31201-7654321-2',
        dateOfBirth: '2017-06-18',
        gender: 'FEMALE',
        familyCast: 'Arain',
        motherLanguage: 'Saraiki',
        birthDistrict: 'Bahawalpur',
        identificationMark: 'Birthmark on left arm',
        nextOfKin: 'Ghulam Rasool (Father)',
        isSponsored: 'Yes',
        sponsorshipAmount: '12000',
        status: 'Active',
        dateOfStatus: '2026-09-10',
        statusRemarks: 'Poorest of the poor monthly stipend support',
      },
      healthInfo: {
        isDisable: 'No',
        bloodGroup: 'O+',
        mentalHealth: 'Active & Creative',
        physicalHealth: 'Healthy',
        vaccinationDetail: 'Complete',
        specialNeedDisease: 'None',
      },
      fatherInfo: {
        name: 'Ghulam Rasool',
        cnic: '31201-1122334-1',
        contact: '0302-9988776',
        isAlive: 'Yes',
        dob: '1984-05-12',
        dod: null,
        qualification: 'Middle',
        profession: 'Daily Wage Worker',
        district: 'Bahawalpur',
        tehsil: 'Ahmedpur East',
        streetNumber: 'Street 03',
        houseNumber: 'House 18',
        ucNumber: 'UC-08',
        address: 'Basti Noor, Bahawalpur',
      },
      motherInfo: {
        name: 'Shamim Akhtar',
        cnic: '31201-9988776-2',
        contact: '0302-9988776',
        isAlive: 'Yes',
        dob: '1989-11-04',
        dod: null,
        qualification: 'None',
        profession: 'Housewife',
        district: 'Bahawalpur',
        tehsil: 'Ahmedpur East',
        streetNumber: 'Street 03',
        houseNumber: 'House 18',
        ucNumber: 'UC-08',
        address: 'Basti Noor, Bahawalpur',
      },
      guardianInfo: {
        name: 'Ghulam Rasool',
        relation: 'Father',
        contact: '0302-9988776',
        cnic: '31201-1122334-1',
        qualification: 'Middle',
        profession: 'Daily Wage Worker',
        address: 'Basti Noor, Bahawalpur',
      },
      meetingPersons: [],
      siblings: [],
      witnesses: [],
      resultInfo: {
        school: 'Govt Girls Primary School Bahawalpur',
        gradeClass: 'Class 3',
        examDate: '2026-03-15',
        examType: 'Mid-Term Examination',
        passingScore: '88% (A+ Grade)',
        subjectResults: [
          { id: '1', subject: 'Urdu', obtainedMarks: '90', totalMarks: '100' },
          { id: '2', subject: 'English', obtainedMarks: '84', totalMarks: '100' },
          { id: '3', subject: 'Mathematics', obtainedMarks: '92', totalMarks: '100' },
          { id: '4', subject: 'General Knowledge', obtainedMarks: '86', totalMarks: '100' },
        ],
      },
      healthCare: {
        checkFrequency: 'Monthly',
        medicineDetails: 'Calcium & Vitamin Supplements',
        antibioticMedicine: 'None',
      },
      reports: {
        category: 'Academic',
        details: 'Top student in class 3. Very obedient and highly interested in drawing.',
      },
      areaOfInterest: 'Art, Drawing, and Story Writing.',
    }),
  },
  {
    id: 'seed-03',
    admissionNo: 'ADM-2026-319',
    fullName: 'Bilal Ahmed',
    fatherGuardianName: 'Ahmed Din (Late)',
    dateOfBirth: '2015-08-24',
    gender: 'MALE',
    bFormNo: '36302-9988112-3',
    admissionDate: '2026-09-15',
    guardianName: 'Nasreen Bibi',
    guardianRelation: 'Mother',
    guardianContact: '0301-4455667',
    address: 'Shamsabad, Multan, Punjab',
    photo: null,
    status: 'Active',
    bloodGroup: 'A+',
    allergies: 'None',
    chronicConditions: 'None',
    heightCm: 140,
    weightKg: 34,
    notes: JSON.stringify({
      enrollmentType: { type: 'Replace', replacedRegistrationNo: 'ADM-2024-882' },
      category: { type: 'Orphan' },
      basicInfo: {
        registrationNo: 'ADM-2026-319',
        admissionDate: '2026-09-15',
        fullName: 'Bilal Ahmed',
        bFormNo: '36302-9988112-3',
        dateOfBirth: '2015-08-24',
        gender: 'MALE',
        familyCast: 'Sheikh',
        motherLanguage: 'Urdu',
        birthDistrict: 'Multan',
        identificationMark: 'Scar on forehead',
        nextOfKin: 'Nasreen Bibi (Mother)',
        isSponsored: 'No',
        sponsorshipAmount: null,
        status: 'Active',
        dateOfStatus: '2026-09-15',
        statusRemarks: 'Replacement against vacant seat ADM-2024-882',
      },
      healthInfo: {
        isDisable: 'No',
        bloodGroup: 'A+',
        mentalHealth: 'Normal',
        physicalHealth: 'Athletic',
        vaccinationDetail: 'Complete Schedule',
        specialNeedDisease: 'None',
      },
      fatherInfo: {
        name: 'Ahmed Din (Late)',
        cnic: '36302-3344556-1',
        contact: '0301-4455667',
        isAlive: 'No',
        dob: '1980-02-14',
        dod: '2021-08-10',
        qualification: 'Matric',
        profession: 'Driver',
        district: 'Multan',
        tehsil: 'Multan Cantt',
        streetNumber: 'Street 07',
        houseNumber: 'House 42',
        ucNumber: 'UC-22',
        address: 'Shamsabad, Multan',
      },
      motherInfo: {
        name: 'Nasreen Bibi',
        cnic: '36302-7788990-2',
        contact: '0301-4455667',
        isAlive: 'Yes',
        dob: '1986-04-18',
        dod: null,
        qualification: 'Primary',
        profession: 'Tailor',
        district: 'Multan',
        tehsil: 'Multan Cantt',
        streetNumber: 'Street 07',
        houseNumber: 'House 42',
        ucNumber: 'UC-22',
        address: 'Shamsabad, Multan',
      },
      guardianInfo: {
        name: 'Nasreen Bibi',
        relation: 'Mother',
        contact: '0301-4455667',
        cnic: '36302-7788990-2',
        qualification: 'Primary',
        profession: 'Tailor',
        address: 'Shamsabad, Multan',
      },
      resultInfo: {
        school: 'Govt Comprehensive School Multan',
        gradeClass: 'Class 5',
        examDate: '2026-03-22',
        examType: 'Final Term Examination',
        passingScore: '80% (A Grade)',
        subjectResults: [
          { id: '1', subject: 'Mathematics', obtainedMarks: '85', totalMarks: '100' },
          { id: '2', subject: 'English', obtainedMarks: '78', totalMarks: '100' },
          { id: '3', subject: 'Urdu', obtainedMarks: '82', totalMarks: '100' },
        ],
      },
      reports: {
        category: 'Behavior',
        details: 'Active sports participant, well behaved and cooperative.',
      },
      areaOfInterest: 'Football, Science & Technology, and Naat Recitation.',
    }),
  },
  {
    id: 'seed-04',
    admissionNo: 'ADM-2026-452',
    fullName: 'Zainab Bibi',
    fatherGuardianName: 'Muhammad Ishaq',
    dateOfBirth: '2018-02-10',
    gender: 'FEMALE',
    bFormNo: '36103-5566778-2',
    admissionDate: '2026-09-12',
    guardianName: 'Shazia Parveen',
    guardianRelation: 'Mother',
    guardianContact: '0305-6677889',
    address: 'Kabirwala, Khanewal, Punjab',
    photo: null,
    status: 'Active',
    bloodGroup: 'B+',
    allergies: 'None',
    chronicConditions: 'None',
    heightCm: 122,
    weightKg: 23,
    notes: JSON.stringify({
      enrollmentType: { type: 'New Enrollment', replacedRegistrationNo: null },
      category: { type: 'Divorce' },
      basicInfo: {
        registrationNo: 'ADM-2026-452',
        admissionDate: '2026-09-12',
        fullName: 'Zainab Bibi',
        bFormNo: '36103-5566778-2',
        dateOfBirth: '2018-02-10',
        gender: 'FEMALE',
        familyCast: 'Khokhar',
        motherLanguage: 'Punjabi',
        birthDistrict: 'Khanewal',
        identificationMark: 'None',
        nextOfKin: 'Shazia Parveen (Mother)',
        isSponsored: 'Yes',
        sponsorshipAmount: '10000',
        status: 'Active',
        dateOfStatus: '2026-09-12',
        statusRemarks: 'Divorced mother welfare support quota',
      },
      healthInfo: {
        isDisable: 'No',
        bloodGroup: 'B+',
        mentalHealth: 'Good',
        physicalHealth: 'Healthy',
        vaccinationDetail: 'Complete',
        specialNeedDisease: 'None',
      },
      fatherInfo: {
        name: 'Muhammad Ishaq',
        cnic: '36103-1122445-1',
        contact: 'N/A',
        isAlive: 'Yes',
        dob: '1985-06-15',
        dod: null,
        qualification: 'Primary',
        profession: 'Laborer',
        district: 'Khanewal',
        tehsil: 'Kabirwala',
        streetNumber: 'Street 01',
        houseNumber: 'House 09',
        ucNumber: 'UC-04',
        address: 'Kabirwala, Khanewal',
      },
      motherInfo: {
        name: 'Shazia Parveen',
        cnic: '36103-7788443-2',
        contact: '0305-6677889',
        isAlive: 'Yes',
        dob: '1990-10-14',
        dod: null,
        qualification: 'Matric',
        profession: 'Domestic Worker',
        district: 'Khanewal',
        tehsil: 'Kabirwala',
        streetNumber: 'Street 01',
        houseNumber: 'House 09',
        ucNumber: 'UC-04',
        address: 'Kabirwala, Khanewal',
      },
      guardianInfo: {
        name: 'Shazia Parveen',
        relation: 'Mother',
        contact: '0305-6677889',
        cnic: '36103-7788443-2',
        qualification: 'Matric',
        profession: 'Domestic Worker',
        address: 'Kabirwala, Khanewal',
      },
      resultInfo: {
        school: 'Govt Girls Model School Kabirwala',
        gradeClass: 'Class 2',
        examDate: '2026-03-18',
        examType: 'Annual Exam',
        passingScore: '85% (A Grade)',
        subjectResults: [
          { id: '1', subject: 'Urdu', obtainedMarks: '88', totalMarks: '100' },
          { id: '2', subject: 'Math', obtainedMarks: '82', totalMarks: '100' },
        ],
      },
      reports: {
        category: 'Islamic',
        details: 'Memorizing Surahs accurately and regular in morning prayers.',
      },
      areaOfInterest: 'Reading, Crafts, and Quran Studies.',
    }),
  },
  {
    id: 'seed-05',
    admissionNo: 'ADM-2026-588',
    fullName: 'Hamza Tariq',
    fatherGuardianName: 'Tariq Aziz (Late)',
    dateOfBirth: '2018-11-12',
    gender: 'MALE',
    bFormNo: '32304-4455667-1',
    admissionDate: '2026-09-18',
    guardianName: 'Kalsoom Akhtar',
    guardianRelation: 'Mother',
    guardianContact: '0304-7766554',
    address: 'Alipur Main Road, Muzaffargarh, Punjab',
    photo: null,
    status: 'Active',
    bloodGroup: 'AB+',
    allergies: 'None',
    chronicConditions: 'None',
    heightCm: 120,
    weightKg: 22,
    notes: JSON.stringify({
      enrollmentType: { type: 'New Enrollment', replacedRegistrationNo: null },
      category: { type: 'Posthumous' },
      basicInfo: {
        registrationNo: 'ADM-2026-588',
        admissionDate: '2026-09-18',
        fullName: 'Hamza Tariq',
        bFormNo: '32304-4455667-1',
        dateOfBirth: '2018-11-12',
        gender: 'MALE',
        familyCast: 'Qureshi',
        motherLanguage: 'Urdu',
        birthDistrict: 'Muzaffargarh',
        identificationMark: 'Small scar on right eyebrow',
        nextOfKin: 'Kalsoom Akhtar (Mother)',
        isSponsored: 'Yes',
        sponsorshipAmount: '12000',
        status: 'Active',
        dateOfStatus: '2026-09-18',
        statusRemarks: 'Posthumous welfare admission quota',
      },
      healthInfo: {
        isDisable: 'No',
        bloodGroup: 'AB+',
        mentalHealth: 'Sharp & Attentive',
        physicalHealth: 'Active',
        vaccinationDetail: 'Complete',
        specialNeedDisease: 'None',
      },
      fatherInfo: {
        name: 'Tariq Aziz (Late)',
        cnic: '32304-1122998-1',
        contact: '0304-7766554',
        isAlive: 'No',
        dob: '1983-07-15',
        dod: '2024-01-10',
        qualification: 'Graduation',
        profession: 'Security Personnel',
        district: 'Muzaffargarh',
        tehsil: 'Alipur',
        streetNumber: 'Gali No 5',
        houseNumber: 'House 19',
        ucNumber: 'UC-02',
        address: 'Alipur Main Road, Muzaffargarh',
      },
      motherInfo: {
        name: 'Kalsoom Akhtar',
        cnic: '32304-8877665-2',
        contact: '0304-7766554',
        isAlive: 'Yes',
        dob: '1988-09-25',
        dod: null,
        qualification: 'Matric',
        profession: 'Housewife',
        district: 'Muzaffargarh',
        tehsil: 'Alipur',
        streetNumber: 'Gali No 5',
        houseNumber: 'House 19',
        ucNumber: 'UC-02',
        address: 'Alipur Main Road, Muzaffargarh',
      },
      guardianInfo: {
        name: 'Kalsoom Akhtar',
        relation: 'Mother',
        contact: '0304-7766554',
        cnic: '32304-8877665-2',
        qualification: 'Matric',
        profession: 'Housewife',
        address: 'Alipur Main Road, Muzaffargarh',
      },
      resultInfo: {
        school: 'Govt Primary Model School Muzaffargarh',
        gradeClass: 'Class 1',
        examDate: '2026-03-25',
        examType: 'Annual Assessment',
        passingScore: '92% (A+ Grade)',
        subjectResults: [
          { id: '1', subject: 'Urdu', obtainedMarks: '94', totalMarks: '100' },
          { id: '2', subject: 'English', obtainedMarks: '90', totalMarks: '100' },
          { id: '3', subject: 'Mathematics', obtainedMarks: '95', totalMarks: '100' },
        ],
      },
      reports: {
        category: 'Academic',
        details: 'Extremely quick learner, disciplined and actively participates in recitation.',
      },
      areaOfInterest: 'Reading, Drawing, and Quran Memorization (Hifz).',
    }),
  },
];

// ================= ANIMATED BRAND SPLASH INTRO =================
function BrandIntroSplash({ onComplete }: { onComplete: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2400);

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
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.25) 1px, transparent 1px), radial-gradient(rgba(245, 158, 11, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px, 64px 64px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />
      <div className="absolute w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>PBM • SHM • 2026</span>
      </div>

      <div className="absolute top-6 right-6 text-[10px] text-slate-500 font-mono tracking-wider">
        CLICK ANYWHERE TO SKIP
      </div>

      <div className="relative flex flex-col items-center text-center px-4 z-10 max-w-md mx-auto">
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute -inset-6 rounded-full border border-emerald-500/30 animate-[spin_12s_linear_infinite]" />
          <div className="absolute -inset-3 rounded-full border border-amber-400/40 animate-[spin_8s_linear_infinite_reverse]" />
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500/30 to-amber-500/30 blur-md animate-pulse" />

          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#16102e] to-[#0d091e] border-2 border-emerald-400/80 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex items-center justify-center overflow-hidden">
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 animate-bounce">
              ☪
            </div>
          </div>
        </div>

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

// ================= MAIN STANDALONE PORTAL =================
export default function StandalonePSHAdmissionWebsite() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<'form' | 'records'>('records');
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [beds, setBeds] = useState<{ id: string; bedNumber: string; roomNumber: string }[]>([]);
  const [motherMaids, setMotherMaids] = useState<{ id: string; fullName: string }[]>([]);
  
  const [enrolledChildren, setEnrolledChildren] = useState<EnrolledChild[]>([]);
  const [justSubmittedChild, setJustSubmittedChild] = useState<EnrolledChild | null>(null);
  const [selectedDossierChild, setSelectedDossierChild] = useState<EnrolledChild | null>(null);
  const [editingChild, setEditingChild] = useState<EnrolledChild | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [sponsorshipFilter, setSponsorshipFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'NAME' | 'REG_NO'>('NEWEST');

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // 1. Load records from LocalStorage or seed defaults
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem('psh_admissions_records');
      if (savedRaw) {
        const list = JSON.parse(savedRaw);
        if (Array.isArray(list) && list.length > 0) {
          setEnrolledChildren(list);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load local admissions:', e);
    }

    // Default Seed
    setEnrolledChildren(DEFAULT_SEED_CHILDREN);
    try {
      localStorage.setItem('psh_admissions_records', JSON.stringify(DEFAULT_SEED_CHILDREN));
    } catch (e) {
      console.warn('Local storage init warning:', e);
    }
  }, []);

  // 2. Fetch server options if backend is running
  useEffect(() => {
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

  // Parse notes JSON safely
  const parseDossierNotes = (notesStr?: string) => {
    if (!notesStr) return null;
    try {
      return typeof notesStr === 'string' ? JSON.parse(notesStr) : notesStr;
    } catch {
      return null;
    }
  };

  // Form submission handler
  const handleFormSuccess = (childData?: EnrolledChild) => {
    if (childData) {
      setJustSubmittedChild(childData);
      setEditingChild(null);
      setEnrolledChildren((prev) => [
        childData,
        ...prev.filter((c) => c.admissionNo !== childData.admissionNo && c.id !== childData.id),
      ]);
      showToast(`Child record ${childData.admissionNo} saved successfully!`);
    }
  };

  // Delete record handler
  const handleDeleteRecord = (admissionNo: string) => {
    if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to remove record ${admissionNo}?`)) {
      const updated = enrolledChildren.filter((c) => c.admissionNo !== admissionNo);
      setEnrolledChildren(updated);
      try {
        localStorage.setItem('psh_admissions_records', JSON.stringify(updated));
      } catch (e) {
        console.warn('Local storage update error:', e);
      }
      showToast(`Record ${admissionNo} removed.`);
    }
  };

  // Reset to default seed dataset
  const handleResetToSeedData = () => {
    if (typeof window !== 'undefined' && window.confirm('Reset directory to official sample resident dataset (5 children)?')) {
      setEnrolledChildren(DEFAULT_SEED_CHILDREN);
      try {
        localStorage.setItem('psh_admissions_records', JSON.stringify(DEFAULT_SEED_CHILDREN));
      } catch (e) {
        console.warn('Local storage error:', e);
      }
      showToast('Admitted Records directory restored to sample records.');
    }
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (enrolledChildren.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Registration No',
      'Child Full Name',
      'Father / Guardian Name',
      'Category',
      'Enrollment Type',
      'Gender',
      'Date of Birth',
      'B-Form / CNIC',
      'Blood Group',
      'Admission Date',
      'Sponsored',
      'Sponsorship Amount (PKR)',
      'Guardian Contact',
      'Address',
      'Status',
    ];

    const rows = enrolledChildren.map((c) => {
      const psh = parseDossierNotes(c.notes);
      return [
        `"${c.admissionNo || ''}"`,
        `"${c.fullName || ''}"`,
        `"${c.fatherGuardianName || ''}"`,
        `"${psh?.category?.type || 'Orphan'}"`,
        `"${psh?.enrollmentType?.type || 'New Enrollment'}"`,
        `"${c.gender || ''}"`,
        `"${c.dateOfBirth || ''}"`,
        `"${c.bFormNo || ''}"`,
        `"${c.bloodGroup || 'B+'}"`,
        `"${c.admissionDate || ''}"`,
        `"${psh?.basicInfo?.isSponsored || 'No'}"`,
        `"${psh?.basicInfo?.sponsorshipAmount || '0'}"`,
        `"${c.guardianContact || ''}"`,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        `"${c.status || 'Active'}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PSH_Sweet_Home_Admissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Spreadsheet downloaded as CSV file!');
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(enrolledChildren, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PSH_Portal_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON Backup downloaded successfully!');
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setEnrolledChildren(imported);
          localStorage.setItem('psh_admissions_records', JSON.stringify(imported));
          showToast(`Successfully restored ${imported.length} records from backup!`);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Calculate Live KPI Statistics
  const stats = useMemo(() => {
    const total = enrolledChildren.length;
    let orphans = 0;
    let poorest = 0;
    let divorce = 0;
    let posthumous = 0;
    let sponsoredCount = 0;
    let totalSponsorshipPKR = 0;
    let boys = 0;
    let girls = 0;

    enrolledChildren.forEach((child) => {
      const psh = parseDossierNotes(child.notes);
      const cat = psh?.category?.type || 'Orphan';
      if (cat === 'Orphan') orphans++;
      else if (cat === 'Poorest of the Poor') poorest++;
      else if (cat === 'Divorce') divorce++;
      else if (cat === 'Posthumous') posthumous++;

      if (psh?.basicInfo?.isSponsored === 'Yes') {
        sponsoredCount++;
        const amt = parseInt(psh?.basicInfo?.sponsorshipAmount || '0', 10);
        if (!isNaN(amt)) totalSponsorshipPKR += amt;
      }

      if (child.gender?.toUpperCase() === 'FEMALE') girls++;
      else boys++;
    });

    return {
      total,
      orphans,
      poorest,
      divorce,
      posthumous,
      sponsoredCount,
      totalSponsorshipPKR,
      boys,
      girls,
    };
  }, [enrolledChildren]);

  // Filter and sort children
  const filteredChildren = useMemo(() => {
    return enrolledChildren
      .filter((child) => {
        const psh = parseDossierNotes(child.notes);
        const cat = psh?.category?.type || 'Orphan';
        const isSponsored = psh?.basicInfo?.isSponsored || 'No';

        // Search match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = child.fullName?.toLowerCase().includes(q);
          const matchReg = child.admissionNo?.toLowerCase().includes(q);
          const matchBform = child.bFormNo?.toLowerCase().includes(q);
          const matchFather = child.fatherGuardianName?.toLowerCase().includes(q);
          const matchGuardian = child.guardianName?.toLowerCase().includes(q);
          if (!matchName && !matchReg && !matchBform && !matchFather && !matchGuardian) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== 'ALL' && cat !== categoryFilter) {
          return false;
        }

        // Gender filter
        if (genderFilter !== 'ALL' && child.gender?.toUpperCase() !== genderFilter) {
          return false;
        }

        // Sponsorship filter
        if (sponsorshipFilter === 'SPONSORED' && isSponsored !== 'Yes') return false;
        if (sponsorshipFilter === 'UNSPONSORED' && isSponsored === 'Yes') return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'REG_NO') return a.admissionNo.localeCompare(b.admissionNo);
        if (sortBy === 'OLDEST') return new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime();
        return new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime();
      });
  }, [enrolledChildren, searchQuery, categoryFilter, genderFilter, sponsorshipFilter, sortBy]);

  return (
    <>
      {/* Intro Brand Splash Animation */}
      {showIntro && <BrandIntroSplash onComplete={() => setShowIntro(false)} />}

      <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex flex-col antialiased">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#0D5C3A] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-400 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Official Government / PBM Header Banner */}
        <header className="bg-gradient-to-r from-[#0D5C3A] via-[#09482D] to-[#0D5C3A] text-white shadow-md sticky top-0 z-40 border-b-4 border-[#C86A28]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
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

              <button
                type="button"
                onClick={() => {
                  setJustSubmittedChild(null);
                  setEditingChild(null);
                  setActiveTab('form');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'form' && !justSubmittedChild
                    ? 'bg-white text-[#0D5C3A] shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{editingChild ? 'Edit Dossier' : 'New Admission'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
                  <span>View All Records ({enrolledChildren.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setJustSubmittedChild(null);
                    setEditingChild(null);
                    setActiveTab('form');
                  }}
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
                  <span>• {editingChild ? 'Edit Child Dossier' : 'Child Admission Form'}</span>
                </div>
                {editingChild && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingChild(null);
                      setActiveTab('records');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Back to Records
                  </button>
                )}
              </div>

              {/* The Add / Edit PSH Form */}
              <AddPSHForm
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setEditingChild(null);
                  setActiveTab('records');
                }}
                initialChild={editingChild}
                classes={classes}
                beds={beds}
                motherMaids={motherMaids}
              />
            </div>
          ) : (
            /* ================= ADMITTED RECORDS REGISTER & ANALYTICS DASHBOARD ================= */
            <div className="space-y-6">
              {/* LIVE ANALYTICS STATS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* 1. Total Admitted */}
                <div 
                  onClick={() => {
                    setCategoryFilter('ALL');
                    setGenderFilter('ALL');
                    setSponsorshipFilter('ALL');
                  }}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#0D5C3A] transition-all"
                >
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Total Enrolled</span>
                    <Users className="w-4 h-4 text-[#0D5C3A]" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Sweet Home Multan</div>
                  </div>
                </div>

                {/* 2. Orphans Ratio */}
                <div 
                  onClick={() => setCategoryFilter('Orphan')}
                  className={`bg-white p-4 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                    categoryFilter === 'Orphan' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-amber-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Orphans</span>
                    <Heart className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-amber-600">
                      {stats.orphans} <span className="text-xs font-normal text-slate-400">({stats.total > 0 ? Math.round((stats.orphans / stats.total) * 100) : 0}%)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">PBM Priority Quota</div>
                  </div>
                </div>

                {/* 3. Poorest of the Poor */}
                <div 
                  onClick={() => setCategoryFilter('Poorest of the Poor')}
                  className={`bg-white p-4 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                    categoryFilter === 'Poorest of the Poor' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Poorest of Poor</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-emerald-700">{stats.poorest}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Deserving Families</div>
                  </div>
                </div>

                {/* 4. Active Sponsorship Funds */}
                <div 
                  onClick={() => setSponsorshipFilter(sponsorshipFilter === 'SPONSORED' ? 'ALL' : 'SPONSORED')}
                  className={`bg-white p-4 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                    sponsorshipFilter === 'SPONSORED' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Sponsorships / Mo</span>
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-black text-blue-700">
                      Rs. {stats.totalSponsorshipPKR.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{stats.sponsoredCount} Children Sponsored</div>
                  </div>
                </div>

                {/* 5. Gender Ratio */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Gender Ratio</span>
                    <UserCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="mt-2">
                    <div className="text-base font-bold text-slate-800">
                      👦 {stats.boys} Boys • 👧 {stats.girls} Girls
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Resident Capacity</div>
                  </div>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Header & Heavy Action Toolbar */}
                <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Admitted Children Register & Official Dossiers
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pakistan Bait-ul-Mal Sweet Home Multan Institutional Directory
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Export to Excel / CSV */}
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                        title="Download full records in Microsoft Excel compatible CSV format"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export Excel/CSV</span>
                      </button>

                      {/* Export Backup JSON */}
                      <button
                        type="button"
                        onClick={handleExportJSON}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                        title="Download JSON Database Backup"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Backup JSON</span>
                      </button>

                      {/* Import Backup JSON */}
                      <label
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                        title="Restore JSON Database Backup"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Import</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJSON}
                          className="hidden"
                        />
                      </label>

                      {/* Reset to Seed Data */}
                      <button
                        type="button"
                        onClick={handleResetToSeedData}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                        title="Restore sample 5 children dataset"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {/* New Admission Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setJustSubmittedChild(null);
                          setEditingChild(null);
                          setActiveTab('form');
                        }}
                        className="px-4 py-1.5 bg-[#0D5C3A] hover:bg-[#0b4d30] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>➕ New Child Admission</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                    {/* Search Input */}
                    <div className="md:col-span-2 relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by Name, Reg No, B-Form, Guardian..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-[#0D5C3A] focus:bg-white"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#0D5C3A] focus:bg-white"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="Orphan">Orphan</option>
                        <option value="Poorest of the Poor">Poorest of the Poor</option>
                        <option value="Divorce">Divorce</option>
                        <option value="Posthumous">Posthumous</option>
                      </select>
                    </div>

                    {/* Gender Filter */}
                    <div>
                      <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#0D5C3A] focus:bg-white"
                      >
                        <option value="ALL">All Genders</option>
                        <option value="MALE">Male (Boys)</option>
                        <option value="FEMALE">Female (Girls)</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#0D5C3A] focus:bg-white"
                      >
                        <option value="NEWEST">Newest Admission</option>
                        <option value="OLDEST">Oldest Admission</option>
                        <option value="NAME">Name (A-Z)</option>
                        <option value="REG_NO">Reg No (Asc)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                {filteredChildren.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-700">No Admission Records Matching Filters</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing your search query or filters to view all admitted children.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('ALL');
                        setGenderFilter('ALL');
                        setSponsorshipFilter('ALL');
                      }}
                      className="px-4 py-2 bg-[#0D5C3A] text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-[#0b4d30]"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-3 px-4">Reg No</th>
                          <th className="py-3 px-4">Child Profile</th>
                          <th className="py-3 px-4">Father / Guardian</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Sponsorship</th>
                          <th className="py-3 px-4">Admission Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredChildren.map((child) => {
                          const psh = parseDossierNotes(child.notes);
                          const cat = psh?.category?.type || 'Orphan';
                          const isSponsored = psh?.basicInfo?.isSponsored === 'Yes';
                          const sponsorAmt = psh?.basicInfo?.sponsorshipAmount;

                          return (
                            <tr key={child.admissionNo} className="hover:bg-slate-50/80 transition-colors">
                              {/* Reg No */}
                              <td className="py-3 px-4 font-mono font-bold text-[#0D5C3A]">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                  {child.admissionNo}
                                </span>
                              </td>

                              {/* Child Profile */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-slate-300">
                                    {child.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">{child.fullName}</div>
                                    <div className="text-[10px] text-slate-500">
                                      {child.gender} • DOB: {child.dateOfBirth} • Blood: <span className="text-red-600 font-bold">{child.bloodGroup || 'B+'}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Father / Guardian */}
                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800">{child.fatherGuardianName}</div>
                                {child.guardianContact && (
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{child.guardianContact}</span>
                                  </div>
                                )}
                              </td>

                              {/* Category */}
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  cat === 'Orphan'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : cat === 'Poorest of the Poor'
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                    : cat === 'Divorce'
                                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                                    : 'bg-purple-50 text-purple-900 border-purple-300'
                                }`}>
                                  {cat}
                                </span>
                              </td>

                              {/* Sponsorship */}
                              <td className="py-3 px-4">
                                {isSponsored ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Rs. {sponsorAmt || '12,000'}/mo</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Unsponsored</span>
                                )}
                              </td>

                              {/* Admission Date */}
                              <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                                {child.admissionDate}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  {child.status}
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {/* Print Dossier */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDossierChild(child)}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0D5C3A] font-bold rounded text-xs flex items-center gap-1 border border-emerald-200 cursor-pointer transition-colors"
                                    title="Print / View Official Child Dossier"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print Dossier</span>
                                  </button>

                                  {/* Edit Record */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingChild(child);
                                      setJustSubmittedChild(null);
                                      setActiveTab('form');
                                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-slate-200 transition-colors cursor-pointer"
                                    title="Edit Child Information"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Record */}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ================= OFFICIAL PRINTABLE CHILD DOSSIER MODAL ================= */}
        {selectedDossierChild && (() => {
          const psh = parseDossierNotes(selectedDossierChild.notes);
          return (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto print:p-0 print:bg-white print:static">
              <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0">
                {/* Modal Top Actions (Hidden in Print) */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
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
                <div className="pt-6 space-y-5 text-slate-900 print:pt-0">
                  {/* 1. Header with Government / PBM Seal */}
                  <div className="text-center border-b-2 border-[#0D5C3A] pb-4 relative">
                    {/* Official Verification Watermark Badge */}
                    <div className="absolute top-0 right-0 border border-slate-300 p-1 rounded text-[9px] font-mono text-slate-400 text-right uppercase">
                      <div>VERIFIED PORTAL RECORD</div>
                      <div className="font-bold text-slate-700">{selectedDossierChild.admissionNo}</div>
                    </div>

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

                  {/* Section 1 & 2: Category & Enrollment Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#0D5C3A] uppercase tracking-wider block">1. CATEGORY</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {psh?.category?.type || 'Orphan'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#0D5C3A] uppercase tracking-wider block">2. CATEGORY 2</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {psh?.enrollmentType?.type || 'New Enrollment'}
                        </span>
                      </div>
                      {psh?.enrollmentType?.replacedRegistrationNo && (
                        <div className="text-right">
                          <span className="text-[10px] text-amber-800 font-bold block">Replaced Seat</span>
                          <span className="font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            {psh.enrollmentType.replacedRegistrationNo}
                          </span>
                        </div>
                      )}
                    </div>
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
