'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, Copy, ExternalLink, LogOut, MessageSquare } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '@/lib/supabase';
import StarfieldBackground from '@/components/StarfieldBackground';
import { TEMPLATE_OPTIONS, type TemplateId } from '../r/[slug]/themes';

const ACCENT = '#D4A15E';
const DAY_LABELS = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

interface Company {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  template: TemplateId;
  plan: 'direct' | 'redirect_all' | 'full';
  subscription_expires_at: string | null;
}

interface Feedback {
  id: string;
  rating: number;
  message: string;
  customer_contact: string | null;
  resolved: boolean;
  created_at: string;
}

interface Rating {
  id: string;
  rating: number;
  created_at: string;
}

interface PageView {
  id: string;
  created_at: string;
}

const PLAN_LABELS: Record<Company['plan'], string> = {
  direct: 'Sama karta (link do Google)',
  redirect_all: 'Custom — wszystkie oceny → Google',
  full: 'Custom — pełny formularz opinii',
};

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
    const avg = dayRatings.length ? dayRatings.reduce((s, r) => s + r.rating, 0) / dayRatings.length : 0;
    days.push({ label: DAY_LABELS[d.getDay()], avg: Number(avg.toFixed(2)) });
  }
  return days;
}

function getSubscriptionStatus(expiresAt: string | null) {
  if (!expiresAt) return { label: 'Brak subskrypcji', color: '#E28A6B', bg: 'rgba(226,138,107,0.15)' };
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: 'Wygasła', color: '#E28A6B', bg: 'rgba(226,138,107,0.15)' };
  if (days <= 7) return { label: `Wygasa za ${days} dni`, color: '#E2B25E', bg: 'rgba(226,178,94,0.15)' };
  return { label: 'Aktywna', color: '#5FBE8A', bg: 'rgba(95,190,138,0.14)' };
}

type Tab = 'overview' | 'feedback';

export default function ClientPanel({ company, userEmail }: { company: Company; userEmail: string }) {
  const router = useRouter();
  const hasFeedbackTab = company.plan === 'full';
  const [tab, setTab] = useState<Tab>('overview');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [reviewUrl, setReviewUrl] = useState('');

  useEffect(() => {
    setReviewUrl(`${window.location.origin}/r/${company.slug}`);

    supabase
      .from('ratings')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setRatings(data as Rating[]));

    supabase
      .from('feedbacks')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setFeedbacks(data as Feedback[]));

    supabase
      .from('page_views')
      .select('id, created_at')
      .eq('company_id', company.id)
      .then(({ data }) => data && setPageViews(data as PageView[]));
  }, [company.id, company.slug]);

  const chartData = useMemo(() => buildChartData(ratings), [ratings]);

  const stats = useMemo(() => {
    const now = new Date();
    const avgRating = ratings.length
      ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(2)
      : '—';
    const thisMonth = ratings.filter((r) => isSameMonth(r.created_at, now)).length;
    const needsContact = feedbacks.filter((f) => !f.resolved).length;
    const visits = pageViews.length;
    const conversion = visits > 0 ? `${Math.round((ratings.length / visits) * 100)}%` : '—';
    return { avgRating, total: ratings.length, thisMonth, needsContact, visits, conversion };
  }, [ratings, feedbacks, pageViews]);

  const toggleResolved = async (id: string, current: boolean) => {
    await supabase.from('feedbacks').update({ resolved: !current }).eq('id', id);
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, resolved: !current } : f)));
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(reviewUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const sub = getSubscriptionStatus(company.subscription_expires_at);
  const templateInfo = TEMPLATE_OPTIONS.find((t) => t.id === company.template) ?? TEMPLATE_OPTIONS[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#101012]">
      <StarfieldBackground accent={ACCENT} starCount={16} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[720px] flex-col p-4 md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[19px] font-semibold text-[#F5F3EE] md:text-[22px]" style={{ fontFamily: 'var(--font-fraunces)' }}>
              {company.name}
            </h1>
            <p className="mt-1 text-[12px] text-[#6F6E76]">Panel klienta · {userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Wyloguj się"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#2A2A31] text-[#9B9AA1] hover:text-[#E28A6B]"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: sub.bg, color: sub.color }}>
            {sub.label}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
            style={{
              background: company.is_active ? 'rgba(95,190,138,0.14)' : 'rgba(226,138,107,0.15)',
              color: company.is_active ? '#5FBE8A' : '#E28A6B',
            }}
          >
            {company.is_active ? 'Wizytówka aktywna' : 'Wizytówka zablokowana'}
          </span>
          <span className="rounded-full border border-[#2A2A31] px-2.5 py-1 text-[10.5px] text-[#C9C7C2]">
            {PLAN_LABELS[company.plan]}
          </span>
        </div>

        {hasFeedbackTab && (
          <div className="mb-5 flex gap-1.5 rounded-[12px] border border-[#2A2A31] bg-[#1C1C21] p-1.5">
            <button
              onClick={() => setTab('overview')}
              className="relative flex-1 rounded-[9px] py-2 text-[12.5px] font-medium"
              style={{ color: tab === 'overview' ? ACCENT : '#9B9AA1' }}
            >
              {tab === 'overview' && (
                <motion.span
                  layoutId="client-nav-highlight"
                  className="absolute inset-0 rounded-[9px]"
                  style={{ background: 'rgba(212,161,94,0.12)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative">Przegląd</span>
            </button>
            <button
              onClick={() => setTab('feedback')}
              className="relative flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-2 text-[12.5px] font-medium"
              style={{ color: tab === 'feedback' ? ACCENT : '#9B9AA1' }}
            >
              {tab === 'feedback' && (
                <motion.span
                  layoutId="client-nav-highlight"
                  className="absolute inset-0 rounded-[9px]"
                  style={{ background: 'rgba(212,161,94,0.12)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative">Opinie</span>
              {stats.needsContact > 0 && (
                <span
                  className="relative flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9.5px] font-semibold"
                  style={{ background: '#E28A6B', color: '#1A1305' }}
                >
                  {stats.needsContact}
                </span>
              )}
            </button>
          </div>
        )}

        {tab === 'overview' && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              <StatCard label="Wizyty na stronie" value={String(stats.visits)} />
              <StatCard label="Wystawione oceny" value={String(stats.total)} />
              <StatCard label="Konwersja" value={stats.conversion} />
              <StatCard label="Średnia ocena" value={stats.avgRating} />
              <StatCard label="W tym miesiącu" value={String(stats.thisMonth)} />
              {hasFeedbackTab ? (
                <button onClick={() => setTab('feedback')} className="text-left">
                  <StatCard
                    label="Do obsłużenia"
                    value={String(stats.needsContact)}
                    accentColor={stats.needsContact > 0 ? '#E28A6B' : undefined}
                  />
                </button>
              ) : (
                <StatCard label="Do obsłużenia" value={String(stats.needsContact)} accentColor={stats.needsContact > 0 ? '#E28A6B' : undefined} />
              )}
            </div>

            <div className="mb-5 rounded-[18px] border border-[#2A2A31] bg-[#1C1C21] p-4 md:p-[22px_24px]">
              <p className="text-[13px] font-semibold text-[#E9E7E1]">Średnia ocena — ostatnie 7 dni</p>
              <div className="mt-2 h-[150px]">
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

            <div className="mb-5 flex flex-col gap-4 rounded-[18px] border border-[#2A2A31] bg-[#1C1C21] p-4 sm:flex-row sm:items-center md:p-[22px_24px]">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#E9E7E1]">Twoja karta opinii</p>
                <p className="mb-2.5 mt-1 break-all text-[12px] text-[#8FA6C9]">{reviewUrl || '...'}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 rounded-[10px] border border-[#2A2A31] px-3 py-2 text-[11.5px] text-[#C9C7C2]"
                  >
                    <Copy size={12} />
                    {linkCopied ? 'Skopiowano!' : 'Kopiuj link'}
                  </button>
                  {reviewUrl && (
                    <a
                      href={reviewUrl}
                      target="_blank"
                      className="flex items-center gap-1.5 rounded-[10px] border border-[#2A2A31] px-3 py-2 text-[11.5px] text-[#C9C7C2]"
                    >
                      <ExternalLink size={12} />
                      Otwórz
                    </a>
                  )}
                </div>
              </div>
              {reviewUrl && (
                <div className="flex shrink-0 items-center justify-center rounded-xl bg-white p-2.5">
                  <QRCode value={reviewUrl} size={104} fgColor="#101012" bgColor="#FFFFFF" />
                </div>
              )}
            </div>

            <p className="mt-1 text-center text-[10.5px] text-[#6F6E76]">Szablon strony: {templateInfo.label}</p>
          </>
        )}

        {tab === 'feedback' && hasFeedbackTab && (
          <div className="flex flex-col gap-3 rounded-[18px] border border-[#2A2A31] bg-[#1C1C21] p-4 md:p-[22px_24px]">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#E9E7E1]">
              <MessageSquare size={14} />
              Prywatny feedback od klientów
            </p>
            {feedbacks.map((f) => (
              <div key={f.id} className="rounded-xl border border-[#2A2A31] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-[#E9E7E1]">{f.rating}★</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] text-[#6F6E76]">{new Date(f.created_at).toLocaleDateString('pl-PL')}</span>
                    <button
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
            {feedbacks.length === 0 && <p className="text-[11.5px] text-[#6F6E76]">Brak zgłoszeń — wszystko gra!</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accentColor }: { label: string; value: string; accentColor?: string }) {
  return (
    <div className="rounded-2xl border border-[#2A2A31] bg-[#1C1C21] p-[14px_16px] md:p-[18px_20px]">
      <p className="mb-2 text-[10.5px] text-[#8B8A90] md:text-[11.5px]">{label}</p>
      <p
        className="text-[20px] font-semibold md:text-[26px]"
        style={{ fontFamily: 'var(--font-fraunces)', color: accentColor ?? '#F5F3EE' }}
      >
        {value}
      </p>
    </div>
  );
}
