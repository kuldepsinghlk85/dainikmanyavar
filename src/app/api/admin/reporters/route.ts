import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const reporters = await db.reporterProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            active: true,
            createdAt: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    // Also get submission counts by status for each reporter
    const reportersWithStats = await Promise.all(
      reporters.map(async (rep) => {
        const [pendingCount, publishedCount] = await Promise.all([
          db.reporterSubmission.count({
            where: {
              reporterProfileId: rep.id,
              status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
            },
          }),
          db.reporterSubmission.count({
            where: {
              reporterProfileId: rep.id,
              status: 'PUBLISHED',
            },
          }),
        ]);

        return {
          ...rep,
          stats: {
            totalSubmissions: rep._count.submissions,
            pendingSubmissions: pendingCount,
            publishedSubmissions: publishedCount,
          },
        };
      })
    );

    return NextResponse.json({ success: true, data: reportersWithStats });
  } catch (error) {
    console.error('Error fetching reporters list:', error);
    return NextResponse.json({ success: false, error: 'रिपोर्टर सूची लोड करने में विफल' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'अनधिकृत प्रवेश' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      fullName,
      email,
      mobileNumber,
      password,
      designation = 'संवाददाता',
      district,
      locationId,
      bio,
      photo,
      reporterId: customReporterId,
    } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'रिपोर्टर का नाम अनिवार्य है' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: 'ईमेल पता अनिवार्य है' }, { status: 400 });
    }
    if (!password || password.trim().length < 6) {
      return NextResponse.json({ success: false, error: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'यह ईमेल पहले से पंजीकृत है' }, { status: 400 });
    }

    // Determine unique Reporter ID
    let finalReporterId = customReporterId ? customReporterId.trim().toUpperCase() : '';
    if (!finalReporterId) {
      const count = await db.reporterProfile.count();
      finalReporterId = `DM-REP-${101 + count}`;
    }

    // Check unique reporter ID
    const existingRepId = await db.reporterProfile.findUnique({ where: { reporterId: finalReporterId } });
    if (existingRepId) {
      return NextResponse.json({ success: false, error: `रिपोर्टर आईडी ${finalReporterId} पहले से मौजूद है` }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password.trim());

    // Create User record
    const user = await db.user.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'REPORTER',
        active: true,
      },
    });

    // Create or find Author record for public attribution
    let author = await db.author.findFirst({
      where: { name: fullName.trim() },
    });
    if (!author) {
      const slug = fullName.trim().toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)/g, '') || `reporter-${Date.now()}`;
      author = await db.author.create({
        data: {
          name: fullName.trim(),
          slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
          designation: designation || 'संवाददाता',
          photo: photo || null,
          bio: bio || null,
        },
      });
    }

    // Create Reporter Profile
    const profile = await db.reporterProfile.create({
      data: {
        userId: user.id,
        reporterId: finalReporterId,
        fullName: fullName.trim(),
        mobileNumber: mobileNumber ? mobileNumber.trim() : null,
        designation: designation.trim() || 'संवाददाता',
        district: district ? district.trim() : null,
        locationId: locationId || null,
        bio: bio ? bio.trim() : null,
        photo: photo || null,
        authorId: author.id,
        active: true,
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
      message: 'नया रिपोर्टर सफलतापूर्वक बनाया गया',
      data: profile,
    });
  } catch (error) {
    console.error('Error creating reporter account:', error);
    return NextResponse.json({ success: false, error: 'रिपोर्टर खाता बनाने में विफल' }, { status: 500 });
  }
}
