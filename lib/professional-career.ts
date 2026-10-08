import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/auth';

export const PROFESSIONAL_CAREER_COOKIE = 'psh_professional_career_session';

export interface ProfessionalCareerProfile {
  name: string;
  currentStatus: string;
  schoolOrUniversity: string;
  programOrDegree: string;
  currentClassYear: string;
  employer: string;
  jobTitle: string;
  location: string;
  notes: string;
  updatedAt: string;
}

export interface ProfessionalCareerAccount {
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface ProfessionalCareerData {
  account?: ProfessionalCareerAccount;
  profile?: ProfessionalCareerProfile;
}

export interface ProfessionalCareerSession {
  childId: string;
  username: string;
}

export function parseChildDossier(notes: string | null): Record<string, unknown> {
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

export function getProfessionalCareerData(dossier: Record<string, unknown>): ProfessionalCareerData {
  const value = dossier.professionalCareer;
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as ProfessionalCareerData
    : {};
}

export function preserveProfessionalCareerData(
  existingNotes: string | null,
  incomingNotes: string | null
): string | null {
  const existingDossier = parseChildDossier(existingNotes);
  const existingCareer = getProfessionalCareerData(existingDossier);
  const incomingDossier = parseChildDossier(incomingNotes);
  const incomingCareer = getProfessionalCareerData(incomingDossier);
  const nextDossier = { ...incomingDossier };

  if (existingCareer.account || existingCareer.profile) {
    nextDossier.professionalCareer = { ...incomingCareer, ...existingCareer };
  }
  if (Array.isArray(existingDossier.collegeProgress)) {
    nextDossier.collegeProgress = existingDossier.collegeProgress;
  }
  if (Array.isArray(existingDossier.universityProgress)) {
    nextDossier.universityProgress = existingDossier.universityProgress;
  }

  return Object.keys(nextDossier).length > 0 || incomingNotes ? JSON.stringify(nextDossier) : null;
}

export function redactProfessionalCareerAccount(notes: string | null): string | null {
  const dossier = parseChildDossier(notes);
  const careerData = getProfessionalCareerData(dossier);
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

export function signProfessionalCareerSession(session: ProfessionalCareerSession): string {
  return jwt.sign({ ...session, type: 'professional-career' }, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyProfessionalCareerSession(token: string): ProfessionalCareerSession | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (
      typeof payload === 'object' &&
      payload !== null &&
      payload.type === 'professional-career' &&
      typeof payload.childId === 'string' &&
      typeof payload.username === 'string'
    ) {
      return { childId: payload.childId, username: payload.username };
    }
  } catch {
    return null;
  }

  return null;
}
