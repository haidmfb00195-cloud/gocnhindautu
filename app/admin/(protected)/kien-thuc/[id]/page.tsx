import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function LegacyEditArticleRedirect({ params }: Props) {
  redirect(`/admin/bai-viet/edit/${params.id}`);
}
