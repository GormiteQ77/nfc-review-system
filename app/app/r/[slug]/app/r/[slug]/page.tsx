import { supabase } from '@/lib/supabase';
import ClientReviewCard from './ClientReviewCard';

export const dynamic = 'force-dynamic';

export default async function ReviewLandingPage({ params }: { params: { slug: string } }) {
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!company) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border max-w-sm">
          <h2 className="text-xl font-bold">Profil nie istnieje</h2>
        </div>
      </main>
    );
  }

  if (!company.is_active) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border max-w-sm">
          <h2 className="text-xl font-bold">Profil tymczasowo niedostępny</h2>
          <p className="text-sm text-slate-500 mt-2">Wizytówka jest nieaktywna.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-3 font-bold text-2xl text-slate-500">
          {company.name.charAt(0)}
        </div>
        <h1 className="text-xl font-bold text-slate-900 text-center">{company.name}</h1>
        {company.description && (
          <p className="text-xs text-slate-500 text-center mt-1">{company.description}</p>
        )}

        <ClientReviewCard company={company} />

        <div className="w-full mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
          {company.instagram_url && (
            <a href={company.instagram_url} target="_blank" rel="noreferrer" className="w-full py-2.5 px-4 text-center rounded-xl border text-slate-700 text-sm font-medium hover:bg-slate-50">
              Instagram
            </a>
          )}
          {company.facebook_url && (
            <a href={company.facebook_url} target="_blank" rel="noreferrer" className="w-full py-2.5 px-4 text-center rounded-xl border text-slate-700 text-sm font-medium hover:bg-slate-50">
              Facebook
            </a>
          )}
          {company.website_url && (
            <a href={company.website_url} target="_blank" rel="noreferrer" className="w-full py-2.5 px-4 text-center rounded-xl border text-slate-700 text-sm font-medium hover:bg-slate-50">
              Strona WWW
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
