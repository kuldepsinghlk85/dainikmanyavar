'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import Image from 'next/image';
import Link from 'next/link';
import { Video, Plus, Play, ExternalLink, Eye, Clock } from 'lucide-react';
import { formatCount } from '@/lib/utils';

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  videoType: string;
  videoDuration: string;
  videoThumbnail: string;
  viewCount: number;
  publishedAt: string;
  category?: { name: string };
}

export default function VideoAdminPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoDuration, setVideoDuration] = useState('3:15');
  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          videoUrl: videoUrl.trim(),
          videoThumbnail: videoThumbnail.trim(),
          videoDuration: videoDuration.trim() || '3:00',
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('नया वीडियो बुलेटिन सफलतापूर्वक प्रकाशित किया गया!');
        setTitle('');
        setVideoUrl('');
        setVideoThumbnail('');
        setContent('');
        fetchVideos();
      } else {
        setMessage(data.error || 'वीडियो जोड़ने में त्रुटि हुई।');
      }
    } catch (err) {
      setMessage('सर्वर त्रुटि।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">वीडियो न्यूज़ प्रबंधक (Video Bulletins Manager)</h1>
        <p className="text-xs text-stone-500">होमपेज वीडियो न्यूज़ और वीडियो प्लेलिस्ट के लिए नया वीडियो बुलेटिन जोड़ें</p>
      </div>

      {/* Add Video Form */}
      <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
          <Video className="w-4 h-4 text-[#F97316]" />
          <span>➕ नया वीडियो न्यूज़ बुलेटिन जोड़ें (Add Video Bulletin)</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">वीडियो का मुख्य शीर्षक (Video Title) *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="उदा. पूर्वांचल की 10 बड़ी खबरें — दैनिक मान्यवर विशेष वीडियो बुलेटिन..."
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold focus:outline-none focus:border-[#F97316]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">वीडियो लिंक / URL (Direct MP4 or YouTube) *</label>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://domain.com/video.mp4 या https://youtube.com/watch?v=..."
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">वीडियो समय अवधि (Duration, e.g. 3:15)</label>
            <input
              type="text"
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value)}
              placeholder="3:15"
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#F97316]"
            />
          </div>
        </div>

        {/* Video Thumbnail Upload */}
        <ImageUploader
          label="वीडियो थंबनेल चित्र (Video Thumbnail Image)"
          value={videoThumbnail}
          onChange={(url) => setVideoThumbnail(url)}
        />

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">वीडियो विवरण (Description)</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="वीडियो समाचार का संक्षिप्त विवरण..."
            className="w-full p-2.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#F97316]"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {message && <p className="text-xs font-bold text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'प्रकाशित हो रहा है...' : 'वीडियो बुलेटिन प्रकाशित करें'}</span>
          </button>
        </div>
      </form>

      {/* Video News List */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
          सक्रिय वीडियो बुलेटिन सूची ({videos.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((vid) => (
            <div key={vid.id} className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-3 space-y-2 flex flex-col justify-between">
              <div>
                <div className="relative w-full h-36 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <Image
                    src={vid.videoThumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'}
                    alt={vid.title}
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute w-10 h-10 rounded-full bg-[#EA580C]/90 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                    {vid.videoDuration || '3:00'}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-stone-900 mt-2 line-clamp-2">{vid.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-1">
                  <span>👁 {formatCount(vid.viewCount)} व्यूज</span>
                  <span>•</span>
                  <span>{new Date(vid.publishedAt).toLocaleDateString('hi-IN')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
                <Link
                  href={`/video/${vid.slug}`}
                  target="_blank"
                  className="text-[#F97316] font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  <span>वीडियो देखें</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
