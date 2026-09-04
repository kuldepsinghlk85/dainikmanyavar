import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'articleId required' }, { status: 400 });
    }

    const revisions = await db.articleRevision.findMany({
      where: { articleId },
      orderBy: { revisionNumber: 'desc' },
    });

    return NextResponse.json({ success: true, data: revisions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { revisionId } = await request.json();

    if (!revisionId) {
      return NextResponse.json({ success: false, error: 'revisionId required' }, { status: 400 });
    }

    const revision = await db.articleRevision.findUnique({
      where: { id: revisionId },
    });

    if (!revision) {
      return NextResponse.json({ success: false, error: 'Revision not found' }, { status: 404 });
    }

    const snapshot = JSON.parse(revision.snapshotJson);

    // Restore snapshot to article
    const restoredArticle = await db.article.update({
      where: { id: revision.articleId },
      data: {
        title: snapshot.title,
        subtitle: snapshot.subtitle,
        excerpt: snapshot.excerpt,
        content: snapshot.content,
        featuredImage: snapshot.featuredImage,
        primaryCategoryId: snapshot.primaryCategoryId,
        authorId: snapshot.authorId,
        locationId: snapshot.locationId,
        audioStatus: 'outdated',
        updatedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        action: 'RESTORE_REVISION',
        objectType: 'ARTICLE',
        objectId: revision.articleId,
        detailsJson: JSON.stringify({ revisionNumber: revision.revisionNumber, title: restoredArticle.title }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Article restored to Revision v${revision.revisionNumber}`,
      data: restoredArticle,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
