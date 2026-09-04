import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'वैध ईमेल पता दर्ज करें' }, { status: 400 });
    }

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      update: { status: 'active' },
      create: {
        email,
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'धन्यवाद! दैनिक मान्यवर न्यूज़लेटर सब्सक्रिप्शन सफल रहा।',
      data: subscriber,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
