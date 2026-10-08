'use client';

import { useState } from 'react';
import { BriefcaseBusiness } from 'lucide-react';
import { ProfessionalCareerAccountModal } from './ProfessionalCareerAccountModal';

export function ProfessionalCareerAccountControl({
  childId,
  childName,
}: {
  childId: string;
  childName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
      >
        <BriefcaseBusiness className="h-4 w-4" />
        Professional Career Login
      </button>
      <ProfessionalCareerAccountModal
        isOpen={isOpen}
        childId={childId}
        childName={childName}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
