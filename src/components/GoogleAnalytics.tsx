import React from 'react';

// Google Analytics 4 (GA4) — Server Component
// Reads GA_MEASUREMENT_ID or NEXT_PUBLIC_GA_MEASUREMENT_ID directly from server env at runtime.
// No hardcoded fallback — if absent, returns null cleanly.

export default function GoogleAnalytics() {
  const gaId =
    process.env.GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: false });

(function() {
  function sendPageView() {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search
    });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    sendPageView();
  } else {
    document.addEventListener('DOMContentLoaded', sendPageView, { once: true });
  }
})();
          `.trim(),
        }}
      />
    </>
  );
}
