import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isSuperAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ADMINISTRATOR';
    const isEditor = session.role === 'EDITOR';

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        isSuperAdmin,
        isEditor,
      },
    });
  } catch (error) {
    console.error('Admin session error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
