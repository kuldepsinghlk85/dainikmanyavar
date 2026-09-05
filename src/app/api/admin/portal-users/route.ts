import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश (Unauthorized)' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const city = searchParams.get('city')?.trim() || '';
    const state = searchParams.get('state')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const newsletter = searchParams.get('newsletter')?.trim();
    const imported = searchParams.get('imported')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25')));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { mobileNumber: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (city) where.city = city;
    if (state) where.state = state;
    if (status) where.status = status;
    if (newsletter === 'true') where.newsletterSubscribed = true;
    if (newsletter === 'false') where.newsletterSubscribed = false;
    if (imported === 'true') where.isImported = true;

    const [total, users] = await Promise.all([
      db.portalUser.count({ where }),
      db.portalUser.findMany({
        where,
        orderBy: { registrationDate: 'desc' },
        skip,
        take: limit,
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
          createdAt: true,
          _count: {
            select: {
              activityLogs: true,
              notificationLogs: true,
              savedArticles: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin portal users GET error:', error);
    return NextResponse.json({ success: false, error: 'यूज़र्स लोड करने में विफल।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, mobileNumber, email, city, state, newsletterSubscribed = true, whatsappPermission = true } = body;

    if (!fullName || !mobileNumber) {
      return NextResponse.json({ success: false, error: 'नाम और मोबाइल नंबर आवश्यक हैं।' }, { status: 400 });
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return NextResponse.json({ success: false, error: '10 अंकों का वैध मोबाइल नंबर दर्ज करें।' }, { status: 400 });
    }

    const existing = await db.portalUser.findUnique({ where: { mobileNumber: cleanMobile } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'यह मोबाइल नंबर पहले से मौजूद है।' }, { status: 409 });
    }

    const newUser = await db.portalUser.create({
      data: {
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        email: email?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || 'उत्तर प्रदेश',
        status: 'ACTIVE',
        newsletterSubscribed: Boolean(newsletterSubscribed),
        whatsappPermission: Boolean(whatsappPermission),
      },
    });

    if (newsletterSubscribed && email && email.includes('@')) {
      try {
        await db.newsletterSubscriber.upsert({
          where: { email: email.trim().toLowerCase() },
          update: { status: 'active' },
          create: { email: email.trim().toLowerCase(), status: 'active' },
        });
      } catch (_) {}
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: 'CREATE_PORTAL_USER',
        objectType: 'PortalUser',
        objectId: newUser.id,
        detailsJson: JSON.stringify({ fullName, mobileNumber: cleanMobile }),
      },
    });

    return NextResponse.json({ success: true, message: 'यूज़र सफलतापूर्वक जोड़ा गया!', user: newUser });
  } catch (error) {
    console.error('Admin create portal user error:', error);
    return NextResponse.json({ success: false, error: 'नया यूज़र जोड़ने में विफल।' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, fullName, email, city, state, status, newsletterSubscribed, whatsappPermission } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const updated = await db.portalUser.update({
      where: { id },
      data: {
        ...(fullName ? { fullName: fullName.trim() } : {}),
        ...(email !== undefined ? { email: email ? email.trim() : null } : {}),
        ...(city !== undefined ? { city: city ? city.trim() : null } : {}),
        ...(state !== undefined ? { state: state ? state.trim() : null } : {}),
        ...(status ? { status } : {}),
        ...(newsletterSubscribed !== undefined ? { newsletterSubscribed: Boolean(newsletterSubscribed) } : {}),
        ...(whatsappPermission !== undefined ? { whatsappPermission: Boolean(whatsappPermission) } : {}),
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: 'UPDATE_PORTAL_USER',
        objectType: 'PortalUser',
        objectId: id,
        detailsJson: JSON.stringify({ status, newsletterSubscribed, whatsappPermission }),
      },
    });

    return NextResponse.json({ success: true, message: 'यूज़र रिकॉर्ड अपडेट हो गया!', user: updated });
  } catch (error) {
    console.error('Admin update portal user error:', error);
    return NextResponse.json({ success: false, error: 'अपडेट करने में विफल।' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    await db.portalUser.delete({
      where: { id },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: 'DELETE_PORTAL_USER',
        objectType: 'PortalUser',
        objectId: id,
      },
    });

    return NextResponse.json({ success: true, message: 'यूज़र सफलतापूर्वक हटा दिया गया।' });
  } catch (error) {
    console.error('Admin delete portal user error:', error);
    return NextResponse.json({ success: false, error: 'यूज़र हटाने में विफल।' }, { status: 500 });
  }
}
