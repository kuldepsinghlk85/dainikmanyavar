import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updated = await db.contactInquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    console.error('[API /api/contact/[id]] PATCH Error:', error);
    return NextResponse.json({ error: 'अपडेट करने में त्रुटि।' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.contactInquiry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/contact/[id]] DELETE Error:', error);
    return NextResponse.json({ error: 'हटाने में त्रुटि।' }, { status: 500 });
  }
}
