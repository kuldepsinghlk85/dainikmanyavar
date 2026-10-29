import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'कृपया यूजर आईडी / ईमेल / मोबाइल व पासवर्ड दर्ज करें।' },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim();

    // Find User by email or by ReporterProfile.reporterId or by ReporterProfile.mobileNumber
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { reporterProfile: { reporterId: cleanIdentifier } },
          { reporterProfile: { mobileNumber: cleanIdentifier } },
        ],
      },
      include: {
        reporterProfile: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'यूजर आईडी या पासवर्ड गलत है।' },
        { status: 401 }
      );
    }

    if (!user.active || (user.reporterProfile && !user.reporterProfile.active)) {
      return NextResponse.json(
        { success: false, error: 'यह रिपोर्टर खाता निष्क्रिय (Inactive) कर दिया गया है। कृपया मुख्य संपादक से संपर्क करें।' },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'यूजर आईडी या पासवर्ड गलत है।' },
        { status: 401 }
      );
    }

    // Ensure user has a ReporterProfile record
    if (!user.reporterProfile) {
      // Auto-initialize profile for editor/admin or newly assigned reporter
      const randomRepId = 'DM-REP-' + Math.floor(1000 + Math.random() * 9000);
      const newProfile = await db.reporterProfile.create({
        data: {
          userId: user.id,
          reporterId: randomRepId,
          fullName: user.name,
          designation: user.role === 'EDITOR' ? 'संपादक' : 'संवाददाता',
          active: true,
        },
        include: {
          location: true,
        },
      });
      user = { ...user, reporterProfile: newProfile };
    }

    // Set reporter_token cookie
    const token = `${user.id}:${Date.now()}`;
    const cookieStore = await cookies();
    cookieStore.set('reporter_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'रिपोर्टर लॉगिन सफल!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        reporterProfile: user.reporterProfile,
      },
    });
  } catch (error) {
    console.error('Reporter login error:', error);
    return NextResponse.json(
      { success: false, error: 'लॉगिन के दौरान सर्वर त्रुटि हुई।' },
      { status: 500 }
    );
  }
}
