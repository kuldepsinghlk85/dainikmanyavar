import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import TopBar from '@/components/public/TopBar';
import Header from '@/components/public/Header';
import Navigation from '@/components/public/Navigation';
import ShareBar from '@/components/public/ShareBar';
import AdBanner from '@/components/public/AdBanner';
import Footer from '@/components/public/Footer';
import { db } from '@/lib/db';
import { formatHindiDate, formatCount } from '@/lib/utils';
import { Play, Film } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.article.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: { title: true, excerpt: true, featuredImage: true },
  });

  if (!article) return {};

  return {
    title: `▶ ${article.title} | दैनिक मान्यवर वीडियो न्यूज़`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
    },
  };
}

export default async function VideoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const currentVideo = await db.article.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: 'PUBLISHED',
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!currentVideo) {
    notFound();
  }

  // Increment view count
  await db.article.update({
    where: { id: currentVideo.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Fetch Video Playlist (all other active video bulletins)
  const playlistVideos = await db.article.findMany({
    where: {
      videoEnabled: true,
      id: { not: currentVideo.id },
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      videoThumbnail: true,
      videoDuration: true,
      viewCount: true,
      publishedAt: true,
    },
  });

  // Extract YouTube ID if youtube video URL
  let youtubeEmbedUrl = '';
  if (currentVideo.videoUrl && (currentVideo.videoUrl.includes('youtube.com') || currentVideo.videoUrl.includes('youtu.be'))) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = currentVideo.videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      youtubeEmbedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <Navigation />

      <main className="wrap py-4 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Main Video Player Area */}
          <div className="min-w-0">
            {/* Breadcrumb */}
            <nav className="text-xs text-stone-500 mb-3 flex items-center gap-1.5">
              <Link href="/" className="hover:text-[#F97316]">होम</Link>
              <span>/</span>
              <span className="text-[#EA580C] font-bold">वीडियो न्यूज़</span>
              <span>/</span>
              <span className="text-stone-800 truncate">{currentVideo.title}</span>
            </nav>

            {/* Video Player Box */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg border border-stone-800">
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={currentVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : currentVideo.videoUrl && currentVideo.videoUrl.endsWith('.mp4') ? (
                <video
                  src={currentVideo.videoUrl}
                  controls
                  autoPlay
                  poster={currentVideo.videoThumbnail || currentVideo.featuredImage || ''}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                  <Image
                    src={currentVideo.videoThumbnail || currentVideo.featuredImage || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'}
                    alt={currentVideo.title}
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="relative z-10 text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-[#EA580C] text-white flex items-center justify-center mx-auto shadow-2xl mb-2 animate-bounce">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                    <span className="text-xs bg-black/80 text-white px-3 py-1 rounded-full font-bold">
                      विशेष वीडियो बुलेटिन ({currentVideo.videoDuration || '3:00'})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Title & Meta */}
            <div className="my-4">
              <span className="bg-[#EA580C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                ▶ {currentVideo.category.name} बुलेटिन
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-2 leading-tight">
                {currentVideo.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 border-y border-stone-200 py-2.5 my-3">
                <div className="flex items-center gap-3">
                  <span>📅 {formatHindiDate(currentVideo.publishedAt)}</span>
                  <span>•</span>
                  <span>⏱️ {currentVideo.videoDuration || '3:00'} समय अवधि</span>
                </div>
                <div>
                  <span>👁 {formatCount(currentVideo.viewCount)} व्यूज</span>
                </div>
              </div>
            </div>

            {/* Social Share & Reactions */}
            <ShareBar
              articleId={currentVideo.id}
              title={currentVideo.title}
              slug={currentVideo.slug}
              initialLikeCount={currentVideo.likeCount}
            />

            {/* Video Description */}
            <div
              className="prose max-w-none text-stone-800 text-sm sm:text-base leading-relaxed my-4"
              dangerouslySetInnerHTML={{ __html: currentVideo.content }}
            />

            {/* In-Article Banner */}
            <AdBanner position="header_wide" sizeText="Video Page Banner Ad (728×90)" />
          </div>

          {/* Right Sidebar: Video Playlist Widget */}
          <aside className="space-y-4">
            <div className="bg-stone-900 text-white rounded-xl p-4 shadow-lg border border-stone-800 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-[#F97316]">
                  <Film className="w-4 h-4" />
                  <span>🎥 वीडियो न्यूज़ प्लेलिस्ट (Video Playlist)</span>
                </h3>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-mono">
                  {playlistVideos.length} वीडियो
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {playlistVideos.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/video/${item.slug}`}
                    target="_blank"
                    className="flex gap-2.5 p-2 rounded-lg bg-stone-800/80 hover:bg-[#EA580C]/20 border border-stone-800 hover:border-orange-500/50 transition-all group"
                  >
                    <div className="relative w-24 h-16 rounded overflow-hidden bg-black flex-shrink-0">
                      <Image
                        src={item.videoThumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80'}
                        alt={item.title}
                        fill
                        className="object-cover opacity-85 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded font-mono">
                        {item.videoDuration || '3:00'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-stone-200 line-clamp-2 group-hover:text-[#F97316] leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-stone-400">👁 {formatCount(item.viewCount)} व्यूज</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Ad Box */}
            <AdBanner position="sidebar_box" sizeText="300 × 250 / Video Sidebar Ad" />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
