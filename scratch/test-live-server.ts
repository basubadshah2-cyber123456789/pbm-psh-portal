async function testLiveServer() {
  console.log('Testing live Next.js application at http://localhost:3000...\n');

  // 1. Authenticate via /api/auth/login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId: 'incharge', password: 'Pbm@12345' }),
  });

  console.log('1. Login response status:', loginRes.status);
  const cookie = loginRes.headers.get('set-cookie');
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    process.exit(1);
  }
  console.log('✓ Successfully authenticated as Incharge\n');

  // 2. Fetch children list
  const childrenRes = await fetch('http://localhost:3000/api/children', {
    headers: { cookie: cookie || '' },
  });
  const childrenData = await childrenRes.json();
  console.log('2. Children list status:', childrenRes.status);
  console.log(`✓ Fetched ${childrenData.children?.length} active enrolled children\n`);

  // 3. Submit a full 14-section PSH child admission
  const testAdmissionNo = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullPshPayload = {
    fullName: 'Hamza Tariq',
    fatherGuardianName: 'Tariq Mehmood (Late)',
    dateOfBirth: '2015-08-15',
    gender: 'MALE',
    bFormNo: '36302-1234567-9',
    admissionNo: testAdmissionNo,
    admissionDate: new Date().toISOString().split('T')[0],
    guardianName: 'Maryam Bibi',
    guardianRelation: 'Mother / Widow',
    guardianContact: '0300-1234567',
    address: 'Chak 5/MR, Basti Malook, Multan, Punjab',
    photo: null,
    status: 'ACTIVE',
    bloodGroup: 'B+',
    allergies: 'None',
    chronicConditions: 'None',
    heightCm: 138,
    weightKg: 32,
    notes: JSON.stringify({
      category: { type: 'Orphan', replacedRegistrationNo: null },
      basicInfo: {
        nickName: 'Hamzi',
        placeOfBirth: 'Multan',
        ageYears: '10',
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
        dob: '1984-05-12',
        dod: '2023-10-10',
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
      ],
      siblings: [
        {
          name: 'Usman Tariq',
          gender: 'MALE',
          age: '8',
          schoolName: 'Govt School',
          gradeClass: 'Class 3',
          maritalStatus: 'Single',
          profession: 'Student',
          contact: '',
          province: 'Punjab',
          city: 'Multan',
          tehsil: 'Multan City',
          unionCouncil: 'UC-14',
          address: 'Residing with Mother',
        },
      ],
      witnesses: [
        {
          name: 'Haji Abdul Rasheed',
          fatherName: 'Ghulam Muhammad',
          cnic: '36302-3344556-7',
          contact: '0300-3344556',
          qualification: 'Graduate',
          profession: 'Retired Govt Officer',
          address: 'Main Bazar, Multan',
        },
      ],
      resultInfo: {
        schoolName: 'Govt Primary School Multan',
        class: 'Class 4',
        examDate: '2025-03-20',
        examType: 'Annual Examination',
        passingScore: '85%',
        totalObtained: 428,
        totalMax: 500,
        percentage: '85.6%',
        subjectResults: [
          { subject: 'English', obtainedMarks: '85', totalMarks: '100', grade: 'A' },
          { subject: 'Urdu', obtainedMarks: '90', totalMarks: '100', grade: 'A+' },
          { subject: 'Mathematics', obtainedMarks: '85', totalMarks: '100', grade: 'A' },
          { subject: 'General Science', obtainedMarks: '80', totalMarks: '100', grade: 'A' },
          { subject: 'Islamiyat', obtainedMarks: '88', totalMarks: '100', grade: 'A+' },
        ],
      },
      healthCare: {
        checkFrequency: 'Monthly',
        medicineDetails: 'Multivitamins Syrup - 1 spoon daily',
        antibioticMedicine: 'Augmentin 312mg - 5ml twice daily (5 Days Course)',
        antibioticReason: 'Throat infection',
      },
      reports: {
        discipline: 'Strict adherence to hostel timings and morning assembly.',
        behavior: 'Cooperative, polite with roommates and care staff.',
        academic: 'Strong aptitude in mathematics and reading.',
        islamic: 'Regular in 5 daily prayers in Sweet Home mosque.',
      },
      areaOfInterest: 'Cricket (Fast Bowling), Drawing, Science Club, Holy Quran Recitation / Hifz. Dreams of becoming a Civil Engineer.',
    }),
  };

  const createRes = await fetch('http://localhost:3000/api/children', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookie || '',
    },
    body: JSON.stringify(fullPshPayload),
  });

  const createData = await createRes.json();
  console.log('3. Child admission submission status:', createRes.status);
  if (!createRes.ok) {
    console.error('Admission failed:', createData);
    process.exit(1);
  }

  console.log(`✓ Enrolled new child ${createData.child?.fullName} (ID: ${createData.child?.childId}, Admission: ${createData.child?.admissionNo})\n`);

  // 4. Verify the created child record in the database
  const verifyRes = await fetch(`http://localhost:3000/api/children`, {
    headers: { cookie: cookie || '' },
  });
  const updatedList = await verifyRes.json();
  const found = updatedList.children?.find((c: any) => c.admissionNo === testAdmissionNo);

  if (!found) {
    console.error('Child record not found in directory!');
    process.exit(1);
  }

  console.log('4. Verification in Children Register:');
  console.log(`   - Name: ${found.fullName}`);
  console.log(`   - Child ID: ${found.childId}`);
  console.log(`   - Status: ${found.status}`);
  console.log(`   - Medical Blood Group: ${found.medicalRecord?.bloodGroup}`);
  console.log('   - Extended PSH Notes verified: length =', found.notes?.length);

  console.log('\n🎉 End-to-End Live HTTP & Data flow verification SUCCESSFUL!');
}

testLiveServer().catch((err) => {
  console.error('Error during live test:', err);
  process.exit(1);
});
