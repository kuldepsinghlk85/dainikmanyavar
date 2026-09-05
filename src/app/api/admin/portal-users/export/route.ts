import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'xlsx';
    const city = searchParams.get('city')?.trim();
    const state = searchParams.get('state')?.trim();
    const status = searchParams.get('status')?.trim();
    const newsletter = searchParams.get('newsletter')?.trim();
    const imported = searchParams.get('imported')?.trim();

    const where: any = {};
    if (city) where.city = city;
    if (state) where.state = state;
    if (status) where.status = status;
    if (newsletter === 'true') where.newsletterSubscribed = true;
    if (newsletter === 'false') where.newsletterSubscribed = false;
    if (imported === 'true') where.isImported = true;

    const users = await db.portalUser.findMany({
      where,
      orderBy: { registrationDate: 'desc' },
      take: 10000,
      select: {
        id: true,
        fullName: true,
        mobileNumber: true,
        email: true,
        city: true,
        state: true,
        status: true,
        newsletterSubscribed: true,
        whatsappPermission: true,
        isImported: true,
        registrationDate: true,
        lastLogin: true,
      },
    });

    const rows = users.map((u, index) => ({
      'क्र.सं. (S.No)': index + 1,
      'यूज़र का नाम (Name)': u.fullName,
      'मोबाइल नंबर (Mobile)': u.mobileNumber,
      'ईमेल (Email)': u.email || '',
      'शहर (City)': u.city || '',
      'राज्य (State)': u.state || '',
      'स्थिति (Status)': u.status,
      'न्यूज़लेटर सब्सक्रिप्शन': u.newsletterSubscribed ? 'हाँ (Active)' : 'नहीं',
      'व्हाट्सएप परमिशन': u.whatsappPermission ? 'हाँ' : 'नहीं',
      'इम्पोर्टेड यूज़र': u.isImported ? 'हाँ' : 'नहीं',
      'पंजीकरण तिथि (Reg Date)': new Date(u.registrationDate).toLocaleDateString('hi-IN'),
      'अंतिम लॉगिन (Last Login)': u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('hi-IN') : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const todayStr = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csvOutput, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="dainik-manyavar-users-${todayStr}.csv"`,
        },
      });
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="dainik-manyavar-users-${todayStr}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export users error:', error);
    return NextResponse.json({ success: false, error: 'यूज़र्स एक्सपोर्ट करने में विफल।' }, { status: 500 });
  }
}
