import db from './database.js';

interface SentimentBreakdown {
  overall: number;
  label: string;
  totalReviews: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  avgRating: number;
  topPositiveThemes: string[];
  topNegativeThemes: string[];
}

export function computeSentimentBreakdown(businessId: number): SentimentBreakdown {
  const reviews = db.prepare(
    'SELECT sentiment_score, sentiment_label, rating FROM reviews WHERE business_id = ?'
  ).all(businessId) as Array<{ sentiment_score: number; sentiment_label: string; rating: number }>;

  if (reviews.length === 0) {
    return {
      overall: 0, label: 'no_data', totalReviews: 0,
      positive: 0, neutral: 0, negative: 0,
      positivePct: 0, neutralPct: 0, negativePct: 0,
      avgRating: 0, topPositiveThemes: [], topNegativeThemes: [],
    };
  }

  const total = reviews.length;
  const positive = reviews.filter(r => r.sentiment_label === 'positive').length;
  const neutral = reviews.filter(r => r.sentiment_label === 'neutral').length;
  const negative = reviews.filter(r => r.sentiment_label === 'negative').length;
  const avgScore = reviews.reduce((sum, r) => sum + r.sentiment_score, 0) / total;
  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;

  const topPositive = db.prepare(
    `SELECT t.name FROM themes t WHERE t.business_id = ? AND t.avg_sentiment > 0.3
     ORDER BY t.mention_count DESC LIMIT 3`
  ).all(businessId) as Array<{ name: string }>;

  const topNegative = db.prepare(
    `SELECT t.name FROM themes t WHERE t.business_id = ? AND t.avg_sentiment < -0.3
     ORDER BY t.mention_count DESC LIMIT 3`
  ).all(businessId) as Array<{ name: string }>;

  let label: string;
  if (avgScore > 0.3) label = 'positive';
  else if (avgScore > -0.3) label = 'mixed';
  else label = 'negative';

  return {
    overall: Math.round(avgScore * 100) / 100,
    label,
    totalReviews: total,
    positive, neutral, negative,
    positivePct: Math.round((positive / total) * 100),
    neutralPct: Math.round((neutral / total) * 100),
    negativePct: Math.round((negative / total) * 100),
    avgRating: Math.round(avgRating * 10) / 10,
    topPositiveThemes: topPositive.map(t => t.name),
    topNegativeThemes: topNegative.map(t => t.name),
  };
}
