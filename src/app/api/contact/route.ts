import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  sendAdminNotificationEmail,
  sendUserThankYouEmail,
  buildEditorWhatsAppUrl,
  CATEGORY_LABELS,
} from '@/lib/contactMailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, location, category, subject, message } = body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'कृपया अपना नाम दर्ज करें।' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string' || !phone.trim() || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ error: 'कृपया संदेश का विषय दर्ज करें।' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'कृपया अपना संदेश या खबर का विवरण दर्ज करें।' }, { status: 400 });
    }

    const validCategory = category && CATEGORY_LABELS[category] ? category : 'GENERAL';

    // Save to Database
    const inquiry = await db.contactInquiry.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email && typeof email === 'string' && email.trim() ? email.trim() : null,
        location: location && typeof location === 'string' && location.trim() ? location.trim() : null,
        category: validCategory,
        subject: subject.trim(),
        message: message.trim(),
        status: 'PENDING',
      },
    });

    // Send notifications asynchronously without blocking the response
    let userNotified = false;
    try {
      await sendAdminNotificationEmail(inquiry);
      if (inquiry.email) {
        const userRes = await sendUserThankYouEmail(inquiry);
        if (userRes.success) {
          userNotified = true;
          await db.contactInquiry.update({
            where: { id: inquiry.id },
            data: { userNotified: true },
          });
        }
      }
    } catch (notifyErr) {
      console.error('[API /api/contact] Notification warning:', notifyErr);
    }

    const editorWhatsAppUrl = buildEditorWhatsAppUrl(inquiry);

    return NextResponse.json({
      success: true,
      message: 'आपका संदेश सफलतापूर्वक प्राप्त हो गया है।',
      id: inquiry.id,
      userNotified,
      editorWhatsAppUrl,
    });
  } catch (error: any) {
    console.error('[API /api/contact] POST Error:', error);
    return NextResponse.json(
      { error: 'संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const query = searchParams.get('q');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (query && query.trim()) {
      where.OR = [
        { name: { contains: query.trim() } },
        { phone: { contains: query.trim() } },
        { email: { contains: query.trim() } },
        { subject: { contains: query.trim() } },
        { message: { contains: query.trim() } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      db.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.contactInquiry.count({ where }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[API /api/contact] GET Error:', error);
    return NextResponse.json({ error: 'संदेश लोड करने में त्रुटि।' }, { status: 500 });
  }
}
