'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Video,
  Plus,
  Play,
  ExternalLink,
  Eye,
  Clock,
  Upload,
  Trash2,
  Edit3,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  X,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
  Search,
  Check,
} from 'lucide-react';
import { formatCount } from '@/lib/utils';

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  videoType: string;
  videoDuration: string;
  videoThumbnail: string;
  content?: string;
  viewCount: number;
  publishedAt: string;
  category?: { name: string; slug: string };
}

export default function VideoAdminPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [videoFileSize, setVideoFileSize] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [thumbnailTab, setThumbnailTab] = useState<'upload' | 'url'>('upload');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [videoDuration, setVideoDuration] = useState('3:15');
  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editThumbnailTab, setEditThumbnailTab] = useState<'upload' | 'url'>('upload');
  const [editThumbnailUrlInput, setEditThumbnailUrlInput] = useState('');
  const [editUploadingThumbnail, setEditUploadingThumbnail] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const editThumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVideos(data.data);
      }
    } catch (err) {
      console.error('Fetch videos error:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Format Duration helper
  const formatDurationFromSeconds = (totalSeconds: number): string => {
    const sec = Math.floor(totalSeconds);
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Upload Video File with Progress
  const handleVideoUpload = (file: File) => {
    if (!file) return;

    // Check size limit: 120MB
    const MAX_SIZE = 120 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('वीडियो फ़ाइल का आकार 120MB से कम होना चाहिए।');
      return;
    }

    setUploadingVideo(true);
    setVideoUploadProgress(0);
    setMessage(null);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'वीडियो बुलेटिन');
    formData.append('caption', file.name);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setVideoUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploadingVideo(false);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && res.success && res.url) {
          setVideoUrl(res.url);
          setVideoFileName(file.name);
          setVideoFileSize(file.size);

          // Measure duration automatically
          const tempVideo = document.createElement('video');
          tempVideo.preload = 'metadata';
          tempVideo.src = res.url;
          tempVideo.onloadedmetadata = () => {
            if (tempVideo.duration && !isNaN(tempVideo.duration)) {
              setVideoDuration(formatDurationFromSeconds(tempVideo.duration));
            }
          };

          setMessage({ text: 'वीडियो फ़ाइल सफलतापूर्वक अपलोड हो गई!', type: 'success' });
        } else {
          setMessage({ text: res.error || 'वीडियो अपलोड में त्रुटि हुई।', type: 'error' });
        }
      } catch (_) {
        setMessage({ text: 'सर्वर प्रतिक्रिया पढ़ने में समस्या आई।', type: 'error' });
      }
    };

    xhr.onerror = () => {
      setUploadingVideo(false);
      setMessage({ text: 'वीडियो अपलोड करने में विफल रहा। नेटवर्क जांचें।', type: 'error' });
    };

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  // Upload Thumbnail Image File
  const handleThumbnailUpload = async (file: File, isEdit = false) => {
    if (!file) return;

    if (isEdit) {
      setEditUploadingThumbnail(true);
    } else {
      setUploadingThumbnail(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'वीडियो थंबनेल');
      formData.append('caption', file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        if (isEdit) {
          setEditThumbnail(data.url);
          setEditThumbnailUrlInput(data.url);
        } else {
          setVideoThumbnail(data.url);
          setThumbnailUrlInput(data.url);
          setMessage({ text: 'थंबनेल चित्र सफलतापूर्वक अपलोड हो गया!', type: 'success' });
        }
      } else {
        alert(data.error || 'थंबनेल अपलोड करने में विफल।');
      }
    } catch (_) {
      alert('थंबनेल अपलोड करते समय त्रुटि आई।');
    } finally {
      if (isEdit) {
        setEditUploadingThumbnail(false);
      } else {
        setUploadingThumbnail(false);
      }
    }
  };

  // Capture Thumbnail Frame from Video Player
  const captureFrameFromVideo = (isEdit = false) => {
    const videoEl = previewVideoRef.current;
    if (!videoEl) {
      alert('कृपया पहले वीडियो लोड होने दें।');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `thumb_${Date.now()}.jpg`, { type: 'image/jpeg' });
        await handleThumbnailUpload(file, isEdit);
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Frame capture error:', err);
      alert('वीडियो फ्रेम कैप्चर नहीं किया जा सका।');
    }
  };

  // Fetch YouTube Thumbnail if URL pasted
  const handleFetchYoutubeThumbnail = (url: string, isEdit = false) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const ytId = match[2];
      const ytThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      if (isEdit) {
        setEditThumbnail(ytThumb);
        setEditThumbnailUrlInput(ytThumb);
      } else {
        setVideoThumbnail(ytThumb);
        setThumbnailUrlInput(ytThumb);
        setMessage({ text: 'YouTube हाई-रिज़ॉल्यूशन थंबनेल सेट कर दिया गया!', type: 'success' });
      }
    } else {
      alert('कृपया एक मान्य YouTube वीडियो URL दर्ज करें।');
    }
  };

  // Publish New Video Bulletin
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      alert('कृपया शीर्षक और वीडियो प्रदान करें।');
      return;
    }

    setLoading(true);
    setMessage(null);

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
        setMessage({ text: 'नया वीडियो बुलेटिन सफलतापूर्वक प्रकाशित किया गया!', type: 'success' });
        setTitle('');
        setVideoUrl('');
        setVideoFileName('');
        setVideoFileSize(null);
        setVideoThumbnail('');
        setThumbnailUrlInput('');
        setContent('');
        setVideoDuration('3:15');
        fetchVideos();
      } else {
        setMessage({ text: data.error || 'वीडियो जोड़ने में त्रुटि हुई।', type: 'error' });
      }
    } catch (_) {
      setMessage({ text: 'सर्वर से कनेक्ट करने में त्रुटि।', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal for a video
  const openEditModal = (video: VideoItem) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditVideoUrl(video.videoUrl);
    setEditThumbnail(video.videoThumbnail || '');
    setEditThumbnailUrlInput(video.videoThumbnail || '');
    setEditDuration(video.videoDuration || '3:00');
    setEditContent(video.content || '');
  };

  // Save Edits for Existing Video
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setEditSaving(true);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingVideo.id,
          title: editTitle.trim(),
          videoUrl: editVideoUrl.trim(),
          videoThumbnail: editThumbnail.trim(),
          videoDuration: editDuration.trim(),
          content: editContent.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('वीडियो व थंबनेल सफलतापूर्वक अपडेट हो गया!');
        setEditingVideo(null);
        fetchVideos();
      } else {
        alert(data.error || 'अपडेट करने में विफल।');
      }
    } catch (_) {
      alert('सर्वर त्रुटि।');
    } finally {
      setEditSaving(false);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string, videoTitle: string) => {
    if (!confirm(`क्या आप वाकई इस वीडियो बुलेटिन को हटाना चाहते हैं?\n"${videoTitle}"`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchVideos();
      } else {
        alert(data.error || 'हटाने में विफल।');
      }
    } catch (_) {
      alert('सर्वर त्रुटि।');
    }
  };

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
          <Film className="w-6 h-6 text-[#EA580C]" />
          <span>वीडियो न्यूज़ प्रबंधक (Video Bulletins Manager)</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          होमपेज वीडियो न्यूज़ और वीडियो प्लेलिस्ट के लिए नया वीडियो बुलेटिन अपलोड करें या मौजूदा के थंबनेल अपडेट करें
        </p>
      </div>

      {/* Add Video Form */}
      <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Video className="w-4 h-4 text-[#EA580C]" />
            <span>➕ नया वीडियो न्यूज़ बुलेटिन जोड़ें (Add Video Bulletin)</span>
          </h3>
          <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
            MP4 / WebM / YouTube
          </span>
        </div>

        {/* Video Title */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            वीडियो का मुख्य शीर्षक (Video Title) *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="उदा. पूर्वांचल की 10 बड़ी खबरें — दैनिक मान्यवर विशेष वीडियो बुलेटिन..."
            className="w-full p-3 border border-stone-300 rounded-xl text-sm font-bold focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] bg-stone-50/50"
          />
        </div>

        {/* VIDEO SOURCE SELECTOR (Upload vs URL) */}
        <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-black text-stone-800 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>वीडियो फ़ाइल या लिंक (Video Source) *</span>
            </label>

            {/* Source Switcher */}
            <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setVideoSourceType('upload')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  videoSourceType === 'upload'
                    ? 'bg-white text-[#EA580C] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>📁 वीडियो फ़ाइल अपलोड करें</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoSourceType('url')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  videoSourceType === 'url'
                    ? 'bg-white text-[#EA580C] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>🔗 YouTube / MP4 लिंक</span>
              </button>
            </div>
          </div>

          {/* MODE 1: Direct Video Upload */}
          {videoSourceType === 'upload' && (
            <div>
              {videoUrl && !uploadingVideo ? (
                /* Uploaded Video Card with Player */
                <div className="bg-white p-4 rounded-xl border-2 border-emerald-500/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-black text-emerald-700">✓ वीडियो फ़ाइल तैयार है</span>
                      {videoFileName && (
                        <span className="text-xs font-mono text-stone-600 truncate max-w-xs">
                          ({videoFileName})
                        </span>
                      )}
                      {videoFileSize && (
                        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                          {formatBytes(videoFileSize)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>बदलें</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoUrl('');
                          setVideoFileName('');
                          setVideoFileSize(null);
                        }}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>हटाएं</span>
                      </button>
                    </div>
                  </div>

                  {/* HTML5 Video Player Preview */}
                  <div className="relative w-full aspect-video max-h-64 rounded-xl overflow-hidden bg-black shadow-inner">
                    <video
                      ref={previewVideoRef}
                      src={videoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Frame Capture Action */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-stone-500">
                      💡 वीडियो चलाकर किसी भी दृश्य पर रोकें और नीचे बटन से थंबनेल बनाएं:
                    </p>
                    <button
                      type="button"
                      onClick={() => captureFrameFromVideo(false)}
                      disabled={uploadingThumbnail}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{uploadingThumbnail ? 'कैप्चर हो रहा है...' : '🎥 वीडियो से थंबनेल बनाएं'}</span>
                    </button>
                  </div>
                </div>
              ) : uploadingVideo ? (
                /* Live Upload Progress Bar */
                <div className="p-6 bg-white rounded-xl border border-stone-200 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-black text-[#EA580C]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>वीडियो अपलोड हो रहा है... ({videoUploadProgress}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
                    <div
                      className="bg-[#EA580C] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${videoUploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    कृपया विंडो बंद न करें। बड़ी फ़ाइलों में 1-2 मिनट लग सकते हैं।
                  </p>
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onClick={() => videoFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleVideoUpload(file);
                  }}
                  className="border-2 border-dashed border-stone-300 hover:border-[#EA580C] bg-white hover:bg-orange-50/20 p-8 rounded-2xl text-center space-y-2 cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black text-stone-800">
                    यहाँ क्लिक करें या वीडियो फ़ाइल ड्रैग करके छोड़ें (Drag & Drop)
                  </p>
                  <p className="text-[11px] text-stone-500 font-medium">
                    समर्थित प्रारूप: MP4, WebM, MOV, OGG (अधिकतम 120MB)
                  </p>
                </div>
              )}

              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
                }}
                className="hidden"
              />
            </div>
          )}

          {/* MODE 2: External Video URL */}
          {videoSourceType === 'url' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... या https://domain.com/video.mp4"
                  className="flex-1 p-2.5 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#EA580C] bg-white"
                />
                {videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) && (
                  <button
                    type="button"
                    onClick={() => handleFetchYoutubeThumbnail(videoUrl, false)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>YouTube थंबनेल लाएं</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                YouTube लिंक डालने पर आप थंबनेल ऑटोमैटिक ला सकते हैं या अपना कस्टम थंबनेल भी चुन सकते हैं।
              </p>
            </div>
          )}
        </div>

        {/* DURATION & TIMING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>वीडियो समय अवधि (Duration, e.g. 3:15)</span>
            </label>
            <input
              type="text"
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value)}
              placeholder="3:15"
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#EA580C] bg-stone-50/50"
            />
            <p className="text-[10px] text-stone-400 mt-0.5">फ़ाइल अपलोड होने पर स्वतः दर्ज हो जाएगी</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              श्रेणी (Category)
            </label>
            <select
              defaultValue="uttar-pradesh"
              className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-[#EA580C] bg-stone-50/50"
            >
              <option value="uttar-pradesh">उत्तर प्रदेश (Uttar Pradesh)</option>
              <option value="desh-duniya">देश-विदेश (National)</option>
              <option value="manoranjan">मनोरंजन (Entertainment)</option>
              <option value="khel">खेल (Sports)</option>
            </select>
          </div>
        </div>

        {/* THUMBNAIL SECTION (With Preview & Edit) */}
        <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-black text-stone-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>वीडियो थंबनेल चित्र (Video Thumbnail Image) *</span>
            </label>

            {/* Thumbnail Tab Switcher */}
            <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setThumbnailTab('upload')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  thumbnailTab === 'upload'
                    ? 'bg-white text-[#EA580C] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>फ़ाइल अपलोड</span>
              </button>
              <button
                type="button"
                onClick={() => setThumbnailTab('url')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  thumbnailTab === 'url'
                    ? 'bg-white text-[#EA580C] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>इमेज URL</span>
              </button>
            </div>
          </div>

          {/* ACTIVE THUMBNAIL PREVIEW */}
          {videoThumbnail ? (
            <div className="p-3 bg-white border-2 border-dashed border-emerald-500/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-stone-900 border border-stone-200 flex-shrink-0">
                  <Image
                    src={videoThumbnail}
                    alt="Thumbnail Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white/90 fill-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800">सक्रिय थंबनेल सेट है</span>
                  </div>
                  <p className="text-[11px] font-mono text-stone-500 truncate max-w-xs mt-0.5">
                    {videoThumbnail.split('/').pop()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#EA580C] rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>थंबनेल बदलें</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVideoThumbnail('');
                    setThumbnailUrlInput('');
                  }}
                  className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs cursor-pointer transition-colors"
                  title="हटाएं"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : thumbnailTab === 'upload' ? (
            /* Upload Image Tab */
            <div
              onClick={() => thumbnailFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleThumbnailUpload(file, false);
              }}
              className="border-2 border-dashed border-stone-300 hover:border-[#EA580C] bg-white hover:bg-orange-50/20 p-6 rounded-2xl text-center space-y-1.5 cursor-pointer transition-all"
            >
              <Upload className="w-6 h-6 mx-auto text-stone-400" />
              <p className="text-xs font-black text-stone-800">
                {uploadingThumbnail ? 'थंबनेल अपलोड हो रहा है...' : 'थंबनेल इमेज यहाँ क्लिक करके चुनें या ड्रैग करें (Drag & Drop)'}
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                समर्थित प्रारूप: PNG, JPG, JPEG, WebP (16:9 अनुपात अनुशंसित, अधिकतम 10MB)
              </p>
            </div>
          ) : (
            /* URL Tab */
            <div className="flex gap-2">
              <input
                type="text"
                value={thumbnailUrlInput}
                onChange={(e) => setThumbnailUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... या कोई भी डायरेक्ट इमेज URL"
                className="flex-1 p-2.5 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#EA580C] bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (thumbnailUrlInput.trim()) {
                    setVideoThumbnail(thumbnailUrlInput.trim());
                    setMessage({ text: 'थंबनेल URL सेट कर दिया गया!', type: 'success' });
                  }
                }}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                लागू करें
              </button>
            </div>
          )}

          <input
            ref={thumbnailFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleThumbnailUpload(file, false);
            }}
            className="hidden"
          />
        </div>

        {/* Video Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            वीडियो विवरण (Description)
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="वीडियो समाचार का संक्षिप्त विवरण..."
            className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#EA580C] bg-stone-50/50"
          />
        </div>

        {/* Submit Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {message && (
            <p
              className={`text-xs font-bold flex items-center gap-1.5 ${
                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{message.text}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading || uploadingVideo}
            className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer ml-auto shadow-md transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'प्रकाशित हो रहा है...' : '+ वीडियो बुलेटिन प्रकाशित करें'}</span>
          </button>
        </div>
      </form>

      {/* Video News List (With Edit / Thumbnail Update & Delete) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <Film className="w-4 h-4 text-[#EA580C]" />
              <span>सक्रिय वीडियो बुलेटिन सूची ({videos.length})</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              किसी भी वीडियो का थंबनेल बदलने या शीर्षक संपादित करने के लिए &apos;थंबनेल बदलें&apos; पर क्लिक करें
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शीर्षक से खोजें..."
              className="pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#EA580C] bg-stone-50"
            />
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            कोई वीडियो बुलेटिन नहीं मिला।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVideos.map((vid) => (
              <div
                key={vid.id}
                className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/60 p-3.5 space-y-3 flex flex-col justify-between hover:shadow-md transition-all hover:border-[#EA580C]/40"
              >
                <div>
                  {/* Thumbnail / Player Frame */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
                    <Image
                      src={
                        vid.videoThumbnail ||
                        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={vid.title}
                      fill
                      unoptimized
                      className="object-cover opacity-85"
                    />
                    <div className="absolute w-11 h-11 rounded-full bg-[#EA580C]/90 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shadow-xs">
                      {vid.videoDuration || '3:00'}
                    </span>
                    <span className="absolute top-2 left-2 bg-[#EA580C] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs uppercase">
                      {vid.videoType || 'video'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-stone-900 mt-2.5 line-clamp-2 leading-snug">
                    {vid.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-stone-600">
                      <Eye className="w-3 h-3 text-[#EA580C]" />
                      {formatCount(vid.viewCount)} व्यूज
                    </span>
                    <span>•</span>
                    <span>{new Date(vid.publishedAt).toLocaleDateString('hi-IN')}</span>
                  </div>
                </div>

                {/* Video Controls Bar */}
                <div className="pt-2.5 border-t border-stone-200/80 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {/* EDIT & UPDATE THUMBNAIL BUTTON */}
                    <button
                      type="button"
                      onClick={() => openEditModal(vid)}
                      className="px-2.5 py-1.5 bg-orange-100 hover:bg-[#EA580C] text-[#EA580C] hover:text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>थंबनेल / विवरण बदलें</span>
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id, vid.title)}
                      className="p-1.5 bg-stone-100 hover:bg-red-600 text-stone-600 hover:text-white rounded-lg text-xs cursor-pointer transition-all"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Public Link */}
                  <Link
                    href={`/video/${vid.slug}`}
                    target="_blank"
                    className="text-stone-600 hover:text-[#EA580C] font-bold flex items-center gap-1 text-[11px] hover:underline"
                  >
                    <span>देखें</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL DIALOG */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#EA580C]" />
                <span>वीडियो व थंबनेल अपडेट करें</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Edit Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  वीडियो शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* Edit Video URL */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  वीडियो URL (YouTube या MP4 लिंक) *
                </label>
                <input
                  type="text"
                  required
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              {/* EDIT THUMBNAIL SECTION */}
              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>नया थंबनेल चित्र अपडेट करें (Update Thumbnail)</span>
                  </label>

                  {/* Switcher */}
                  <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEditThumbnailTab('upload')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        editThumbnailTab === 'upload' ? 'bg-white text-[#EA580C]' : 'text-stone-600'
                      }`}
                    >
                      फ़ाइल अपलोड
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditThumbnailTab('url')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        editThumbnailTab === 'url' ? 'bg-white text-[#EA580C]' : 'text-stone-600'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {/* Current / New Thumbnail Preview */}
                {editThumbnail && (
                  <div className="relative w-full aspect-video max-h-48 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 flex items-center justify-center">
                    <Image
                      src={editThumbnail}
                      alt="Thumbnail"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      पूर्वावलोकन
                    </div>
                  </div>
                )}

                {editThumbnailTab === 'upload' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editThumbnailFileInputRef.current?.click()}
                      disabled={editUploadingThumbnail}
                      className="w-full py-3 bg-white border-2 border-dashed border-stone-300 hover:border-[#EA580C] rounded-xl text-xs font-bold text-stone-700 hover:text-[#EA580C] cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      <Upload className="w-4 h-4 text-[#EA580C]" />
                      <span>{editUploadingThumbnail ? 'अपलोड हो रहा है...' : 'नया थंबनेल चित्र अपलोड करें'}</span>
                    </button>
                    <input
                      ref={editThumbnailFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailUpload(file, true);
                      }}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editThumbnailUrlInput}
                      onChange={(e) => setEditThumbnailUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 p-2 border border-stone-300 rounded-lg text-xs font-mono bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setEditThumbnail(editThumbnailUrlInput.trim())}
                      className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      सेट करें
                    </button>
                  </div>
                )}

                {editVideoUrl && (editVideoUrl.includes('youtube.com') || editVideoUrl.includes('youtu.be')) && (
                  <button
                    type="button"
                    onClick={() => handleFetchYoutubeThumbnail(editVideoUrl, true)}
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>YouTube से डिफ़ॉल्ट थंबनेल लाएं</span>
                  </button>
                )}
              </div>

              {/* Edit Duration */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  समय अवधि (Duration)
                </label>
                <input
                  type="text"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  placeholder="3:15"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Edit Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  विवरण (Description)
                </label>
                <textarea
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editSaving ? 'सुरक्षित हो रहा है...' : 'बदलाव सुरक्षित करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
