import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Any Supabase Auth account can sign in, but only accounts that are NOT
  // linked to a client company are treated as the admin. A client account
  // that ends up here (e.g. by using the wrong login page) gets sent to
  // their own panel instead of the full admin dashboard.
  const { data: linkedCompany } = await supabase
    .from('companies')
    .select('id')
    .ilike('owner_email', user!.email ?? '')
    .maybeSingle();

  if (linkedCompany) {
    redirect('/client');
  }

  return <AdminDashboard userEmail={user!.email ?? ''} />;
}
