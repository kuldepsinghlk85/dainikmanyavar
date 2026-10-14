import { getPublicSiteUrl } from './utils';

export interface ArticleSEOPayload {
  title: string;
  excerpt?: string;
  slug: string;
  newsId?: number | null;
  featuredImage?: string;
  publishedAt: Date | string;
  updatedAt: Date | string;
  authorName?: string;
  categoryName?: string;
  url?: string;
}

export function generateNewsArticleJsonLd(article: ArticleSEOPayload) {
  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = article.url || (article.newsId ? `${siteUrl}/news/${article.newsId}` : `${siteUrl}/news/${encodeURIComponent(article.slug)}`);
  
  // Format absolute image URL
  let imageUrl = article.featuredImage || `${siteUrl}/logo.png`;
  if (imageUrl.startsWith('/')) {
    imageUrl = `${siteUrl}${imageUrl}`;
  }

  const pubDate = new Date(article.publishedAt);
  const modDate = new Date(article.updatedAt || article.publishedAt);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title.length > 110 ? article.title.substring(0, 110) : article.title,
    alternativeHeadline: article.title,
    description: article.excerpt || article.title,
    image: [imageUrl],
    datePublished: isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString(),
    dateModified: isNaN(modDate.getTime()) ? new Date().toISOString() : modDate.toISOString(),
    inLanguage: 'hi',
    author: [
      {
        '@type': 'Person',
        name: article.authorName || 'दैनिक मान्यवर ब्यूरो',
      },
    ],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'दैनिक मान्यवर',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    copyrightHolder: {
      '@type': 'NewsMediaOrganization',
      name: 'दैनिक मान्यवर',
      url: siteUrl,
    },
    copyrightYear: isNaN(pubDate.getTime()) ? new Date().getFullYear() : pubDate.getFullYear(),
    ...(article.categoryName ? { articleSection: article.categoryName } : {}),
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  const siteUrl = getPublicSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith('http') ? item.url : `${siteUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: fullUrl,
      };
    }),
  };
}

export interface MovieReviewSEOPayload {
  movieTitle: string;
  movieTitleHindi?: string;
  slug: string;
  rating: number; // 0 to 5
  bestRating?: number;
  worstRating?: number;
  authorName?: string;
  director?: string;
  posterImage?: string;
  reviewBody?: string;
  datePublished: Date | string;
}

export function generateMovieReviewJsonLd(review: MovieReviewSEOPayload) {
  const siteUrl = getPublicSiteUrl();
  const reviewUrl = `${siteUrl}/movie-review/${encodeURIComponent(review.slug)}`;

  let posterUrl = review.posterImage || `${siteUrl}/logo.png`;
  if (posterUrl.startsWith('/')) {
    posterUrl = `${siteUrl}${posterUrl}`;
  }

  const pubDate = new Date(review.datePublished);

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: review.movieTitleHindi || review.movieTitle,
      alternateName: review.movieTitle,
      image: posterUrl,
      ...(review.director ? { director: { '@type': 'Person', name: review.director } } : {}),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: review.bestRating || 5,
      worstRating: review.worstRating || 1,
    },
    author: {
      '@type': 'Person',
      name: review.authorName || 'दैनिक मान्यवर फिल्म समीक्षक',
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'दैनिक मान्यवर',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    url: reviewUrl,
    datePublished: isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString(),
    description: review.reviewBody || `${review.movieTitle} मूवी रिव्यू - दैनिक मान्यवर`,
    inLanguage: 'hi',
  };
}
