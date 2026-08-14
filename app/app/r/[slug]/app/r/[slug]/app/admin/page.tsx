'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Power, Link as LinkIcon, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const loadData = async () => {
    const { data: comp } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (comp) setCompanies(comp);

    const { data: feed } = await supabase.from('feedbacks').select('*, companies(name)').order('created_at', { ascending: false });
    if (feed) setFeedbacks(feed);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-');
    await supabase.from('companies').insert([
      { name, slug: cleanSlug, google_review_url: googleUrl, owner_email: ownerEmail, is_active: true }
    ]);
    setName('');
    setSlug('');
    setGoogleUrl('');
    setOwnerEmail('');
    loadData();
  };

  const toggleStatus = async (id: string, current: boolean) => {
    await supabase.from('companies').update({ is_active: !current }).eq('id', id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-slate-800">Panel Kart NFC & Opinii</h1>

        {/* Formularz */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Dodaj nowego klienta
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder="Nazwa firmy (np. Barber Jan)" value={name} onChange={e => setName(e.target.value)} className="p-2.5 border rounded-xl text-sm" />
            <input required placeholder="Końcówka linku (slug, np. barber-jan)" value={slug} onChange={e => setSlug(e.target.value)} className="p-2.5 border rounded-xl text-sm" />
            <input required type="url" placeholder="Link do opinii Google" value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} className="p-2.5 border rounded-xl text-sm" />
            <input required type="email" placeholder="E-mail klienta" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className="p-2.5 border rounded-xl text-sm" />
            <button type="submit" className="md:col-span-2 bg-slate-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-slate-800 transition">
              Zapisz klienta i wygeneruj link
            </button>
          </form>
        </div>

        {/* Lista klientów */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden p-6">
          <h2 className="text-base font-semibold mb-4">Twoi Klienci</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-slate-500">
                <tr>
                  <th className="p-3">Firma</th>
                  <th className="p-3">Link NFC</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Akcja</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">
                      <a href={`/r/${c.slug}`} target="_blank" className="text-blue-600 flex items-center gap-1 hover:underline">
                        <LinkIcon className="w-3.5 h-3.5" /> /r/{c.slug}
                      </a>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {c.is_active ? 'Aktywny (49 zł)' : 'Zablokowany'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => toggleStatus(c.id, c.is_active)} className="p-1.5 border rounded-lg hover:bg-slate-100">
                        <Power className="w-4 h-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prywatne opinie */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Zebrany prywatny feedback (oceny 1-3 gwiazdki)
          </h2>
          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-sm text-slate-400">Brak negatywnych uwag.</p>
            ) : (
              feedbacks.map((f) => (
                <div key={f.id} className="p-3 border rounded-xl bg-slate-50 text-sm">
                  <div className="flex justify-between font-semibold">
                    <span>{f.companies?.name} (Ocena: {f.rating}★)</span>
                    <span className="text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 mt-1">{f.message}</p>
                  {f.customer_contact && <p className="text-xs text-blue-600 mt-1">Kontakt: {f.customer_contact}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
