import { createSupabaseServerClient } from '@/lib/supabase-server';
import ReviewCard from './ReviewCard';

export const dynamic = 'force-dynamic';

export default async function ReviewLandingPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!company) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-sm rounded-2xl border bg-white p-8">
          <h2 className="text-xl font-bold">Profil nie istnieje</h2>
        </div>
      </main>
    );
  }

  if (!company.is_active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-sm rounded-2xl border bg-white p-8">
          <h2 className="text-xl font-bold">Profil tymczasowo niedostępny</h2>
          <p className="mt-2 text-sm text-slate-500">Wizytówka jest nieaktywna.</p>
        </div>
      </main>
    );
  }

  return <ReviewCard company={company} />;
}
