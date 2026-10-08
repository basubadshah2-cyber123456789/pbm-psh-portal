import { AppLayout } from '@/components/layout/AppLayout';
import { AcademicManagement, type AcademicChild } from '@/components/academic/AcademicManagement';
import { requireModuleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseChildDossier } from '@/lib/professional-career';

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
  await requireModuleAccess('academic');

  const children = await prisma.child.findMany({
    select: { id: true, childId: true, fullName: true, notes: true },
    orderBy: { fullName: 'asc' },
  });

  const academicChildren: AcademicChild[] = children.map((child) => {
    const dossier = parseChildDossier(child.notes);
    return {
      id: child.id,
      childId: child.childId,
      fullName: child.fullName,
      collegeProgress: getCollegeEntries(dossier.collegeProgress),
    };
  });

  return (
    <AppLayout>
      <AcademicManagement children={academicChildren} />
    </AppLayout>
  );
}
