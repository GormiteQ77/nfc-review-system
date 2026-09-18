'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StarfieldBackground from '@/components/StarfieldBackground';

const ACCENT = '#D4A15E';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) setLinkInvalid(true);
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hasła nie są takie same.');
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError('Nie udało się zapisać nowego hasła. Spróbuj ponownie.');
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push('/admin');
      router.refresh();
    }, 1500);
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
          <h1 className="text-[19px] font-semibold text-[#F5F3EE]" style={{ fontFamily: 'var(--font-fraunces)' }}>
            Nowe hasło
          </h1>
          <p className="mt-1 text-center text-xs text-[#9B9AA1]">Ustaw nowe hasło do panelu</p>
        </div>

        {linkInvalid ? (
          <div className="text-center">
            <p className="text-[13px] text-[#E28A6B]">Ten link wygasł lub jest nieprawidłowy.</p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-3 text-[11.5px] underline"
              style={{ color: ACCENT }}
            >
              Wróć do logowania i spróbuj ponownie
            </button>
          </div>
        ) : done ? (
          <p className="text-center text-[13px] text-[#F0EEE8]">Hasło zapisane — przenosimy do panelu...</p>
        ) : !ready ? (
          <p className="text-center text-[12.5px] text-[#9B9AA1]">Weryfikacja linku...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#9B9AA1]">Nowe hasło</label>
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

            <div>
              <label className="mb-1.5 block text-[11px] text-[#9B9AA1]">Powtórz nowe hasło</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
