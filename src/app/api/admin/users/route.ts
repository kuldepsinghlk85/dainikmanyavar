import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMINISTRATOR')) {
      return NextResponse.json({ success: false, error: 'अनधिकृत: केवल सुपर एडमिन ही स्टाफ सूची देख सकते हैं।' }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'उपयोगकर्ता सूची लोड करने में विफल' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMINISTRATOR')) {
      return NextResponse.json({ success: false, error: 'अनधिकृत: केवल सुपर एडमिन ही नया स्टाफ जोड़ सकते हैं।' }, { status: 403 });
    }

    const { name, email, password, role = 'EDITOR' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'नाम, ईमेल और पासवर्ड आवश्यक हैं।' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'यह ईमेल पहले से पंजीकृत है।' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'नया उपयोगकर्ता बनाने में विफल' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMINISTRATOR')) {
      return NextResponse.json({ success: false, error: 'अनधिकृत: केवल सुपर एडमिन ही स्टाफ विवरण या पासवर्ड बदल सकते हैं।' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, newPassword, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'यूजर आईडी आवश्यक है।' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (typeof active === 'boolean') updateData.active = active;

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ success: false, error: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' }, { status: 400 });
      }
      updateData.password = await hashPassword(newPassword.trim());
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json({ success: true, data: updated, message: 'उपयोगकर्ता का विवरण व पासवर्ड सफलतापूर्वक अपडेट किया गया!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
