function parseChildDossier(notes: string | null): Record<string, unknown> {
  if (!notes) return {};

  try {
    const parsed: unknown = JSON.parse(notes);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return { legacyNotes: notes };
  }

  return { legacyNotes: notes };
}

function getLegacyCareerData(dossier: Record<string, unknown>): Record<string, unknown> {
  const value = dossier.professionalCareer;
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function preserveLegacyCareerData(
  existingNotes: string | null,
  incomingNotes: string | null
): string | null {
  const existingDossier = parseChildDossier(existingNotes);
  const existingCareer = getLegacyCareerData(existingDossier);
  if (!existingCareer.account && !existingCareer.profile) return incomingNotes;

  const incomingDossier = parseChildDossier(incomingNotes);
  const incomingCareer = getLegacyCareerData(incomingDossier);
  return JSON.stringify({
    ...incomingDossier,
    professionalCareer: { ...incomingCareer, ...existingCareer },
  });
}

export function redactLegacyCareerAccount(notes: string | null): string | null {
  const dossier = parseChildDossier(notes);
  const careerData = getLegacyCareerData(dossier);
  if (!careerData.account) return notes;

  const { account: _account, ...publicCareerData } = careerData;
  const nextDossier = { ...dossier };
  if (publicCareerData.profile) {
    nextDossier.professionalCareer = publicCareerData;
  } else {
    delete nextDossier.professionalCareer;
  }
  return JSON.stringify(nextDossier);
}
