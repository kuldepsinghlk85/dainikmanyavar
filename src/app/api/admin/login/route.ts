import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@dainikmanyavar.in` },
          { email: cleanEmail.replace('@dainikmanyavar.com', '@dainikmanyavar.in') },
          { email: cleanEmail.replace('@dainikmanyavar.in', '@dainikmanyavar.com') },
        ],
      },
    });
    if (!user || !user.active) {
      return NextResponse.json({ success: false, error: 'अमान्य क्रेडेंशियल या निष्क्रिय खाता' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    // Set secure admin session cookie
    response.cookies.set('admin_token', `${user.id}:${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'ADMIN_LOGIN',
        objectType: 'USER',
        objectId: user.id,
      },
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
