import { AcademicManagement, type AcademicChild } from '@/components/academic/AcademicManagement';
import { redirect } from 'next/navigation';
import { getPbmStaffSession } from '@/lib/pbm-auth';
import { getPbmPrismaReady } from '@/lib/pbm-db';

function getCollegeEntries(value: unknown): AcademicChild['collegeProgress'] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const record = entry as Record<string, unknown>;
    const text = (key: string) => (typeof record[key] === 'string' ? record[key] as string : '');
    return [{
      id: text('id'),
      institutionName: text('collegeName'),
      program: text('classProgram'),
      subjects: text('groupSubjects'),
      awardingBody: text('boardUniversity'),
      admissionYear: text('admissionYear'),
      registrationNumber: text('registrationNumber'),
      rollNumber: text('rollNumber'),
      currentStatus: text('currentStatus'),
      remarks: text('remarks'),
      createdAt: text('createdAt'),
    }];
  });
}

export default async function AcademicPage() {
  const staff = await getPbmStaffSession();
  if (!staff) redirect('/pbm-staff/login?next=%2Facademic');

  const client = await getPbmPrismaReady();
  const children = await client.$queryRaw<Array<{
    id: string;
    admissionNo: string;
    fullName: string;
    collegeProgress: unknown;
  }>>`
    SELECT id, "admissionNo", "fullName", "collegeProgress"
    FROM "PbmChildRecord"
    ORDER BY "fullName" ASC
  `;
  const academicChildren: AcademicChild[] = children.map((child) => ({
    id: child.id,
    childId: child.admissionNo,
    fullName: child.fullName,
    collegeProgress: getCollegeEntries(child.collegeProgress),
  }));

  return <AcademicManagement children={academicChildren} />;
}
