import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

async function getDirectoryManager() {
  const user = await requireAuth();
  return user.role === Role.INCHARGE || user.role === Role.HR_REPRESENTATIVE ? user : null;
}

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const designation = searchParams.get('designation')?.trim() || '';

    const entries = await prisma.employeeDirectoryEntry.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { designation: { contains: search, mode: 'insensitive' } },
                { idCardNo: { contains: search, mode: 'insensitive' } },
                { fatherHusbandName: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(designation && designation !== 'ALL' ? { designation } : {}),
      },
      select: {
        id: true,
        srNo: true,
        name: true,
        designation: true,
        idCardNo: true,
        fatherHusbandName: true,
        phoneNumber: true,
        loginAccount: true,
        status: true,
      },
      orderBy: { srNo: 'asc' },
    });

    return NextResponse.json({ success: true, employees: entries });
  } catch (error) {
    console.error('Employee directory fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch employee data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const manager = await getDirectoryManager();
    if (!manager) return NextResponse.json({ error: 'Unauthorized to edit employee data' }, { status: 403 });
    const { id, name, designation, idCardNo, fatherHusbandName, phoneNumber, loginAccount, status } = await request.json();
    if (!id || !name?.trim() || !designation?.trim() || !idCardNo?.trim()) {
      return NextResponse.json({ error: 'Name, designation, and ID card number are required' }, { status: 400 });
    }
    const employee = await prisma.employeeDirectoryEntry.update({
      where: { id: String(id) },
      data: {
        name: name.trim(),
        designation: designation.trim(),
        idCardNo: idCardNo.trim(),
        fatherHusbandName: String(fatherHusbandName || '').trim(),
        phoneNumber: String(phoneNumber || '').trim(),
        loginAccount: String(loginAccount || '').trim(),
        status: String(status || 'PENDING').trim(),
      },
      select: { id: true, srNo: true, name: true, designation: true, idCardNo: true, fatherHusbandName: true, phoneNumber: true, loginAccount: true, status: true },
    });
    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error('Employee directory update error:', error);
    return NextResponse.json({ error: 'Failed to update employee data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const manager = await getDirectoryManager();
    if (!manager) return NextResponse.json({ error: 'Unauthorized to delete employee data' }, { status: 403 });
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Employee record ID is required' }, { status: 400 });
    await prisma.employeeDirectoryEntry.delete({ where: { id: String(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Employee directory delete error:', error);
    return NextResponse.json({ error: 'Failed to delete employee data' }, { status: 500 });
  }
}
