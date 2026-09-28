export interface ArticleSEOPayload {
  title: string;
  excerpt?: string;
  slug: string;
  featuredImage?: string;
  publishedAt: Date | string;
  updatedAt: Date | string;
  authorName?: string;
  categoryName?: string;
}

export function generateNewsArticleJsonLd(article: ArticleSEOPayload) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dainikmanyawar.in';
  const articleUrl = `${siteUrl}/news/${article.slug}`;
  const imageUrl = article.featuredImage || `${siteUrl}/logo.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    description: article.excerpt || article.title,
    image: [imageUrl],
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(article.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: article.authorName || 'दैनिक मान्यवर ब्यूरो',
    },
    publisher: {
      '@type': 'Organization',
      name: 'दैनिक मान्यवर',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dainikmanyavar.com';
  const reviewUrl = `${siteUrl}/movie-review/${review.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: review.movieTitleHindi || review.movieTitle,
      alternateName: review.movieTitle,
      image: review.posterImage || `${siteUrl}/logo.png`,
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
      '@type': 'Organization',
      name: 'दैनिक मान्यवर',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    url: reviewUrl,
    datePublished: new Date(review.datePublished).toISOString(),
    description: review.reviewBody || `${review.movieTitle} मूवी रिव्यू - दैनिक मान्यवर`,
  };
}
