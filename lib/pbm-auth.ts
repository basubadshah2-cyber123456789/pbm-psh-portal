import 'server-only';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getPbmPrismaReady } from '@/lib/pbm-db';

export const PBM_STAFF_COOKIE = 'pbm_staff_session';
export const PBM_CHILD_COOKIE = 'pbm_child_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export interface PbmStaffSession {
  id: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'STAFF';
}

export interface PbmChildSession {
  childId: string;
  username: string;
}

function getPbmSessionSecret(): string {
  const secret = process.env.PBM_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('PBM_SESSION_SECRET must contain at least 32 characters.');
  }
  return secret;
}

export function assertPbmSessionConfiguration(): void {
  getPbmSessionSecret();
}

export function signPbmSession(session: PbmStaffSession | PbmChildSession, type: 'staff' | 'child'): string {
  return jwt.sign({ ...session, type }, getPbmSessionSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

function verifyPbmSession(token: string, type: 'staff' | 'child'): Record<string, unknown> | null {
  const secret = getPbmSessionSecret();
  try {
    const payload: unknown = jwt.verify(token, secret);
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'type' in payload && payload.type === type) {
      return payload as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

export async function getPbmStaffSession(): Promise<PbmStaffSession | null> {
  const token = (await cookies()).get(PBM_STAFF_COOKIE)?.value;
  const payload = token ? verifyPbmSession(token, 'staff') : null;
  if (!payload || typeof payload.id !== 'string') return null;

  const client = await getPbmPrismaReady();
  const rows = await client.$queryRaw<Array<{
    id: string;
    username: string;
    displayName: string;
    role: 'ADMIN' | 'STAFF';
  }>>`
    SELECT id, username, "displayName", role
    FROM "PbmStaffUser"
    WHERE id = ${payload.id} AND active = TRUE
    LIMIT 1
  `;
  const user = rows[0];
  if (!user || user.username !== payload.username) return null;
  return user;
}

export async function getPbmChildSession(): Promise<PbmChildSession | null> {
  const token = (await cookies()).get(PBM_CHILD_COOKIE)?.value;
  const payload = token ? verifyPbmSession(token, 'child') : null;
  if (!payload || typeof payload.childId !== 'string' || typeof payload.username !== 'string') return null;
  return { childId: payload.childId, username: payload.username };
}

export async function verifyPbmChildSession() {
  const session = await getPbmChildSession();
  if (!session) return null;
  const client = await getPbmPrismaReady();
  const rows = await client.$queryRaw<Array<{
    id: string;
    fullName: string;
    payload: unknown;
    collegeProgress: unknown;
    universityProgress: unknown;
    careerProfile: unknown;
    careerUsername: string | null;
  }>>`
    SELECT id, "fullName", payload, "collegeProgress", "universityProgress",
           "careerProfile", "careerUsername"
    FROM "PbmChildRecord"
    WHERE id = ${session.childId} AND "careerUsername" = ${session.username}
    LIMIT 1
  `;
  const child = rows[0];
  return child ? { session, child } : null;
}

export async function verifyPbmPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function createPbmPasswordHash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export const PBM_SESSION_TTL_SECONDS = SESSION_TTL_SECONDS;
