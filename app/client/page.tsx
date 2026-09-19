import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import ClientPanel from './ClientPanel';

export const dynamic = 'force-dynamic';

export default async function ClientHomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/client/login');
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .ilike('owner_email', user!.email ?? '')
    .maybeSingle();

  if (!company) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0E0E10] p-6 text-center">
        <div className="max-w-sm rounded-2xl border border-[#2A2A31] bg-[#1C1C21] p-8">
          <h2 className="text-lg font-semibold text-[#F5F3EE]">Brak przypisanej firmy</h2>
          <p className="mt-2 text-sm text-[#9B9AA1]">
            To konto ({user!.email}) nie jest powiązane z żadną firmą w systemie. Skontaktuj się z osobą, która
            wystawiła Ci dostęp.
          </p>
        </div>
      </main>
    );
  }

  return <ClientPanel company={company} userEmail={user!.email ?? ''} />;
}
