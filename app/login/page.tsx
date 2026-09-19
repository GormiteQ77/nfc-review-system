'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StarfieldBackground from '@/components/StarfieldBackground';

const ACCENT = '#D4A15E';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (signInError) {
      setError('Nieprawidłowy e-mail lub hasło.');
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError('Nie udało się wysłać linku. Sprawdź adres e-mail.');
      return;
    }

    setResetSent(true);
  };

  const backToLogin = () => {
    setMode('login');
    setError(null);
    setResetSent(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0E0E10] px-4">
      <StarfieldBackground accent={ACCENT} />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[400px] rounded-3xl border border-white/10 bg-[#1C1C21]/55 p-9 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex flex-col items-center">
          <div
            className="mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-[13px] shadow-[0_10px_24px_-8px_rgba(212,161,94,0.5)]"
            style={{ background: `linear-gradient(160deg, ${ACCENT}, #8A6B3A)` }}
          >
            <ShieldCheck className="h-[22px] w-[22px]" color="#101012" strokeWidth={2.2} />
          </div>
          <h1
            className="text-[19px] font-semibold text-[#F5F3EE]"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Panel NFC
          </h1>
          <p className="mt-1 text-center text-xs text-[#9B9AA1]">
            {mode === 'login' ? 'Zaloguj się do panelu' : 'Zresetuj hasło do panelu'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#9B9AA1]">Adres e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ty@firma.pl"
                className="w-full rounded-xl border border-[#2E2E36] bg-[#101012]/70 px-3.5 py-3 text-[13px] text-[#F0EEE8] outline-none focus:border-[#D4A15E]/60"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] text-[#9B9AA1]">Hasło</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                  }}
                  className="text-[11px]"
                  style={{ color: ACCENT }}
                >
                  Zapomniałeś hasła?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#2E2E36] bg-[#101012]/70 px-3.5 py-3 pr-10 text-[13px] text-[#F0EEE8] outline-none focus:border-[#D4A15E]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#9B9AA1]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-[12px] text-[#E28A6B]">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-semibold text-[#1A1305] shadow-[0_16px_30px_-12px_rgba(212,161,94,0.5)] transition disabled:opacity-60"
              style={{ background: ACCENT }}
            >
              {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>
        ) : resetSent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[13px] text-[#F0EEE8]">
              Wysłaliśmy link do zresetowania hasła na adres <span className="font-medium">{email}</span>.
            </p>
            <p className="text-[11.5px] text-[#9B9AA1]">Sprawdź skrzynkę (też folder spam) i kliknij link, żeby ustawić nowe hasło.</p>
            <button type="button" onClick={backToLogin} className="mt-1 text-[11.5px] underline" style={{ color: ACCENT }}>
              Wróć do logowania
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#9B9AA1]">Adres e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ty@firma.pl"
                className="w-full rounded-xl border border-[#2E2E36] bg-[#101012]/70 px-3.5 py-3 text-[13px] text-[#F0EEE8] outline-none focus:border-[#D4A15E]/60"
              />
            </div>

            {error && <p className="text-[12px] text-[#E28A6B]">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-semibold text-[#1A1305] shadow-[0_16px_30px_-12px_rgba(212,161,94,0.5)] transition disabled:opacity-60"
              style={{ background: ACCENT }}
            >
              {isSubmitting ? 'Wysyłanie...' : 'Wyślij link resetujący'}
            </button>
            <button type="button" onClick={backToLogin} className="text-center text-[11.5px] text-[#9B9AA1]">
              Wróć do logowania
            </button>
          </form>
        )}

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-[#6F6E76]">
          <Lock size={11} />
          Bezpieczne logowanie · Supabase Auth
        </p>
      </motion.div>
    </main>
  );
}
