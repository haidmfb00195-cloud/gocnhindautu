export const ARTICLE_VERTICALS = [
  { slug: 'kien-thuc', label: 'Kiến thức', listPath: '/admin/bai-viet/kien-thuc' },
  { slug: 'trade-quy', label: 'Trade quỹ', listPath: '/admin/bai-viet/trade-quy' },
  { slug: 'san-giao-dich', label: 'Sàn giao dịch', listPath: '/admin/bai-viet/san-giao-dich' },
] as const;

export type ArticleVertical = (typeof ARTICLE_VERTICALS)[number]['slug'];

export function isArticleVertical(value: string): value is ArticleVertical {
  return ARTICLE_VERTICALS.some((v) => v.slug === value);
}

export function getVerticalLabel(slug: ArticleVertical): string {
  return ARTICLE_VERTICALS.find((v) => v.slug === slug)?.label ?? slug;
}

/** URL công khai của bài viết theo vertical và category slug */
export function getArticlePublicPath(
  vertical: ArticleVertical,
  articleSlug: string,
  categorySlug?: string | null
): string {
  if (vertical === 'kien-thuc') {
    return `/kien-thuc/${categorySlug ?? 'chung'}/${articleSlug}`;
  }
  return `/${vertical}/${articleSlug}`;
}
