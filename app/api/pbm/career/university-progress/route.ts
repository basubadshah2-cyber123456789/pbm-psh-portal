import { randomUUID } from 'node:crypto';
import { del, get, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyPbmChildSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;
const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const allowedPrograms = new Set([
  'FSc (Pre-Medical)',
  'FSc (Pre-Engineering)',
  'ICS (Computer Science)',
  'I.Com (Commerce)',
  'FA (Arts / Humanities)',
  'General Science',
  'DAE (Diploma of Associate Engineering)',
  'A Levels',
  'Other',
  'Medical',
  'Engineering',
  'BS / General',
  'Commerce',
]);
const allowedCollegeYears = new Set(['1st Year', '2nd Year']);
const allowedCollegeTypes = new Set(['Government', 'Private']);
const allowedCollegeSponsorshipSources = new Set(['Sponsored by PBM', 'Sponsored by Donor']);
const allowedDisciplinaryTypes = new Set(['DROPPED', 'EXPELLED']);
const allowedDisciplinaryApprovals = new Set(['Yes', 'No']);
const allowedUniversityTypes = new Set(['Public Sector', 'Private', 'Affiliated College']);
const allowedDegreeLevels = new Set(['Associate Degree', 'Bachelor / Undergraduate', 'MS', 'MPhil', 'PhD', 'Professional Degree', 'Other']);
const allowedDegreePrograms = new Set([
  'Associate Degree', 'BA / BS Arts and Humanities', 'BS Computer Science / IT', 'BS Natural Sciences',
  'BBA / Business Administration', 'BCom / Accounting and Finance', 'LLB / Law', 'MBBS', 'BDS',
  'Pharm-D', 'DPT / Allied Health Sciences', 'BE / Engineering', 'BEd / Education',
  'Agriculture and Veterinary Sciences', 'Other',
]);
const allowedEnrollmentStatuses = new Set(['Enrolled', 'On Leave', 'Completed', 'Withdrawn']);
const allowedProvinces = new Set([
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory',
  'Azad Jammu and Kashmir', 'Gilgit-Baltistan',
]);

interface SubjectMark {
  id: string;
  subject: string;
  totalMarks: string;
  obtainedMarks: string;
  percentage: string;
  grade: string;
  result: string;
}

interface UniversityCourse {
  id: string;
  courseName: string;
  creditHours: string;
  grade: string;
  totalMarks: string;
  obtainedMarks: string;
  percentage: string;
}

interface CounsellingEntry {
  id: string;
  date: string;
  details: string;
}

interface CollegeDisciplinaryProceeding {
  type: 'DROPPED' | 'EXPELLED';
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
}

interface UploadedDisciplinaryDocument {
  id: string;
  title: string;
  documentType: string;
  fileName: string;
  contentType: string;
  size: number;
  bytes: Uint8Array;
  blobUrl?: string;
}

function validFileSignature(bytes: Uint8Array, contentType: string): boolean {
  if (contentType === 'application/pdf') return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png') return bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  return contentType === 'image/webp' &&
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
}

function readText(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.length > maxLength) return null;
  return value.trim();
}

function validateCounsellingEntries(value: FormDataEntryValue | null): CounsellingEntry[] | null {
  if (value === null) return [];
  if (typeof value !== 'string') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length > 100) return null;
  const entries: CounsellingEntry[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const entry = item as Record<string, unknown>;
    if (
      typeof entry.date !== 'string' ||
      (entry.date !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) ||
      typeof entry.details !== 'string' ||
      entry.details.length > 3000
    ) return null;
    entries.push({
      id: randomUUID(),
      date: entry.date,
      details: entry.details.trim(),
    });
  }
  return entries;
}

function validateDisciplinaryProceeding(value: FormDataEntryValue | null): CollegeDisciplinaryProceeding | null | false {
  if (value === null) return null;
  if (typeof value !== 'string') return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return false;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  const entry = parsed as Record<string, unknown>;
  const textFields = [
    'name', 'fatherName', 'pshName', 'className', 'classSection', 'rollNumber', 'attendance',
    'pshRegistrationNumber', 'instituteName', 'totalMarks', 'obtainedMarks', 'reason', 'date',
    'approved', 'remarks', 'expulsionCommitteeMinutes',
  ] as const;
  if (textFields.some((field) => typeof entry[field] !== 'string' || entry[field].length > (field === 'expulsionCommitteeMinutes' ? 5000 : 500))) {
    return false;
  }
  const type = entry.type;
  if (type === '') {
    return textFields.some((field) => Boolean(entry[field])) ? false : null;
  }
  if (typeof type !== 'string' || !allowedDisciplinaryTypes.has(type)) return false;
  if (entry.approved && !allowedDisciplinaryApprovals.has(String(entry.approved))) return false;
  if (entry.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date))) return false;
  const totalMarks = entry.totalMarks ? Number(entry.totalMarks) : null;
  const obtainedMarks = entry.obtainedMarks ? Number(entry.obtainedMarks) : null;
  if (
    (totalMarks !== null && (!Number.isFinite(totalMarks) || totalMarks < 0)) ||
    (obtainedMarks !== null && (!Number.isFinite(obtainedMarks) || obtainedMarks < 0)) ||
    (totalMarks !== null && obtainedMarks !== null && obtainedMarks > totalMarks)
  ) return false;
  return {
    type,
    ...Object.fromEntries(textFields.map((field) => [field, String(entry[field]).trim()])),
  } as CollegeDisciplinaryProceeding;
}

function validateSubjects(value: FormDataEntryValue | null): SubjectMark[] | null {
  if (typeof value !== 'string') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 100) return null;
  const subjects: SubjectMark[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const subject = item as Record<string, unknown>;
    if (
      typeof subject.subject !== 'string' || !subject.subject.trim() || subject.subject.length > 100 ||
      typeof subject.totalMarks !== 'string' || typeof subject.obtainedMarks !== 'string' ||
      (subject.grade !== undefined && (typeof subject.grade !== 'string' || subject.grade.length > 10)) ||
      (subject.result !== undefined && typeof subject.result !== 'string')
    ) return null;
    const totalMarks = Number(subject.totalMarks);
    const obtainedMarks = Number(subject.obtainedMarks);
    if (!Number.isFinite(totalMarks) || totalMarks <= 0 || !Number.isFinite(obtainedMarks) || obtainedMarks < 0 || obtainedMarks > totalMarks) {
      return null;
    }
    const result = typeof subject.result === 'string' ? subject.result.trim() : '';
    if (result && result !== 'Pass' && result !== 'Fail') return null;
    subjects.push({
      id: randomUUID(),
      subject: subject.subject.trim(),
      totalMarks: String(totalMarks),
      obtainedMarks: String(obtainedMarks),
      percentage: ((obtainedMarks / totalMarks) * 100).toFixed(2),
      grade: typeof subject.grade === 'string' ? subject.grade.trim() : '',
      result,
    });
  }
  return subjects;
}

function validateUniversityCourses(value: FormDataEntryValue | null): UniversityCourse[] | null {
  if (typeof value !== 'string') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 100) return null;
  const courses: UniversityCourse[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const course = item as Record<string, unknown>;
    if (
      typeof course.courseName !== 'string' || !course.courseName.trim() || course.courseName.length > 100 ||
      typeof course.creditHours !== 'string' || typeof course.grade !== 'string' ||
      typeof course.totalMarks !== 'string' || typeof course.obtainedMarks !== 'string' ||
      course.grade.length > 10
    ) return null;
    if (Boolean(course.totalMarks) !== Boolean(course.obtainedMarks)) return null;
    if (course.creditHours) {
      const creditHours = Number(course.creditHours);
      if (!Number.isFinite(creditHours) || creditHours < 0.5 || creditHours > 20) return null;
    }
    if (course.totalMarks || course.obtainedMarks) {
      const totalMarks = Number(course.totalMarks);
      const obtainedMarks = Number(course.obtainedMarks);
      if (!Number.isFinite(totalMarks) || totalMarks <= 0 || !Number.isFinite(obtainedMarks) || obtainedMarks < 0 || obtainedMarks > totalMarks) return null;
    }
    courses.push({
      id: randomUUID(),
      courseName: course.courseName.trim(),
      creditHours: course.creditHours,
      grade: course.grade.trim(),
      totalMarks: course.totalMarks,
      obtainedMarks: course.obtainedMarks,
      percentage: course.totalMarks && course.obtainedMarks
        ? ((Number(course.obtainedMarks) / Number(course.totalMarks)) * 100).toFixed(2)
        : '',
    });
  }
  return courses;
}

export async function GET(request: Request) {
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const documentId = new URL(request.url).searchParams.get('documentId');
    if (documentId) {
      const client = await getPbmPrismaReady();
      const documents = await client.$queryRaw<Array<{
        blobUrl: string;
        fileName: string;
        contentType: string;
      }>>`
        SELECT "blobUrl", "fileName", "contentType"
        FROM "PbmChildDocument"
        WHERE id = ${documentId} AND "childId" = ${graduate.child.id}
        LIMIT 1
      `;
      const document = documents[0];
      if (!document) return NextResponse.json({ error: 'Result document not found.' }, { status: 404 });
      const blob = await get(document.blobUrl, { access: 'private' });
      if (!blob || blob.statusCode !== 200 || !blob.stream) {
        return NextResponse.json({ error: 'Stored result document is unavailable.' }, { status: 404 });
      }
      return new NextResponse(blob.stream, {
        headers: {
          'Content-Type': document.contentType,
          'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    return NextResponse.json({
      success: true,
      student: { fullName: graduate.child.fullName },
      entries: Array.isArray(graduate.child.universityProgress) ? graduate.child.universityProgress : [],
    });
  } catch (error) {
    console.error('Load PBM university progress error:', error);
    return NextResponse.json({ error: 'Unable to load College Life history.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uploadedBlobUrls: string[] = [];
  try {
    const graduate = await verifyPbmChildSession();
    if (!graduate) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });

    const formData = await request.formData();
    const recordType = readText(formData, 'recordType', 20) || 'college';
    if (recordType !== 'college' && recordType !== 'university') {
      return NextResponse.json({ error: 'Select College Life or University Life.' }, { status: 400 });
    }
    const commonData = {
      studentName: readText(formData, 'studentName', 200),
      fatherName: readText(formData, 'fatherName', 200),
      pshRegistrationNumber: readText(formData, 'pshRegistrationNumber', 100),
    };
    if (Object.values(commonData).some((value) => value === null || value === '')) {
      return NextResponse.json({ error: 'Complete the student information, including PBM Registration No.' }, { status: 400 });
    }

    const collegeData = {
      collegeType: readText(formData, 'collegeType', 30),
      collegeName: readText(formData, 'collegeName', 200),
      program: readText(formData, 'program', 50),
      sponsorshipSource: readText(formData, 'sponsorshipSource', 30),
      classYear: readText(formData, 'classYear', 100),
      rollNumber: readText(formData, 'rollNumber', 100),
      academicPeriod: readText(formData, 'academicPeriod', 100),
      passingYear: readText(formData, 'passingYear', 4),
    };
    const universityData = {
      institutionType: readText(formData, 'institutionType', 30),
      universityName: readText(formData, 'universityName', 200),
      campus: readText(formData, 'campus', 200),
      city: readText(formData, 'city', 100),
      province: readText(formData, 'province', 60),
      degreeLevel: readText(formData, 'degreeLevel', 50),
      degreeProgram: readText(formData, 'degreeProgram', 80),
      majorSubjects: readText(formData, 'majorSubjects', 200),
      universityRegistrationNumber: readText(formData, 'universityRegistrationNumber', 100),
      rollNumber: readText(formData, 'rollNumber', 100),
      admissionYear: readText(formData, 'admissionYear', 4),
      classYear: readText(formData, 'classYear', 100),
      academicPeriod: readText(formData, 'academicPeriod', 100),
      currentStatus: readText(formData, 'currentStatus', 30),
      gpa: readText(formData, 'gpa', 10),
      cgpa: readText(formData, 'cgpa', 10),
      passingYear: readText(formData, 'passingYear', 4),
      remarks: readText(formData, 'remarks', 1000),
    };
    let subjects: SubjectMark[] | null = null;
    let courses: UniversityCourse[] | null = null;
    let counsellingEntries: CounsellingEntry[] = [];
    let disciplinaryProceedings: CollegeDisciplinaryProceeding | null = null;
    if (recordType === 'college') {
      if (Object.values(collegeData).some((value) => value === null || value === '')) {
        return NextResponse.json({ error: 'Complete all required College Life fields.' }, { status: 400 });
      }
      if (
        !allowedCollegeTypes.has(collegeData.collegeType!) ||
        !allowedPrograms.has(collegeData.program!) ||
        !allowedCollegeSponsorshipSources.has(collegeData.sponsorshipSource!) ||
        !allowedCollegeYears.has(collegeData.classYear!) ||
        !/^\d{4}$/.test(collegeData.passingYear!) ||
        Number(collegeData.passingYear) < 1900 ||
        Number(collegeData.passingYear) > 2100
      ) {
        return NextResponse.json({ error: 'Select a valid college type and program, and enter a valid passing year.' }, { status: 400 });
      }
      subjects = validateSubjects(formData.get('subjects'));
      if (!subjects) {
        return NextResponse.json({ error: 'Enter valid subject names and marks. Obtained marks cannot exceed total marks.' }, { status: 400 });
      }
    } else {
      const requiredUniversityFields = [
        universityData.institutionType, universityData.universityName, universityData.city, universityData.province,
        universityData.degreeLevel, universityData.degreeProgram, universityData.majorSubjects, universityData.admissionYear,
        universityData.classYear, universityData.academicPeriod, universityData.currentStatus,
      ];
      if (requiredUniversityFields.some((value) => value === null || value === '')) {
        return NextResponse.json({ error: 'Complete all required University Life fields.' }, { status: 400 });
      }
      const validYear = (value: string | null) => value === null || (/^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 2100);
      const validGpa = (value: string | null) => value === null || value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 5);
      if (
        !allowedUniversityTypes.has(universityData.institutionType!) ||
        !allowedProvinces.has(universityData.province!) ||
        !allowedDegreeLevels.has(universityData.degreeLevel!) ||
        !allowedDegreePrograms.has(universityData.degreeProgram!) ||
        !allowedEnrollmentStatuses.has(universityData.currentStatus!) ||
        !validYear(universityData.admissionYear) ||
        !validYear(universityData.passingYear) ||
        (universityData.currentStatus === 'Completed' && !universityData.passingYear) ||
        !validGpa(universityData.gpa) ||
        !validGpa(universityData.cgpa)
      ) {
        return NextResponse.json({ error: 'Select valid university details and check the admission year, completion year, and GPA values.' }, { status: 400 });
      }
      courses = validateUniversityCourses(formData.get('courses'));
      if (!courses) {
        return NextResponse.json({ error: 'Enter valid course details. Marks must be provided together and obtained marks cannot exceed total marks.' }, { status: 400 });
      }
    }

    const validatedCounsellingEntries = validateCounsellingEntries(formData.get('counsellingEntries'));
    if (!validatedCounsellingEntries) {
      return NextResponse.json({ error: 'Enter valid counselling dates and details.' }, { status: 400 });
    }
    counsellingEntries = validatedCounsellingEntries;
    const validatedDisciplinaryProceedings = validateDisciplinaryProceeding(formData.get('disciplinaryProceedings'));
    if (validatedDisciplinaryProceedings === false) {
      return NextResponse.json({ error: 'Enter valid disciplinary proceeding details.' }, { status: 400 });
    }
    disciplinaryProceedings = validatedDisciplinaryProceedings;

    const file = formData.get('resultFile');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Upload the semester or year result.' }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) {
      return NextResponse.json({ error: 'Result files must be smaller than 12 MB.' }, { status: 400 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Only PDF, JPEG, PNG, and WebP result files are allowed.' }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validFileSignature(bytes, file.type)) {
      return NextResponse.json({ error: 'The selected result file does not match its declared file type.' }, { status: 400 });
    }
    const disciplinaryFiles = [
      {
        key: 'applicationFile',
        title: 'Application',
        documentType: recordType === 'college' ? 'COLLEGE_LIFE_DISCIPLINARY_APPLICATION' : 'UNIVERSITY_LIFE_DISCIPLINARY_APPLICATION',
        allowedTypes,
        maxBytes: MAX_DOCUMENT_BYTES,
      },
      {
        key: 'affidavitFile',
        title: 'Affidavit',
        documentType: recordType === 'college' ? 'COLLEGE_LIFE_DISCIPLINARY_AFFIDAVIT' : 'UNIVERSITY_LIFE_DISCIPLINARY_AFFIDAVIT',
        allowedTypes,
        maxBytes: MAX_DOCUMENT_BYTES,
      },
      {
        key: 'minutesPhotoFile',
        title: 'Minutes of the Expulsion Committee',
        documentType: recordType === 'college' ? 'COLLEGE_LIFE_EXPULSION_MINUTES' : 'UNIVERSITY_LIFE_EXPULSION_MINUTES',
        allowedTypes: new Set(['image/jpeg', 'image/png', 'image/webp']),
        maxBytes: 8 * 1024 * 1024,
      },
    ];
    const optionalDocuments: UploadedDisciplinaryDocument[] = [];
    for (const attachment of disciplinaryFiles) {
      const value = formData.get(attachment.key);
      if (value === null) continue;
      if (!(value instanceof File)) {
        return NextResponse.json({ error: `Choose a valid ${attachment.title.toLowerCase()} file.` }, { status: 400 });
      }
      if (!disciplinaryProceedings) {
        return NextResponse.json({ error: 'Select a proceeding type before adding disciplinary attachments.' }, { status: 400 });
      }
      if (attachment.key === 'minutesPhotoFile' && disciplinaryProceedings.type !== 'EXPELLED') {
        return NextResponse.json({ error: 'Expulsion committee minutes can only be added for an expelled proceeding.' }, { status: 400 });
      }
      if (value.size <= 0 || value.size > attachment.maxBytes || !attachment.allowedTypes.has(value.type)) {
        return NextResponse.json({ error: `The ${attachment.title.toLowerCase()} must be a supported file within the size limit.` }, { status: 400 });
      }
      const documentBytes = new Uint8Array(await value.arrayBuffer());
      if (!validFileSignature(documentBytes, value.type)) {
        return NextResponse.json({ error: `The ${attachment.title.toLowerCase()} does not match its declared file type.` }, { status: 400 });
      }
      optionalDocuments.push({
        id: randomUUID(),
        title: attachment.title,
        documentType: attachment.documentType,
        fileName: value.name.slice(0, 255),
        contentType: value.type,
        size: value.size,
        bytes: documentBytes,
      });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'PBM document storage is not configured.' }, { status: 503 });
    }

    const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    const blob = await put(`pbm/children/${graduate.child.id}/${randomUUID()}.${extension}`, new Blob([bytes], { type: file.type }), {
      access: 'private',
      addRandomSuffix: false,
      contentType: file.type,
    });
    uploadedBlobUrls.push(blob.url);
    for (const document of optionalDocuments) {
      const documentExtension = document.fileName.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
      const documentBuffer = new ArrayBuffer(document.bytes.byteLength);
      new Uint8Array(documentBuffer).set(document.bytes);
      const documentBlob = await put(
        `pbm/children/${graduate.child.id}/${randomUUID()}.${documentExtension}`,
        new Blob([documentBuffer], { type: document.contentType }),
        { access: 'private', addRandomSuffix: false, contentType: document.contentType }
      );
      document.blobUrl = documentBlob.url;
      uploadedBlobUrls.push(documentBlob.url);
    }

    const client = await getPbmPrismaReady();
    const entryId = randomUUID();
    const documentId = randomUUID();
    const resultDocument = { id: documentId, fileName: file.name.slice(0, 255) };
    const entry = recordType === 'college'
      ? {
          id: entryId,
          recordType,
          ...commonData,
          ...collegeData,
          subjects: subjects!,
          totalMarks: String(subjects!.reduce((sum, subject) => sum + Number(subject.totalMarks), 0)),
          obtainedMarks: String(subjects!.reduce((sum, subject) => sum + Number(subject.obtainedMarks), 0)),
          resultDocument,
          counsellingEntries,
          disciplinaryProceedings,
          disciplinaryDocuments: optionalDocuments.map(({ id, title, documentType, fileName }) => ({ id, title, documentType, fileName })),
          createdAt: new Date().toISOString(),
        }
      : {
          id: entryId,
          recordType,
          ...commonData,
          ...universityData,
          courses: courses!,
          resultDocument,
          counsellingEntries,
          disciplinaryProceedings,
          disciplinaryDocuments: optionalDocuments.map(({ id, title, documentType, fileName }) => ({ id, title, documentType, fileName })),
          createdAt: new Date().toISOString(),
        };

    await client.$transaction(async (transaction) => {
      await transaction.$executeRaw`
        INSERT INTO "PbmChildDocument" (id, "childId", title, "documentType", "blobUrl", "fileName", "contentType", "byteSize")
        VALUES (
          ${documentId},
          ${graduate.child.id},
          ${`${recordType === 'college' ? 'College Life Result' : 'University Life Transcript'} - ${recordType === 'college' ? collegeData.academicPeriod : universityData.academicPeriod}`.slice(0, 120)},
          ${recordType === 'college' ? 'College Life Result' : 'University Life Transcript'},
          ${blob.url},
          ${file.name.slice(0, 255)},
          ${file.type},
          ${file.size}
        )
      `;
      for (const document of optionalDocuments) {
        if (!document.blobUrl) throw new Error('COLLEGE_LIFE_DOCUMENT_UPLOAD_FAILED');
        await transaction.$executeRaw`
          INSERT INTO "PbmChildDocument" (id, "childId", title, "documentType", "blobUrl", "fileName", "contentType", "byteSize")
          VALUES (
            ${document.id},
            ${graduate.child.id},
            ${`${document.title} - ${recordType === 'college' ? collegeData.academicPeriod : universityData.academicPeriod}`.slice(0, 120)},
            ${document.documentType},
            ${document.blobUrl},
            ${document.fileName},
            ${document.contentType},
            ${document.size}
          )
        `;
      }
      const updated = await transaction.$executeRaw`
        UPDATE "PbmChildRecord"
        SET "universityProgress" = COALESCE("universityProgress", '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb,
            "updatedAt" = NOW()
        WHERE id = ${graduate.child.id}
          AND "careerUsername" = ${graduate.session.username}
      `;
      if (updated !== 1) throw new Error('PBM_CHILD_SESSION_EXPIRED');
    });
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    if (uploadedBlobUrls.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
      await Promise.all(uploadedBlobUrls.map((blobUrl) =>
        del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch((cleanupError: unknown) => {
          console.error('Clean up unattached College Life document error:', cleanupError);
        })
      ));
    }
    if (error instanceof Error && error.message === 'PBM_CHILD_SESSION_EXPIRED') {
      return NextResponse.json({ error: 'Your session is no longer valid. Please sign in again.' }, { status: 401 });
    }
    console.error('Save PBM university progress error:', error);
    return NextResponse.json({ error: 'Unable to save your College Life record.' }, { status: 500 });
  }
}
