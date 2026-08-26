import { redirect } from 'next/navigation';

export default function LegacyNewArticleRedirect() {
  redirect('/admin/bai-viet/kien-thuc/new');
}
