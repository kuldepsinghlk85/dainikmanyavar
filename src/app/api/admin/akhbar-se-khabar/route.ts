import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { processAkhbarSource } from '@/lib/akhbar-se-khabar/engine';
import { BENCHMARK_SAMPLES } from '@/lib/akhbar-se-khabar/benchmarkData';
import {
  getAkhbarDraftsList,
  publishAkhbarDraft,
  unpublishAkhbarDraft,
  deleteAkhbarDraft,
  seedOrSyncAkhbarDrafts,
} from '@/lib/akhbar-se-khabar/akhbarDraftsService';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';

/**
 * GET: Returns available sample clippings OR list of saved Akhbar drafts
 */
export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 1. Fetch saved drafts from Akhbar Se Khabar Desk
    if (action === 'drafts') {
      const statusFilter = searchParams.get('status') || 'ALL';
      const drafts = await getAkhbarDraftsList(statusFilter);
      return NextResponse.json({
        success: true,
        drafts,
      });
    }

    // 2. Default: Return available sample clippings for 1-click testing
    const samples = BENCHMARK_SAMPLES.map((s) => ({
      id: s.id,
      filename: s.filename,
      imageUrl: s.imageUrl,
      label: s.label,
      badge: s.badge,
      totalStories: s.stories.length,
      sampleHeadlines: s.stories.map((st) => st.headline),
    }));

    return NextResponse.json({
      success: true,
      samples,
    });
  } catch (error: any) {
    console.error('[Akhbar Se Khabar GET Error]:', error);
    return NextResponse.json({ success: false, error: 'आंतरिक सर्वर त्रुटि' }, { status: 500 });
  }
}

/**
 * POST: Handles publishing/editing drafts OR processes uploaded clipping / screenshot
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let sampleId: string | undefined;
    let base64Data: string | undefined;
    let fileBuffer: Buffer | undefined;
    let filename: string = 'uploaded_source.png';
    let mimeType: string = 'image/png';
    let savedFileUrl: string | undefined;

    // A. Handle JSON request (actions, sampleId, or base64 clipboard)
    if (contentType.includes('application/json')) {
      const body = await request.json();

      // Action 1: Approve and Publish Draft
      if (body.action === 'publish_draft' && body.articleId) {
        const publishedArticle = await publishAkhbarDraft(body.articleId);
        return NextResponse.json({
          success: true,
          article: publishedArticle,
          message: 'समाचार सफलतापूर्वक वेबसाइट पर प्रकाशित हुआ',
        });
      }

      // Action 2: Unpublish Draft back to DRAFT
      if (body.action === 'unpublish_draft' && body.articleId) {
        const draftArticle = await unpublishAkhbarDraft(body.articleId);
        return NextResponse.json({
          success: true,
          article: draftArticle,
          message: 'समाचार वापस प्रारूप (ड्राफ्ट) में सुरक्षित किया गया',
        });
      }

      // Action 3: Delete Draft
      if (body.action === 'delete_draft' && body.articleId) {
        await deleteAkhbarDraft(body.articleId);
        return NextResponse.json({
          success: true,
          message: 'ड्राफ्ट सफलतापूर्वक हटाया गया',
        });
      }

      // Action 4: Sync / Seed Default Headline Stories
      if (body.action === 'sync_drafts') {
        const syncResult = await seedOrSyncAkhbarDrafts();
        return NextResponse.json({
          success: true,
          result: syncResult,
        });
      }

      sampleId = body.sampleId;
      base64Data = body.base64Data;
      if (body.filename) filename = body.filename;
    }
    // B. Handle multipart form-data (file upload)
    else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'कोई फ़ाइल प्रदान नहीं की गई' }, { status: 400 });
      }

      filename = file.name;
      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // Save upload safely into uploads/akhbar-uploads/
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'akhbar-uploads');
      await mkdir(uploadsDir, { recursive: true });

      const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeFilename);
      await writeFile(filePath, fileBuffer);
      savedFileUrl = `/uploads/akhbar-uploads/${safeFilename}`;
    } else {
      return NextResponse.json({ success: false, error: 'अमान्य अनुरोध प्रारूप' }, { status: 400 });
    }

    // Process source through Akhbar Engine
    const result = await processAkhbarSource({
      sampleId,
      fileBuffer,
      base64Data,
      filename,
      mimeType,
      fileUrl: savedFileUrl,
    });

    // Ground database Categories, Locations and Tags
    const allCategories = await db.category.findMany({ select: { id: true, name: true, slug: true } });
    const allLocations = await db.location.findMany({ select: { id: true, name: true, slug: true } });
    const allTags = await db.tag.findMany({ select: { id: true, name: true, slug: true } });

    const enrichedStories = result.stories.map((story) => {
      // Find matching category in DB
      let matchedCategory = allCategories.find(
        (c) => c.name.toLowerCase() === story.categorySuggestion.toLowerCase()
      );
      if (!matchedCategory) {
        matchedCategory = allCategories.find((c) =>
          story.categorySuggestion.includes(c.name) || c.name.includes(story.categorySuggestion)
        );
      }
      if (!matchedCategory && allCategories.length > 0) {
        matchedCategory = allCategories[0];
      }

      // Find matching location in DB
      let matchedLocation = allLocations.find(
        (l) => l.name.toLowerCase() === story.districtSuggestion.toLowerCase()
      );
      if (!matchedLocation) {
        matchedLocation = allLocations.find((l) =>
          story.districtSuggestion.includes(l.name) || l.name.includes(story.districtSuggestion)
        );
      }

      // Find matching tag IDs
      const matchedTagIds: string[] = [];
      story.tagSuggestions.forEach((tagText) => {
        const clean = tagText.replace(/^#+/, '').trim().toLowerCase();
        const foundTag = allTags.find(
          (t) => t.name.replace(/^#+/, '').trim().toLowerCase() === clean
        );
        if (foundTag && !matchedTagIds.includes(foundTag.id)) {
          matchedTagIds.push(foundTag.id);
        }
      });

      return {
        ...story,
        resolvedCategoryId: matchedCategory?.id,
        resolvedCategoryName: matchedCategory?.name,
        resolvedLocationId: matchedLocation?.id,
        resolvedLocationName: matchedLocation?.name,
        resolvedTagIds: matchedTagIds,
        status: 'DRAFT', // Strictly DRAFT as requested
      };
    });

    return NextResponse.json({
      success: true,
      sourceType: result.sourceType,
      sourceFilename: result.sourceFilename,
      sourceFileUrl: savedFileUrl || result.sourceFileUrl,
      totalStories: enrichedStories.length,
      stories: enrichedStories,
      rawText: result.rawText,
      usedEngine: result.usedEngine,
      processingTimeMs: result.processingTimeMs,
    });
  } catch (error: any) {
    console.error('[Akhbar Se Khabar Route Error]:', error);
    return NextResponse.json({ success: false, error: 'आंतरिक सर्वर त्रुटि' }, { status: 500 });
  }
}
