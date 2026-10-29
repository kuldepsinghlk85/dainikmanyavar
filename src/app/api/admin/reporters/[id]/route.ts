import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { id } = await params;
    const reporter = await db.reporterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            active: true,
            createdAt: true,
          },
        },
        location: true,
        author: true,
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!reporter) {
      return NextResponse.json({ success: false, error: 'रिपोर्टर नहीं मिला' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: reporter });
  } catch (error) {
    console.error('Error fetching reporter:', error);
    return NextResponse.json({ success: false, error: 'रिपोर्टर विवरण लोड करने में विफल' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      fullName,
      email,
      mobileNumber,
      password,
      designation,
      district,
      locationId,
      bio,
      photo,
      active,
    } = body;

    const existing = await db.reporterProfile.findUnique({
      where: { id },
      include: { user: true, author: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'रिपोर्टर नहीं मिला' }, { status: 404 });
    }

    // Update User record if email, name, password, or active status changed
    const userUpdate: any = {};
    if (typeof active === 'boolean') {
      userUpdate.active = active;
    }
    if (fullName && fullName.trim()) {
      userUpdate.name = fullName.trim();
    }
    if (email && email.trim() && email.trim().toLowerCase() !== existing.user.email) {
      const cleanEmail = email.trim().toLowerCase();
      const duplicate = await db.user.findFirst({
        where: { email: cleanEmail, NOT: { id: existing.userId } },
      });
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'यह ईमेल पहले से किसी अन्य खाते में उपयोग में है' }, { status: 400 });
      }
      userUpdate.email = cleanEmail;
    }
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return NextResponse.json({ success: false, error: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' }, { status: 400 });
      }
      userUpdate.password = await hashPassword(password.trim());
    }

    if (Object.keys(userUpdate).length > 0) {
      await db.user.update({
        where: { id: existing.userId },
        data: userUpdate,
      });
    }

    // Update Author record if linked
    if (existing.authorId) {
      const authorUpdate: any = {};
      if (fullName) authorUpdate.name = fullName.trim();
      if (designation) authorUpdate.role = designation.trim();
      if (bio !== undefined) authorUpdate.bio = bio ? bio.trim() : null;
      if (photo !== undefined) authorUpdate.avatar = photo || null;

      if (Object.keys(authorUpdate).length > 0) {
        await db.author.update({
          where: { id: existing.authorId },
          data: authorUpdate,
        });
      }
    }

    // Update Reporter Profile
    const updatedProfile = await db.reporterProfile.update({
      where: { id },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(mobileNumber !== undefined && { mobileNumber: mobileNumber ? mobileNumber.trim() : null }),
        ...(designation && { designation: designation.trim() }),
        ...(district !== undefined && { district: district ? district.trim() : null }),
        ...(locationId !== undefined && { locationId: locationId || null }),
        ...(bio !== undefined && { bio: bio ? bio.trim() : null }),
        ...(photo !== undefined && { photo: photo || null }),
        ...(typeof active === 'boolean' && { active }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            active: true,
          },
        },
        location: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'रिपोर्टर प्रोफाइल सफलतापूर्वक अपडेट की गई',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating reporter profile:', error);
    return NextResponse.json({ success: false, error: 'रिपोर्टर प्रोफाइल अपडेट करने में विफल' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const { id } = await params;
    const profile = await db.reporterProfile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ success: false, error: 'रिपोर्टर नहीं मिला' }, { status: 404 });
    }

    // Toggle active status (deactivate instead of hard deleting to preserve historical articles)
    const newActiveState = !profile.active;
    await Promise.all([
      db.reporterProfile.update({
        where: { id },
        data: { active: newActiveState },
      }),
      db.user.update({
        where: { id: profile.userId },
        data: { active: newActiveState },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: newActiveState ? 'रिपोर्टर खाता सक्रिय किया गया' : 'रिपोर्टर खाता निष्क्रिय किया गया',
      active: newActiveState,
    });
  } catch (error) {
    console.error('Error toggling reporter status:', error);
    return NextResponse.json({ success: false, error: 'रिपोर्टर स्थिति बदलने में विफल' }, { status: 500 });
  }
}
