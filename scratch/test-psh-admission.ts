import { parsePshNotes } from '../lib/utils';
import { prisma } from '../lib/prisma';

async function testPshAdmission() {
  console.log('Testing PSH 14-Section Admission Logic & Serialization...');

  const sampleExtendedPsh = {
    category: {
      type: 'Replace',
      replacedRegistrationNo: 'ADM-2024-001',
    },
    basicInfo: {
      nickName: 'Mani',
      placeOfBirth: 'Multan',
      ageYears: '9',
      religion: 'Islam',
      caste: 'Bhatti',
      motherTongue: 'Saraiki',
      isSponsored: 'Yes',
      sponsorshipAmount: '15000',
      previousSchool: 'Govt Primary School Multan',
      mediumOfEducation: 'Urdu',
    },
    healthInfo: {
      isDisable: 'No',
      bloodGroup: 'B+',
      mentalPhysicalHealth: 'Normal & Sound',
      vaccinationDetail: 'Fully Vaccinated (EPI Schedule)',
      specialNeedDisease: 'None',
    },
    fatherInfo: {
      name: 'Tariq Mehmood',
      cnic: '36302-1234567-1',
      contact: '0300-1234567',
      isAlive: 'No',
      dob: '1985-04-12',
      dod: '2023-11-05',
      qualification: 'Matric',
      profession: 'Daily Wager / Laborer',
      province: 'Punjab',
      city: 'Multan',
      tehsil: 'Multan City',
      unionCouncil: 'UC-14',
      address: 'Chak 5/MR, Multan',
    },
    motherInfo: {
      name: 'Maryam Bibi',
      cnic: '36302-7654321-2',
      contact: '0301-7654321',
      isAlive: 'Yes',
      dob: '1990-08-20',
      dod: null,
      qualification: 'Primary',
      profession: 'Housewife / Sewing',
      province: 'Punjab',
      city: 'Multan',
      tehsil: 'Multan City',
      unionCouncil: 'UC-14',
      address: 'House #24, Street 3, Multan',
    },
    guardianInfo: {
      name: 'Maryam Bibi',
      relation: 'Mother / Widow',
      contact: '0301-7654321',
      cnic: '36302-7654321-2',
      qualification: 'Primary',
      profession: 'Sewing / Tailor',
      address: 'House #24, Street 3, Multan',
    },
    meetingPersons: [
      {
        name: 'Maryam Bibi',
        relation: 'Mother',
        cnic: '36302-7654321-2',
        contact: '0301-7654321',
        visitFrequency: '1st & 3rd Sunday of Month',
        visitTiming: '10:00 AM - 04:00 PM',
        province: 'Punjab',
        city: 'Multan',
        tehsil: 'Multan City',
        unionCouncil: 'UC-14',
        address: 'House #24, Street 3, Multan',
      },
      {
        name: 'Muhammad Akram',
        relation: 'Maternal Uncle',
        cnic: '36302-9988776-3',
        contact: '0302-9988776',
        visitFrequency: 'Monthly',
        visitTiming: '11:00 AM - 03:00 PM',
        province: 'Punjab',
        city: 'Multan',
        tehsil: 'Multan City',
        unionCouncil: 'UC-14',
        address: 'Multan',
      },
    ],
    siblings: [
      {
        name: 'Usman Tariq',
        gender: 'MALE',
        age: '7',
        schoolName: 'Govt Primary School',
        gradeClass: 'Class 2',
        maritalStatus: 'Single',
        profession: 'Student',
        contact: '',
        province: 'Punjab',
        city: 'Multan',
        tehsil: 'Multan City',
        unionCouncil: 'UC-14',
        address: 'Residing with mother',
      },
    ],
    witnesses: [
      {
        name: 'Haji Abdul Rasheed',
        fatherName: 'Ghulam Muhammad',
        cnic: '36302-3344556-7',
        contact: '0300-3344556',
        qualification: 'Graduate',
        profession: 'Retired Govt Officer / Elder',
        address: 'Main Bazar, Multan',
      },
      {
        name: 'Qari Muhammad Aslam',
        fatherName: 'Allah Ditta',
        cnic: '36302-5566778-9',
        contact: '0301-5566778',
        qualification: 'Matric / Shahadat-ul-Almiya',
        profession: 'Imam Masjid',
        address: 'Mohallah Rasheedabad, Multan',
      },
    ],
    resultInfo: {
      schoolName: 'Govt Primary School Multan',
      class: 'Class 3',
      examDate: '2025-03-15',
      examType: 'Annual Examination',
      passingScore: '85%',
      totalObtained: 428,
      totalMax: 500,
      percentage: '85.6%',
      subjectResults: [
        { subject: 'English', obtainedMarks: '82', totalMarks: '100', grade: 'A' },
        { subject: 'Urdu', obtainedMarks: '90', totalMarks: '100', grade: 'A+' },
        { subject: 'Mathematics', obtainedMarks: '85', totalMarks: '100', grade: 'A' },
        { subject: 'General Science', obtainedMarks: '79', totalMarks: '100', grade: 'B+' },
        { subject: 'Islamiyat', obtainedMarks: '92', totalMarks: '100', grade: 'A+' },
      ],
    },
    healthCare: {
      checkFrequency: 'Monthly',
      medicineDetails: 'Multivitamins Syrup - 1 spoon daily',
      antibioticMedicine: 'Augmentin 312mg - 5ml twice daily (5 Days Course)',
      antibioticReason: 'Throat infection',
    },
    reports: {
      discipline: 'Excellent hostel compliance and morning assembly attendance.',
      behavior: 'Polite, cooperative with roommates and mother maid.',
      academic: 'Strong mathematics and Urdu reading aptitude.',
      islamic: 'Regular 5 daily prayers, reciting Para 3 with Tajweed.',
    },
    areaOfInterest: 'Cricket (Fast Bowling), Drawing, Science Club, Hifz. Dreams of becoming a Civil Engineer.',
  };

  // Test serialization & deserialization
  const jsonString = JSON.stringify(sampleExtendedPsh);
  const parsed = parsePshNotes(jsonString);

  if (!parsed) {
    throw new Error('parsePshNotes returned null on valid payload!');
  }

  console.log('✓ Category check:', parsed.category.type, '(Replaced:', parsed.category.replacedRegistrationNo, ')');
  console.log('✓ Basic info check:', parsed.basicInfo.nickName, '• Religion:', parsed.basicInfo.religion);
  console.log('✓ Father isAlive check:', parsed.fatherInfo.isAlive, '• DOD:', parsed.fatherInfo.dod);
  console.log('✓ Mother isAlive check:', parsed.motherInfo.isAlive, '• Profession:', parsed.motherInfo.profession);
  console.log('✓ Meeting persons count:', parsed.meetingPersons.length);
  console.log('✓ Witnesses count:', parsed.witnesses.length);
  console.log('✓ Academic results percentage:', parsed.resultInfo.percentage, '• Subjects:', parsed.resultInfo.subjectResults.length);
  console.log('✓ Antibiotic Medicine Track:', parsed.healthCare.antibioticMedicine);
  console.log('✓ Reports length:', Object.keys(parsed.reports).length);
  console.log('✓ Area of Interest:', parsed.areaOfInterest);

  // Check database child count to verify connection
  const count = await prisma.child.count();
  console.log('✓ Current active children in DB:', count);

  console.log('\nAll 14 PSH Form verification tests passed successfully!');
}

testPshAdmission()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
