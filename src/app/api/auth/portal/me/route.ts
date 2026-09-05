import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalUserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getPortalUserSession();
    if (!user) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    // Get counts
    const [savedCount, activityCount] = await Promise.all([
      db.userSavedArticle.count({ where: { userId: user.id } }),
      db.userActivityLog.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
      stats: {
        savedCount,
        activityCount,
      },
    });
  } catch (error) {
    console.error('Portal user me GET error:', error);
    return NextResponse.json({ success: false, error: 'सर्वर त्रुटि' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getPortalUserSession();
    if (!user) {
      return NextResponse.json({ success: false, error: 'अनधिकृत (Unauthorized)' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, email, city, state, profileImage, newsletterSubscribed, whatsappPermission } = body;

    const updated = await db.portalUser.update({
      where: { id: user.id },
      data: {
        ...(fullName ? { fullName: fullName.trim() } : {}),
        ...(email !== undefined ? { email: email ? email.trim() : null } : {}),
        ...(city !== undefined ? { city: city ? city.trim() : null } : {}),
        ...(state !== undefined ? { state: state ? state.trim() : null } : {}),
        ...(profileImage !== undefined ? { profileImage } : {}),
        ...(newsletterSubscribed !== undefined ? { newsletterSubscribed: Boolean(newsletterSubscribed) } : {}),
        ...(whatsappPermission !== undefined ? { whatsappPermission: Boolean(whatsappPermission) } : {}),
      },
      select: {
        id: true,
        fullName: true,
        mobileNumber: true,
        email: true,
        city: true,
        state: true,
        profileImage: true,
        status: true,
        newsletterSubscribed: true,
        whatsappPermission: true,
        registrationDate: true,
      },
    });

    // If newsletter subscription changed and email exists, sync NewsletterSubscriber table
    const finalEmail = updated.email || user.email;
    if (finalEmail && finalEmail.includes('@')) {
      if (updated.newsletterSubscribed) {
        await db.newsletterSubscriber.upsert({
          where: { email: finalEmail.trim().toLowerCase() },
          update: { status: 'active' },
          create: { email: finalEmail.trim().toLowerCase(), status: 'active' },
        });
      } else {
        await db.newsletterSubscriber.updateMany({
          where: { email: finalEmail.trim().toLowerCase() },
          data: { status: 'unsubscribed', unsubscribedAt: new Date() },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'प्रोफाइल सफलतापूर्वक अपडेट हो गई!',
      user: updated,
    });
  } catch (error) {
    console.error('Portal user me PUT error:', error);
    return NextResponse.json({ success: false, error: 'प्रोफाइल अपडेट करने में विफल।' }, { status: 500 });
  }
}
