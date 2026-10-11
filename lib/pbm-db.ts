import 'server-only';

import { Prisma, PrismaClient } from '@prisma/client';

const globalForPbmPrisma = globalThis as typeof globalThis & {
  pbmPrisma?: PrismaClient;
  pbmSchemaReady?: Promise<void>;
};

export function getPbmPrisma(): PrismaClient {
  if (!process.env.PBM_DATABASE_URL?.trim()) {
    throw new Error('PBM_DATABASE_URL is not configured.');
  }

  if (!globalForPbmPrisma.pbmPrisma) {
    globalForPbmPrisma.pbmPrisma = new PrismaClient({
      datasourceUrl: process.env.PBM_DATABASE_URL.trim(),
      log: ['error'],
    });
  }
  return globalForPbmPrisma.pbmPrisma;
}

export async function ensurePbmSchema(): Promise<void> {
  if (globalForPbmPrisma.pbmSchemaReady) {
    return globalForPbmPrisma.pbmSchemaReady;
  }

  const client = getPbmPrisma();
  globalForPbmPrisma.pbmSchemaReady = (async () => {
    await client.$executeRaw(Prisma.sql`
      CREATE TABLE IF NOT EXISTS "PbmStaffUser" (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        "displayName" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
        active BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.$executeRaw(Prisma.sql`
      CREATE TABLE IF NOT EXISTS "PbmChildRecord" (
        id TEXT PRIMARY KEY,
        "admissionNo" TEXT NOT NULL UNIQUE,
        "fullName" TEXT NOT NULL,
        payload JSONB NOT NULL,
        "collegeProgress" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "universityProgress" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "careerProfile" JSONB,
        "careerUsername" TEXT UNIQUE,
        "careerPasswordHash" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.$executeRaw(Prisma.sql`
      CREATE TABLE IF NOT EXISTS "PbmChildDocument" (
        id TEXT PRIMARY KEY,
        "childId" TEXT NOT NULL REFERENCES "PbmChildRecord"(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        "documentType" TEXT NOT NULL,
        "blobUrl" TEXT NOT NULL UNIQUE,
        "fileName" TEXT NOT NULL,
        "contentType" TEXT NOT NULL,
        "byteSize" INTEGER NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  })().catch((error: unknown) => {
    globalForPbmPrisma.pbmSchemaReady = undefined;
    throw error;
  });

  return globalForPbmPrisma.pbmSchemaReady;
}

export async function getPbmPrismaReady(): Promise<PrismaClient> {
  const client = getPbmPrisma();
  await ensurePbmSchema();
  return client;
}

export function isPbmUniqueViolation(error: unknown): boolean {
  return error instanceof Error &&
    (error.message.includes('23505') || error.message.includes('Unique constraint'));
}
