import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmployeeDataManagement } from '@/components/employees/EmployeeDataManagement';

export default async function EmployeesPage() {
  await requireModuleAccess('staff');

  return (
    <AppLayout>
      <EmployeeDataManagement />
    </AppLayout>
  );
}
