import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'कृपया एक्सेल (.xlsx / .csv) फ़ाइल अपलोड करें।' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ success: false, error: 'एक्सेल शीट खाली है।' }, { status: 400 });
    }

    const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json({ success: false, error: 'फ़ाइल में कोई डेटा नहीं मिला।' }, { status: 400 });
    }

    // Process & Normalize Columns
    let totalRows = rawRows.length;
    let invalidCount = 0;
    const validRowsMap = new Map<string, { fullName: string; mobile: string; email?: string; city?: string; state?: string }>();

    for (const row of rawRows) {
      // Find name key
      const nameKey = Object.keys(row).find((k) =>
        /^(name|full_name|fullname|नाम|यूज़र नाम)$/i.test(k.trim())
      );
      // Find mobile key
      const mobileKey = Object.keys(row).find((k) =>
        /^(mobile|phone|mobile_number|mobilenumber|contact|फ़ोन|मोबाइल)$/i.test(k.trim())
      );
      // Find email key
      const emailKey = Object.keys(row).find((k) =>
        /^(email|e-mail|ईमेल|मेल)$/i.test(k.trim())
      );
      // Find city key
      const cityKey = Object.keys(row).find((k) =>
        /^(city|शहर|जिला|district)$/i.test(k.trim())
      );

      const fullName = nameKey ? String(row[nameKey]).trim() : '';
      const rawMobile = mobileKey ? String(row[mobileKey]).trim() : '';
      const email = emailKey ? String(row[emailKey]).trim().toLowerCase() : '';
      const city = cityKey ? String(row[cityKey]).trim() : '';

      const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);

      if (!fullName || cleanMobile.length !== 10) {
        invalidCount++;
        continue;
      }

      // Deduplicate within the file
      if (!validRowsMap.has(cleanMobile)) {
        validRowsMap.set(cleanMobile, {
          fullName,
          mobile: cleanMobile,
          email: email.includes('@') ? email : undefined,
          city: city || undefined,
        });
      }
    }

    const uniqueNumbers = Array.from(validRowsMap.keys());
    if (uniqueNumbers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'फ़ाइल में कोई मान्य मोबाइल नंबर नहीं मिला। कृपया फॉर्मेट जांचें (Name, Mobile, Email)।',
      }, { status: 400 });
    }

    // Check existing numbers in DB (Deduplication against database)
    const existingUsers = await db.portalUser.findMany({
      where: { mobileNumber: { in: uniqueNumbers } },
      select: { mobileNumber: true },
    });

    const existingSet = new Set(existingUsers.map((u) => u.mobileNumber));
    const toInsert = uniqueNumbers
      .filter((num) => !existingSet.has(num))
      .map((num) => validRowsMap.get(num)!);

    const duplicatesCount = totalRows - invalidCount - toInsert.length;

    // Batch insert users in SQLite safely (chunks of 100)
    let importedCount = 0;
    const chunkSize = 100;
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      await db.portalUser.createMany({
        data: chunk.map((user) => ({
          fullName: user.fullName,
          mobileNumber: user.mobile,
          email: user.email || null,
          city: user.city || null,
          state: 'उत्तर प्रदेश',
          status: 'ACTIVE',
          newsletterSubscribed: true,
          whatsappPermission: true,
          isImported: true,
        })),
      });
      importedCount += chunk.length;

      // Add to Newsletter Subscribers if email exists
      const emailsToSub = chunk
        .map((u) => u.email)
        .filter((e): e is string => Boolean(e && e.includes('@')));

      for (const email of emailsToSub) {
        try {
          await db.newsletterSubscriber.upsert({
            where: { email },
            update: { status: 'active' },
            create: { email, status: 'active' },
          });
        } catch (_) {}
      }
    }

    // Log in AuditLog
    await db.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: 'EXCEL_USER_IMPORT',
        objectType: 'PortalUser',
        detailsJson: JSON.stringify({
          filename: file.name,
          totalRows,
          importedCount,
          duplicatesCount,
          invalidCount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `सफलतापूर्वक ${importedCount} यूज़र्स इम्पोर्ट किए गए!`,
      stats: {
        totalRows,
        importedCount,
        duplicatesCount,
        invalidCount,
      },
    });
  } catch (error) {
    console.error('Excel import error:', error);
    return NextResponse.json({ success: false, error: 'एक्सेल फ़ाइल प्रोसेस करने में त्रुटि हुई।' }, { status: 500 });
  }
}
