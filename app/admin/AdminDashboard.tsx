'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CheckCircle2,
  ImagePlus,
  LayoutGrid,
  Link as LinkIcon,
  LogOut,
  MessageSquare,
  Plus,
  Power,
  Search,
  Settings as SettingsIcon,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StarfieldBackground from '@/components/StarfieldBackground';
import {
  CUSTOM_FONT_OPTIONS,
  DEFAULT_CUSTOM_THEME,
  TEMPLATE_OPTIONS,
  type CustomThemeConfig,
  type TemplateId,
} from '../r/[slug]/themes';

const ACCENT = '#D4A15E';
const DAY_LABELS = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

type Plan = 'direct' | 'redirect_all' | 'full';

interface Company {
  id: string;
  name: string;
  slug: string;
  google_review_url: string;
  owner_email: string;
  is_active: boolean;
  template: TemplateId;
  accent_color: string | null;
  custom_theme: CustomThemeConfig | null;
  plan: Plan;
  subscription_expires_at: string | null;
  created_at: string;
}

interface Feedback {
  id: string;
  company_id: string;
  rating: number;
  message: string;
  customer_contact: string | null;
  resolved: boolean;
  created_at: string;
  companies?: { name: string } | null;
}

interface Rating {
  id: string;
  company_id: string;
  rating: number;
  created_at: string;
}

interface PageView {
  id: string;
  company_id: string;
  created_at: string;
}

type Tab = 'overview' | 'clients' | 'settings';

interface Toast {
  id: number;
  message: string;
}

const NAV_ITEMS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Przegląd', icon: LayoutGrid },
  { id: 'clients', label: 'Klienci', icon: Users },
  { id: 'settings', label: 'Ustawienia', icon: SettingsIcon },
];

const PLAN_OPTIONS: { id: Plan; label: string; hint: string }[] = [
  { id: 'direct', label: 'Sama karta (link do Google)', hint: 'Bez własnej strony — karta NFC prowadzi wprost do Google' },
  { id: 'redirect_all', label: 'Custom — wszystkie oceny → Google', hint: 'Własna strona, ale każda ocena przenosi do Google' },
  { id: 'full', label: 'Custom — pełny formularz opinii', hint: '4-5★ → Google, 1-3★ → prywatny feedback w panelu' },
];

function getSubscriptionStatus(expiresAt: string | null) {
  if (!expiresAt) {
    return { label: 'Brak subskrypcji', color: '#E28A6B', bg: 'rgba(226,138,107,0.15)' };
  }
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: 'Wygasła', color: '#E28A6B', bg: 'rgba(226,138,107,0.15)' };
  if (days <= 7) return { label: `Wygasa za ${days} dni`, color: '#E2B25E', bg: 'rgba(226,178,94,0.15)' };
  return { label: 'Aktywna', color: '#5FBE8A', bg: 'rgba(95,190,138,0.14)' };
}

function addInterval(base: string, unit: 'month' | 'year') {
  const start = base ? new Date(base) : new Date();
  const from = start.getTime() >= Date.now() ? start : new Date();
  if (unit === 'month') from.setMonth(from.getMonth() + 1);
  else from.setFullYear(from.getFullYear() + 1);
  return from.toISOString().slice(0, 10);
}

function isSameDay(iso: string, date: Date) {
  return iso.slice(0, 10) === date.toISOString().slice(0, 10);
}

function isSameMonth(iso: string, date: Date) {
  const d = new Date(iso);
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
}

function buildChartData(ratings: Rating[]) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayRatings = ratings.filter((r) => isSameDay(r.created_at, d));
    const avg = dayRatings.length
      ? dayRatings.reduce((sum, r) => sum + r.rating, 0) / dayRatings.length
      : 0;
    days.push({ label: DAY_LABELS[d.getDay()], avg: Number(avg.toFixed(2)) });
  }
  return days;
}

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    googleUrl: '',
    ownerEmail: '',
    template: 'universal' as TemplateId,
    accentColor: ACCENT,
    plan: 'full' as Plan,
    subscriptionExpiresAt: '',
    customTheme: DEFAULT_CUSTOM_THEME,
  });
  const [uploadingBackground, setUploadingBackground] = useState(false);

  const pushToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const loadData = async () => {
    const { data: comp } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    if (comp) setCompanies(comp as Company[]);

    const { data: feed } = await supabase
      .from('feedbacks')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });
    if (feed) setFeedbacks(feed as Feedback[]);

    const { data: rat } = await supabase
      .from('ratings')
      .select('*')
      .order('created_at', { ascending: false });
    if (rat) setRatings(rat as Rating[]);

    const { data: views } = await supabase.from('page_views').select('*');
    if (views) setPageViews(views as PageView[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo(() => buildChartData(ratings), [ratings]);

  const stats = useMemo(() => {
    const now = new Date();
    const activeCount = companies.filter((c) => c.is_active).length;
    const newCompaniesThisMonth = companies.filter((c) => isSameMonth(c.created_at, now)).length;

    const avgRating = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
      : '—';

    const last7 = ratings.filter((r) => {
      const days = (now.getTime() - new Date(r.created_at).getTime()) / 86400000;
      return days <= 7;
    });
    const prev7 = ratings.filter((r) => {
      const days = (now.getTime() - new Date(r.created_at).getTime()) / 86400000;
      return days > 7 && days <= 14;
    });
    const avg = (list: Rating[]) => (list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : null);
    const avgLast7 = avg(last7);
    const avgPrev7 = avg(prev7);
    const ratingTrend =
      avgLast7 !== null && avgPrev7 !== null
        ? `${avgLast7 >= avgPrev7 ? '↑' : '↓'} ${Math.abs(avgLast7 - avgPrev7).toFixed(2)} vs poprzedni tydzień`
        : 'Za mało danych';

    const ratingsThisMonth = ratings.filter((r) => isSameMonth(r.created_at, now)).length;
    const needsContact = feedbacks.filter((f) => !f.resolved).length;

    return {
      activeCount,
      newCompaniesThisMonth,
      avgRating,
      ratingTrend,
      ratingsThisMonth,
      needsContact,
    };
  }, [companies, ratings, feedbacks]);

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCompany(null);
    setForm({
      name: '',
      slug: '',
      googleUrl: '',
      ownerEmail: '',
      template: 'universal',
      accentColor: ACCENT,
      plan: 'full',
      subscriptionExpiresAt: '',
      customTheme: DEFAULT_CUSTOM_THEME,
    });
    setModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setForm({
      name: company.name,
      slug: company.slug,
      googleUrl: company.google_review_url,
      ownerEmail: company.owner_email,
      template: company.template ?? 'universal',
      accentColor: company.accent_color ?? ACCENT,
      plan: company.plan ?? 'full',
      subscriptionExpiresAt: company.subscription_expires_at ?? '',
      customTheme: company.custom_theme ?? DEFAULT_CUSTOM_THEME,
    });
    setModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSlug = form.slug.toLowerCase().trim().replace(/\s+/g, '-');
    const isCustom = form.template === 'custom';
    const fields = {
      name: form.name,
      slug: cleanSlug,
      google_review_url: form.googleUrl,
      owner_email: form.ownerEmail,
      template: form.template,
      accent_color: isCustom ? form.customTheme.accent : form.accentColor,
      custom_theme: isCustom ? form.customTheme : null,
      plan: form.plan,
      subscription_expires_at: form.subscriptionExpiresAt || null,
    };

    if (editingCompany) {
      await supabase.from('companies').update(fields).eq('id', editingCompany.id);
      pushToast(`Zaktualizowano: ${form.name}`);
    } else {
      await supabase.from('companies').insert([{ ...fields, is_active: true }]);
      pushToast(`Dodano klienta: ${form.name}`);
    }

    setModalOpen(false);
    loadData();
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingBackground(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const { data, error } = await supabase.storage.from('review-backgrounds').upload(path, file, { upsert: true });
    setUploadingBackground(false);

    if (error || !data) {
      pushToast('Nie udało się wgrać zdjęcia');
      return;
    }

    const { data: pub } = supabase.storage.from('review-backgrounds').getPublicUrl(data.path);
    setForm((f) => ({ ...f, customTheme: { ...f.customTheme, backgroundImageUrl: pub.publicUrl } }));
  };

  const updateCustomTheme = <K extends keyof CustomThemeConfig>(key: K, value: CustomThemeConfig[K]) => {
    setForm((f) => ({ ...f, customTheme: { ...f.customTheme, [key]: value } }));
  };

  const updateCustomCopy = (key: keyof CustomThemeConfig['copy'], value: string) => {
    setForm((f) => ({ ...f, customTheme: { ...f.customTheme, copy: { ...f.customTheme.copy, [key]: value } } }));
  };

  const toggleStatus = async (id: string, current: boolean) => {
    await supabase.from('companies').update({ is_active: !current }).eq('id', id);
    pushToast(!current ? 'Wizytówka aktywowana' : 'Wizytówka zablokowana');
    loadData();
  };

  const toggleResolved = async (id: string, current: boolean) => {
    await supabase.from('feedbacks').update({ resolved: !current }).eq('id', id);
    loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#101012] md:flex-row">
      <StarfieldBackground accent={ACCENT} starCount={16} />

      <div className="relative z-10 flex items-center justify-between border-b border-[#232328] bg-[#16161A] px-4 py-3.5 md:hidden">
        <div className="flex items-center gap-2">
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
            style={{ background: `linear-gradient(160deg, ${ACCENT}, #8A6B3A)` }}
          >
            <ShieldGlyph />
          </div>
          <p className="text-[13.5px] font-semibold text-[#F5F3EE]" style={{ fontFamily: 'var(--font-fraunces)' }}>
            NFC Panel
          </p>
        </div>
        <button onClick={handleLogout} aria-label="Wyloguj się" className="p-1 text-[#9B9AA1]">
          <LogOut size={16} />
        </button>
      </div>

      <aside className="relative z-10 hidden w-[248px] shrink-0 flex-col border-r border-[#232328] bg-[#16161A] p-[18px_18px_26px] md:flex">
        <div className="mb-[18px] flex items-center gap-2.5 border-b border-[#232328] px-2.5 pb-6">
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
            style={{ background: `linear-gradient(160deg, ${ACCENT}, #8A6B3A)` }}
          >
            <ShieldGlyph />
          </div>
          <div>
            <p className="text-[14.5px] font-semibold text-[#F5F3EE]" style={{ fontFamily: 'var(--font-fraunces)' }}>
              NFC Panel
            </p>
            <p className="text-[10.5px] text-[#6F6E76]">Premium</p>
          </div>
        </div>

        <div className="flex flex-col gap-[3px]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="relative flex items-center gap-[11px] overflow-hidden rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium"
                style={{ color: active ? ACCENT : '#9B9AA1' }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-highlight"
                    className="absolute inset-0 rounded-[10px]"
                    style={{ background: 'rgba(212,161,94,0.12)', borderLeft: `3px solid ${ACCENT}` }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-[#232328] bg-[#1C1C21] p-3">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#232328] text-xs font-semibold" style={{ color: ACCENT }}>
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#E9E7E1]">{userEmail}</p>
            <p className="text-[10.5px] text-[#6F6E76]">Plan Premium</p>
          </div>
          <button onClick={handleLogout} aria-label="Wyloguj się" className="p-1 text-[#9B9AA1] hover:text-[#E28A6B]">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto p-4 pb-24 md:overflow-hidden md:p-[34px_40px] md:pb-[34px]">
        <div className="mb-5 flex flex-col gap-3 md:mb-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[19px] font-semibold text-[#F5F3EE] md:text-[22px]" style={{ fontFamily: 'var(--font-fraunces)' }}>
              {NAV_ITEMS.find((n) => n.id === tab)?.label}
            </h1>
            <p className="mt-1 text-[12.5px] text-[#6F6E76]">Karty NFC &amp; opinie</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:gap-3">
            <div className="flex w-full items-center gap-2 rounded-[11px] border border-[#2A2A31] bg-[#1C1C21] px-3.5 py-2.5 sm:w-[220px]">
              <Search size={14} color="#6F6E76" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Szukaj klienta..."
                className="w-full bg-transparent text-[12.5px] text-[#E9E7E1] outline-none placeholder:text-[#6F6E76]"
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex w-full items-center justify-center gap-1.5 rounded-[11px] px-4 py-2.5 text-[12.5px] font-semibold text-[#1A1305] sm:w-auto"
              style={{ background: ACCENT }}
            >
              <Plus size={14} strokeWidth={2.4} />
              Dodaj klienta
            </button>
          </div>
        </div>

        {tab === 'overview' && (
          <div className="flex flex-col gap-4 overflow-auto md:gap-[22px]">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <StatCard label="Aktywne wizytówki" value={String(stats.activeCount)} trend={`↑ ${stats.newCompaniesThisMonth} w tym miesiącu`} trendColor="#5FBE8A" />
              <StatCard label="Średnia ocena" value={stats.avgRating} trend={stats.ratingTrend} trendColor="#5FBE8A" />
              <StatCard label="Opinie w tym miesiącu" value={String(stats.ratingsThisMonth)} trend="Wszystkie oceny 1–5★" trendColor="#5FBE8A" />
              <StatCard label="Wymaga kontaktu" value={String(stats.needsContact)} trend="Oceny 1–3★" trendColor="#E28A6B" />
            </div>

            <div className="grid flex-grow grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
              <div className="flex flex-col rounded-[18px] border border-[#2A2A31] bg-[#1C1C21] p-4 md:p-[22px_24px]">
                <p className="text-[13px] font-semibold text-[#E9E7E1]">Średnia ocena — ostatnie 7 dni</p>
                <p className="mb-2 text-[11px] text-[#6F6E76]">Dane z tabeli ocen (ratings)</p>
                <div className="h-[160px] flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="label" tick={{ fill: '#6F6E76', fontSize: 10.5 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 5]} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        contentStyle={{ background: '#1C1C21', border: '1px solid #2A2A31', borderRadius: 10, fontSize: 12 }}
                        labelStyle={{ color: '#E9E7E1' }}
                      />
                      <Bar dataKey="avg" fill={ACCENT} radius={[7, 7, 3, 3]} maxBarSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-col gap-3 overflow-hidden rounded-[18px] border border-[#2A2A31] bg-[#1C1C21] p-4 md:p-[20px_22px]">
                <p className="text-[13px] font-semibold text-[#E9E7E1]">Najnowszy feedback</p>
                {feedbacks.slice(0, 3).map((f) => (
                  <div key={f.id} className="rounded-xl border border-[#2A2A31] p-[11px_13px]">
                    <div className="flex justify-between text-xs font-semibold text-[#E9E7E1]">
                      <span>{f.companies?.name ?? '—'}</span>
                      <span style={{ color: '#E28A6B' }}>{f.rating}★</span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-snug text-[#8B8A90]">{f.message}</p>
                  </div>
                ))}
                {feedbacks.length === 0 && <p className="text-xs text-[#6F6E76]">Brak zgłoszeń.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'clients' && (
          <>
            {/* Mobile: stacked cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredCompanies.map((c) => {
                const sub = getSubscriptionStatus(c.subscription_expires_at);
                return (
                  <button
                    key={c.id}
                    onClick={() => openEditModal(c)}
                    className="rounded-2xl border border-[#2A2A31] bg-[#1C1C21] p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#232328] text-xs font-semibold" style={{ color: ACCENT }}>
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-[#E9E7E1]">{c.name}</p>
                          <span className="flex items-center gap-1 text-[11px] text-[#8FA6C9]">
                            <LinkIcon size={10} />/r/{c.slug}
                          </span>
                        </div>
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(c.id, c.is_active);
                        }}
                        role="button"
                        aria-label="Przełącz status"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#2A2A31]"
                      >
                        <Power size={13} color="#8B8A90" />
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className="inline-flex w-fit rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
                        style={{
                          background: c.is_active ? 'rgba(95,190,138,0.14)' : 'rgba(226,138,107,0.15)',
                          color: c.is_active ? '#5FBE8A' : '#E28A6B',
                        }}
                      >
                        {c.is_active ? 'Aktywny' : 'Zablokowany'}
                      </span>
                      <span
                        className="inline-flex w-fit rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
                        style={{ background: sub.bg, color: sub.color }}
                      >
                        {sub.label}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredCompanies.length === 0 && (
                <p className="py-6 text-sm text-[#6F6E76]">Brak klientów spełniających kryteria.</p>
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-hidden rounded-[18px] border border-[#2A2A31] bg-[#1C1C21] md:block">
              <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.9fr_0.5fr] border-b border-[#2A2A31] px-[22px] py-3.5 text-[11px] uppercase tracking-wide text-[#6F6E76]">
                <span>Firma</span>
                <span>Link NFC</span>
                <span>Status</span>
                <span>Subskrypcja</span>
                <span>Szablon strony</span>
                <span>Akcja</span>
              </div>
              {filteredCompanies.map((c) => {
                const themeInfo = TEMPLATE_OPTIONS.find((t) => t.id === c.template) ?? TEMPLATE_OPTIONS[0];
                const sub = getSubscriptionStatus(c.subscription_expires_at);
                return (
                  <div
                    key={c.id}
                    onClick={() => openEditModal(c)}
                    className="grid cursor-pointer grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.9fr_0.5fr] items-center border-b border-[#232328] px-[22px] py-3.5 hover:bg-[#202024]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#232328] text-xs font-semibold" style={{ color: ACCENT }}>
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-[12.5px] font-medium text-[#E9E7E1]">{c.name}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-[#8FA6C9]">
                      <LinkIcon size={12} />/r/{c.slug}
                    </span>
                    <span
                      className="inline-flex w-fit rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
                      style={{
                        background: c.is_active ? 'rgba(95,190,138,0.14)' : 'rgba(226,138,107,0.15)',
                        color: c.is_active ? '#5FBE8A' : '#E28A6B',
                      }}
                    >
                      {c.is_active ? 'Aktywny' : 'Zablokowany'}
                    </span>
                    <span
                      className="inline-flex w-fit rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
                      style={{ background: sub.bg, color: sub.color }}
                    >
                      {sub.label}
                    </span>
                    <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#2A2A31] py-1 pl-1.5 pr-2.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.accent_color ?? themeInfo.accentDefault }} />
                      <span className="text-[10.5px] text-[#C9C7C2]">{themeInfo.label}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(c.id, c.is_active);
                      }}
                      aria-label="Przełącz status"
                      className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-[#2A2A31]"
                    >
                      <Power size={13} color="#8B8A90" />
                    </button>
                  </div>
                );
              })}
              {filteredCompanies.length === 0 && (
                <p className="px-[22px] py-6 text-sm text-[#6F6E76]">Brak klientów spełniających kryteria.</p>
              )}
            </div>
          </>
        )}

        {tab === 'settings' && (
          <div className="max-w-[480px] rounded-[18px] border border-[#2A2A31] bg-[#1C1C21] p-[26px]">
            <p className="mb-4 text-[13px] font-semibold text-[#E9E7E1]">Konto</p>
            <p className="text-[12.5px] text-[#B7B5B0]">Zalogowano jako:</p>
            <p className="mb-5 text-[13px] font-medium text-[#F5F3EE]">{userEmail}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-[#2A2A31] px-4 py-2.5 text-[12.5px] font-medium text-[#E28A6B]"
            >
              <LogOut size={14} />
              Wyloguj się
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-[20px] border border-[#2E2E36] bg-[#1A1A1F] p-6 shadow-2xl sm:p-7"
            >
              <div className="mb-[18px] flex items-center justify-between">
                <p className="text-base font-semibold text-[#F5F3EE]" style={{ fontFamily: 'var(--font-fraunces)' }}>
                  {editingCompany ? editingCompany.name : 'Dodaj nowego klienta'}
                </p>
                <button onClick={() => setModalOpen(false)} aria-label="Zamknij">
                  <X size={16} color="#8B8A90" />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="flex flex-col gap-2.5">
                <input
                  required
                  placeholder="Nazwa firmy (np. Barber Jan)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-[11px] border border-[#2A2A31] bg-[#101012] px-3.5 py-[11px] text-[12.5px] text-[#E9E7E1] outline-none"
                />
                <div>
                  <input
                    required
                    placeholder="Końcówka linku (slug)"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-[11px] border border-[#2A2A31] bg-[#101012] px-3.5 py-[11px] text-[12.5px] text-[#E9E7E1] outline-none"
                  />
                  {editingCompany && (
                    <p className="mt-1 text-[10.5px] text-[#9B9AA1]">
                      Zmiana slugu zmieni adres /r/{form.slug || '...'} — jeśli karta NFC jest już zaprogramowana na stary link, przestanie działać.
                    </p>
                  )}
                </div>
                <input
                  required
                  type="url"
                  placeholder="Link do opinii Google"
                  value={form.googleUrl}
                  onChange={(e) => setForm({ ...form, googleUrl: e.target.value })}
                  className="rounded-[11px] border border-[#2A2A31] bg-[#101012] px-3.5 py-[11px] text-[12.5px] text-[#E9E7E1] outline-none"
                />
                <input
                  required
                  type="email"
                  placeholder="E-mail klienta"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  className="rounded-[11px] border border-[#2A2A31] bg-[#101012] px-3.5 py-[11px] text-[12.5px] text-[#E9E7E1] outline-none"
                />

                <div>
                  <p className="mb-2 mt-1 text-[11px] text-[#9B9AA1]">Wariant produktu</p>
                  <div className="flex flex-col gap-1.5">
                    {PLAN_OPTIONS.map((p) => {
                      const selected = form.plan === p.id;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => setForm({ ...form, plan: p.id })}
                          className="rounded-[11px] border px-3 py-2.5 text-left"
                          style={{
                            borderColor: selected ? ACCENT : '#2A2A31',
                            background: selected ? 'rgba(212,161,94,0.1)' : 'transparent',
                          }}
                        >
                          <p className="text-[12px] font-medium text-[#E9E7E1]">{p.label}</p>
                          <p className="mt-0.5 text-[10.5px] text-[#9B9AA1]">{p.hint}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {form.plan !== 'direct' && (
                  <>
                    <div>
                      <p className="mb-2 mt-1 text-[11px] text-[#9B9AA1]">Szablon strony opinii (wygląd dla klienta)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {TEMPLATE_OPTIONS.map((t) => {
                          const selected = form.template === t.id;
                          return (
                            <button
                              type="button"
                              key={t.id}
                              onClick={() => setForm({ ...form, template: t.id, accentColor: t.accentDefault })}
                              className="flex items-center gap-2.5 rounded-[11px] border px-[11px] py-[9px] text-left"
                              style={{
                                borderColor: selected ? ACCENT : '#2A2A31',
                                background: selected ? 'rgba(212,161,94,0.1)' : 'transparent',
                              }}
                            >
                              <span className="h-6 w-6 shrink-0 rounded-[7px] border border-white/15" style={{ background: t.swatch }} />
                              <span className="text-[11.5px] text-[#E9E7E1]">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {form.template !== 'custom' && (
                      <div className="flex items-center justify-between rounded-[11px] border border-[#2A2A31] px-3.5 py-2.5">
                        <span className="text-[11.5px] text-[#9B9AA1]">Kolor akcentu</span>
                        <input
                          type="color"
                          value={form.accentColor}
                          onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                          className="h-6 w-10 cursor-pointer rounded border-none bg-transparent"
                        />
                      </div>
                    )}

                    {form.template === 'custom' && (
                      <div className="flex flex-col gap-2.5 rounded-[11px] border border-[#2A2A31] p-3.5">
                        <p className="text-[11px] font-semibold text-[#E9E7E1]">Własny projekt strony (tylko dla tego klienta)</p>

                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] text-[#9B9AA1]">Kolor akcentu</span>
                          <input
                            type="color"
                            value={form.customTheme.accent}
                            onChange={(e) => updateCustomTheme('accent', e.target.value)}
                            className="h-6 w-10 cursor-pointer rounded border-none bg-transparent"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] text-[#9B9AA1]">Kolor tła strony</span>
                          <input
                            type="color"
                            value={form.customTheme.pageBg}
                            onChange={(e) => updateCustomTheme('pageBg', e.target.value)}
                            className="h-6 w-10 cursor-pointer rounded border-none bg-transparent"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] text-[#9B9AA1]">Kolor karty</span>
                          <input
                            type="color"
                            value={form.customTheme.cardBg}
                            onChange={(e) => updateCustomTheme('cardBg', e.target.value)}
                            className="h-6 w-10 cursor-pointer rounded border-none bg-transparent"
                          />
                        </div>

                        <div>
                          <span className="mb-1.5 block text-[11.5px] text-[#9B9AA1]">Czcionka nagłówka</span>
                          <select
                            value={form.customTheme.font}
                            onChange={(e) => updateCustomTheme('font', e.target.value as CustomThemeConfig['font'])}
                            className="w-full rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12.5px] text-[#E9E7E1] outline-none"
                          >
                            {CUSTOM_FONT_OPTIONS.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="mb-1.5 block text-[11.5px] text-[#9B9AA1]">Zdjęcie w tle (opcjonalnie)</span>
                          {form.customTheme.backgroundImageUrl ? (
                            <div className="flex items-center gap-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={form.customTheme.backgroundImageUrl} alt="" className="h-12 w-12 rounded-lg border border-[#2A2A31] object-cover" />
                              <button
                                type="button"
                                onClick={() => updateCustomTheme('backgroundImageUrl', null)}
                                className="text-[11px] text-[#E28A6B] underline"
                              >
                                Usuń zdjęcie
                              </button>
                            </div>
                          ) : (
                            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#2A2A31] py-2.5 text-[11.5px] text-[#9B9AA1]">
                              <ImagePlus size={14} />
                              {uploadingBackground ? 'Wgrywanie...' : 'Wgraj zdjęcie'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleBackgroundUpload}
                                disabled={uploadingBackground}
                              />
                            </label>
                          )}
                        </div>

                        <div className="mt-1 flex flex-col gap-2">
                          <p className="text-[10.5px] text-[#9B9AA1]">Teksty na stronie</p>
                          <input
                            placeholder="Pytanie o ocenę"
                            value={form.customTheme.copy.ratingPrompt}
                            onChange={(e) => updateCustomCopy('ratingPrompt', e.target.value)}
                            className="rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12px] text-[#E9E7E1] outline-none"
                          />
                          <input
                            placeholder="Podpis pod gwiazdkami"
                            value={form.customTheme.copy.ratingHint}
                            onChange={(e) => updateCustomCopy('ratingHint', e.target.value)}
                            className="rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12px] text-[#E9E7E1] outline-none"
                          />
                          <input
                            placeholder="Tytuł przy ocenie 4-5★"
                            value={form.customTheme.copy.positiveTitle}
                            onChange={(e) => updateCustomCopy('positiveTitle', e.target.value)}
                            className="rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12px] text-[#E9E7E1] outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Treść przy ocenie 4-5★"
                            value={form.customTheme.copy.positiveBody}
                            onChange={(e) => updateCustomCopy('positiveBody', e.target.value)}
                            className="resize-none rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12px] text-[#E9E7E1] outline-none"
                          />
                          <input
                            placeholder="Tytuł przy ocenie 1-3★"
                            value={form.customTheme.copy.negativeTitle}
                            onChange={(e) => updateCustomCopy('negativeTitle', e.target.value)}
                            className="rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12px] text-[#E9E7E1] outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Treść przy ocenie 1-3★"
                            value={form.customTheme.copy.negativeBody}
                            onChange={(e) => updateCustomCopy('negativeBody', e.target.value)}
                            className="resize-none rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12px] text-[#E9E7E1] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="rounded-[11px] border border-[#2A2A31] p-3.5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-[#9B9AA1]">Subskrypcja ważna do</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: getSubscriptionStatus(form.subscriptionExpiresAt || null).bg,
                        color: getSubscriptionStatus(form.subscriptionExpiresAt || null).color,
                      }}
                    >
                      {getSubscriptionStatus(form.subscriptionExpiresAt || null).label}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={form.subscriptionExpiresAt}
                    onChange={(e) => setForm({ ...form, subscriptionExpiresAt: e.target.value })}
                    className="mb-2 w-full rounded-[10px] border border-[#2A2A31] bg-[#101012] px-3 py-2 text-[12.5px] text-[#E9E7E1] outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, subscriptionExpiresAt: addInterval(form.subscriptionExpiresAt, 'month') })}
                      className="flex-1 rounded-[10px] border border-[#2A2A31] py-1.5 text-[11px] text-[#C9C7C2]"
                    >
                      + 1 miesiąc
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, subscriptionExpiresAt: addInterval(form.subscriptionExpiresAt, 'year') })}
                      className="flex-1 rounded-[10px] border border-[#2A2A31] py-1.5 text-[11px] text-[#C9C7C2]"
                    >
                      + 1 rok
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1.5 rounded-xl py-3 text-[13px] font-semibold text-[#1A1305]"
                  style={{ background: ACCENT }}
                >
                  {editingCompany ? 'Zapisz zmiany' : 'Zapisz klienta i wygeneruj link'}
                </button>
              </form>

              {editingCompany && (() => {
                const clientViews = pageViews.filter((v) => v.company_id === editingCompany.id).length;
                const clientRatings = ratings.filter((r) => r.company_id === editingCompany.id).length;
                const conversion = clientViews > 0 ? `${Math.round((clientRatings / clientViews) * 100)}%` : '—';
                return (
                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#2A2A31] pt-4">
                    <MiniStat label="Wizyty" value={String(clientViews)} />
                    <MiniStat label="Oceny" value={String(clientRatings)} />
                    <MiniStat label="Konwersja" value={conversion} />
                  </div>
                );
              })()}

              {editingCompany &&
                (editingCompany.plan === 'full' ||
                  feedbacks.some((f) => f.company_id === editingCompany.id)) && (
                <div className="mt-5 border-t border-[#2A2A31] pt-4">
                  <p className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#E9E7E1]">
                    <MessageSquare size={13} />
                    Prywatny feedback tego klienta
                  </p>
                  <div className="flex flex-col gap-2">
                    {feedbacks
                      .filter((f) => f.company_id === editingCompany.id)
                      .map((f) => (
                        <div key={f.id} className="rounded-xl border border-[#2A2A31] p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11.5px] font-semibold text-[#E9E7E1]">{f.rating}★</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10.5px] text-[#6F6E76]">{new Date(f.created_at).toLocaleDateString('pl-PL')}</span>
                              <button
                                type="button"
                                onClick={() => toggleResolved(f.id, f.resolved)}
                                className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                                style={{
                                  borderColor: f.resolved ? 'rgba(95,190,138,0.4)' : '#2A2A31',
                                  color: f.resolved ? '#5FBE8A' : '#9B9AA1',
                                }}
                              >
                                <CheckCircle2 size={10} />
                                {f.resolved ? 'Obsłużono' : 'Oznacz'}
                              </button>
                            </div>
                          </div>
                          <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#B7B5B0]">{f.message}</p>
                          {f.customer_contact && (
                            <p className="mt-1 text-[10.5px]" style={{ color: ACCENT }}>
                              Kontakt: {f.customer_contact}
                            </p>
                          )}
                        </div>
                      ))}
                    {feedbacks.filter((f) => f.company_id === editingCompany.id).length === 0 && (
                      <p className="text-[11.5px] text-[#6F6E76]">Brak zgłoszeń od tego klienta.</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col items-center gap-2 md:absolute md:inset-x-auto md:bottom-5 md:right-5 md:items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="rounded-xl border border-[#2A2A31] bg-[#1C1C21] px-4 py-3 text-[12.5px] text-[#E9E7E1] shadow-xl"
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-[#232328] bg-[#16161A]/95 px-2 py-2 backdrop-blur-lg md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5"
              style={{ color: active ? ACCENT : '#9B9AA1' }}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ShieldGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#101012" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 2l7 4v6c0 5-3.4 8.4-7 10-3.6-1.6-7-5-7-10V6z" />
    </svg>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2A2A31] p-2.5 text-center">
      <p className="text-[15px] font-semibold text-[#F5F3EE]" style={{ fontFamily: 'var(--font-fraunces)' }}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-[#8B8A90]">{label}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  trendColor,
}: {
  label: string;
  value: string;
  trend: string;
  trendColor: string;
}) {
  return (
    <div className="rounded-2xl border border-[#2A2A31] bg-[#1C1C21] p-[18px_20px]">
      <p className="mb-2.5 text-[11.5px] text-[#8B8A90]">{label}</p>
      <p className="text-[26px] font-semibold text-[#F5F3EE]" style={{ fontFamily: 'var(--font-fraunces)' }}>
        {value}
      </p>
      <p className="mt-2 text-[11px]" style={{ color: trendColor }}>
        {trend}
      </p>
    </div>
  );
}
