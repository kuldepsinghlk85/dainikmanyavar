import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // -------------------------------------------------------------
    // ACTION: REGISTER
    // -------------------------------------------------------------
    if (action === 'register') {
      const {
        fullName,
        mobileNumber,
        email,
        city,
        state,
        password,
        newsletterSubscribed = true,
        whatsappPermission = true,
        termsAccepted,
      } = body;

      // Validation
      if (!fullName || fullName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'कृपया अपना पूरा नाम दर्ज करें।' },
          { status: 400 }
        );
      }

      const cleanMobile = (mobileNumber || '').replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        return NextResponse.json(
          { success: false, error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' },
          { status: 400 }
        );
      }
      const formattedMobile = cleanMobile.slice(-10);

      if (!termsAccepted) {
        return NextResponse.json(
          { success: false, error: 'कृपया नियम एवं शर्तें स्वीकार करें।' },
          { status: 400 }
        );
      }

      // Check duplicate
      const existingUser = await db.portalUser.findUnique({
        where: { mobileNumber: formattedMobile },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।' },
          { status: 409 }
        );
      }

      // Hash password or generate default OTP
      let passwordHash = null;
      if (password && password.trim().length >= 4) {
        passwordHash = await hashPassword(password.trim());
      }

      const newUser = await db.portalUser.create({
        data: {
          fullName: fullName.trim(),
          mobileNumber: formattedMobile,
          email: email?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || 'उत्तर प्रदेश',
          password: passwordHash,
          status: 'ACTIVE',
          newsletterSubscribed: Boolean(newsletterSubscribed),
          whatsappPermission: Boolean(whatsappPermission),
          lastLogin: new Date(),
        },
      });

      // Synchronize with NewsletterSubscriber table if subscribed & email provided
      if (newsletterSubscribed && email && email.includes('@')) {
        try {
          await db.newsletterSubscriber.upsert({
            where: { email: email.trim().toLowerCase() },
            update: { status: 'active' },
            create: { email: email.trim().toLowerCase(), status: 'active' },
          });
        } catch (_) {}
      }

      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set('portal_token', `${newUser.id}:${Date.now()}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return NextResponse.json({
        success: true,
        message: 'सफलतापूर्वक पंजीकरण हो गया है!',
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          mobileNumber: newUser.mobileNumber,
          email: newUser.email,
          city: newUser.city,
          state: newUser.state,
          newsletterSubscribed: newUser.newsletterSubscribed,
          whatsappPermission: newUser.whatsappPermission,
        },
      });
    }

    // -------------------------------------------------------------
    // ACTION: LOGIN
    // -------------------------------------------------------------
    if (action === 'login') {
      const { mobileNumber, password, otp, isOtpMode } = body;

      const cleanMobile = (mobileNumber || '').replace(/\D/g, '').slice(-10);
      if (cleanMobile.length !== 10) {
        return NextResponse.json(
          { success: false, error: 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।' },
          { status: 400 }
        );
      }

      const user = await db.portalUser.findUnique({
        where: { mobileNumber: cleanMobile },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'यह मोबाइल नंबर पंजीकृत नहीं है। कृपया पहले रजिस्टर करें।' },
          { status: 404 }
        );
      }

      if (user.status === 'BLOCKED') {
        return NextResponse.json(
          { success: false, error: 'आपका खाता अवरुद्ध (Blocked) है। कृपया एडमिन से संपर्क करें।' },
          { status: 403 }
        );
      }

      if (isOtpMode) {
        // OTP validation: accepts user.otp or standard test OTP '1234'
        if (!otp || (otp !== user.otp && otp !== '1234')) {
          return NextResponse.json(
            { success: false, error: 'अमान्य OTP दर्ज किया गया है। (टेस्ट OTP: 1234)' },
            { status: 400 }
          );
        }
      } else {
        if (!password) {
          return NextResponse.json(
            { success: false, error: 'कृपया पासवर्ड दर्ज करें।' },
            { status: 400 }
          );
        }
        if (!user.password) {
          return NextResponse.json(
            { success: false, error: 'पासवर्ड सेट नहीं है। कृपया OTP से लॉगिन करें।' },
            { status: 400 }
          );
        }
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'गलत पासवर्ड दर्ज किया गया है।' },
            { status: 401 }
          );
        }
      }

      // Update last login
      await db.portalUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), otp: null },
      });

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('portal_token', `${user.id}:${Date.now()}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return NextResponse.json({
        success: true,
        message: 'लॉगिन सफल रहा!',
        user: {
          id: user.id,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
          email: user.email,
          city: user.city,
          state: user.state,
          newsletterSubscribed: user.newsletterSubscribed,
          whatsappPermission: user.whatsappPermission,
        },
      });
    }

    // -------------------------------------------------------------
    // ACTION: REQUEST OTP
    // -------------------------------------------------------------
    if (action === 'send-otp') {
      const { mobileNumber } = body;
      const cleanMobile = (mobileNumber || '').replace(/\D/g, '').slice(-10);
      if (cleanMobile.length !== 10) {
        return NextResponse.json(
          { success: false, error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' },
          { status: 400 }
        );
      }

      const generatedOtp = '1234'; // Default simulated OTP
      await db.portalUser.updateMany({
        where: { mobileNumber: cleanMobile },
        data: { otp: generatedOtp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      });

      return NextResponse.json({
        success: true,
        message: 'OTP आपके मोबाइल पर भेज दिया गया है। (टेस्ट OTP: 1234)',
        testOtp: '1234',
      });
    }

    // -------------------------------------------------------------
    // ACTION: LOGOUT
    // -------------------------------------------------------------
    if (action === 'logout') {
      const cookieStore = await cookies();
      cookieStore.delete('portal_token');
      return NextResponse.json({ success: true, message: 'सफलतापूर्वक लॉगआउट हो गया।' });
    }

    return NextResponse.json({ success: false, error: 'अमान्य अनुरोध (Invalid action)' }, { status: 400 });
  } catch (error: any) {
    console.error('Portal auth error:', error);
    return NextResponse.json(
      { success: false, error: 'सर्वर पर कोई समस्या आई। कृपया पुनः प्रयास करें।' },
      { status: 500 }
    );
  }
}
