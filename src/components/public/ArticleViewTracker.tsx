'use client';

import { useEffect, useRef } from 'react';

interface ArticleViewTrackerProps {
  articleId: string;
  isMobile?: boolean;
}

export default function ArticleViewTracker({ articleId, isMobile = false }: ArticleViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!articleId || hasTracked.current) return;

    // 1. Session Storage Deduplication (prevents duplicate calls in same browser tab on re-renders)
    const sessionKey = `viewed_article_${articleId}`;
    try {
      if (sessionStorage.getItem(sessionKey)) {
        hasTracked.current = true;
        return;
      }
    } catch (_) {
      // sessionStorage might fail in private browsing mode, continue safely
    }

    // 2. Generate or retrieve persistent anonymous visitor ID
    let visitorId = '';
    try {
      visitorId = localStorage.getItem('dm_visitor_id') || '';
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        localStorage.setItem('dm_visitor_id', visitorId);
      }
    } catch (_) {}

    // 3. Minimum reading dwell time: fire after 4 seconds of active engagement
    const timer = setTimeout(() => {
      hasTracked.current = true;
      try {
        sessionStorage.setItem(sessionKey, '1');
      } catch (_) {}

      fetch('/api/analytics/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          visitorId,
          isMobile,
          source: isMobile ? 'mobile_web' : 'desktop_web',
        }),
        keepalive: true,
      }).catch(() => {});
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [articleId, isMobile]);

  return null;
}
