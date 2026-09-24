import { PrismaClient } from '@prisma/client';
import { employeeDirectoryData } from '../lib/employee-directory-data';

const prisma = new PrismaClient();

async function main() {
  await prisma.employeeDirectoryEntry.deleteMany({});
  await prisma.employeeDirectoryEntry.createMany({ data: [...employeeDirectoryData] });
  console.log(`Seeded ${employeeDirectoryData.length} employee directory records.`);
}

main()
  .catch((error) => {
    console.error('Employee directory seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
