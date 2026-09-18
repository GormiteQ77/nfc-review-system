'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  Facebook,
  Flower2,
  Globe,
  Instagram,
  Scissors,
  Send,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { resolveColor, THEMES, type TemplateId } from './themes';
import { useReviewFlow } from './useReviewFlow';

interface Company {
  id: string;
  name: string;
  description?: string | null;
  google_review_url: string;
  instagram_url?: string | null;
  facebook_url?: string | null;
  website_url?: string | null;
  template?: TemplateId | null;
  accent_color?: string | null;
}

const stepTransition = { duration: 0.22, ease: 'easeOut' as const };

function Logo({ template, accent, initial }: { template: TemplateId; accent: string; initial: string }) {
  const iconProps = { size: 24, color: accent, strokeWidth: 1.6 };

  if (template === 'kwiaciarnia') return <Flower2 {...iconProps} />;
  if (template === 'barbershop') return <Scissors {...iconProps} />;
  if (template === 'restauracja') return <UtensilsCrossed {...iconProps} />;

  return (
    <span className="text-2xl font-semibold" style={{ color: accent, fontFamily: 'var(--font-fraunces)' }}>
      {initial}
    </span>
  );
}

function Decoration({ template, accent }: { template: TemplateId; accent: string }) {
  if (template === 'kwiaciarnia') {
    return (
      <svg width="100%" height="180" viewBox="0 0 390 180" className="pointer-events-none absolute left-0 top-0 opacity-50">
        <path d="M-10 40 C 60 10, 120 70, 200 30 S 340 10, 410 50" stroke="#B7C2A6" strokeWidth="1.4" fill="none" />
        <circle cx="70" cy="26" r="4" fill="#C98A93" />
        <circle cx="150" cy="46" r="3" fill="#B7C2A6" />
        <circle cx="260" cy="24" r="4" fill="#C98A93" />
        <circle cx="330" cy="40" r="3" fill="#B7C2A6" />
      </svg>
    );
  }

  if (template === 'barbershop') {
    return (
      <div className="pointer-events-none absolute left-0 top-0 h-[130px] w-full overflow-hidden opacity-[0.16]">
        <div
          className="-ml-20 -mt-16 h-[260px] w-[550px]"
          style={{
            background:
              'repeating-linear-gradient(45deg, #9B3A3A 0 18px, #E9E2D0 18px 36px, #2B3A4A 36px 54px)',
          }}
        />
      </div>
    );
  }

  if (template === 'restauracja') {
    return (
      <div
        className="pointer-events-none absolute left-1/2 top-[-120px] h-[480px] w-[480px] -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${accent}2E 0%, transparent 70%)` }}
      />
    );
  }

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[-140px] h-[560px] w-[560px] -translate-x-1/2 rounded-full"
      style={{ background: `radial-gradient(circle, ${accent}29 0%, transparent 68%)` }}
    />
  );
}

export default function ReviewCard({ company }: { company: Company }) {
  const templateId: TemplateId = company.template ?? 'universal';
  const theme = THEMES[templateId] ?? THEMES.universal;
  const accent = company.accent_color || theme.accentDefault;
  const flow = useReviewFlow(company, accent);

  const cardBorder = resolveColor(theme.cardBorder, accent);
  const primaryBtnBg = resolveColor(theme.primaryBtnBg, accent);
  const primaryBtnText = resolveColor(theme.primaryBtnText, accent);
  const secondaryBtnBg = resolveColor(theme.secondaryBtnBg, accent);
  const secondaryBtnText = resolveColor(theme.secondaryBtnText, accent);
  const headingStyle = {
    fontFamily: theme.fontDisplay,
    fontStyle: theme.fontDisplayItalic ? ('italic' as const) : ('normal' as const),
    color: theme.textPrimary,
  };

  return (
    <main
      className="relative flex min-h-screen justify-center overflow-hidden px-4 py-10"
      style={{ background: theme.pageBg }}
    >
      <Decoration template={templateId} accent={accent} />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        <div
          className="mb-3 flex h-[58px] w-[58px] items-center justify-center rounded-full shadow-lg"
          style={{ background: theme.cardBg, border: `1px solid ${cardBorder}` }}
        >
          <Logo template={templateId} accent={accent} initial={company.name.charAt(0)} />
        </div>

        <h1 className="text-center text-[22px] font-semibold" style={headingStyle}>
          {company.name}
        </h1>
        {company.description && (
          <p className="mt-1 text-center text-xs" style={{ color: theme.textSecondary }}>
            {company.description}
          </p>
        )}

        <div
          className="mt-6 flex min-h-[268px] w-full flex-col items-center justify-center p-6"
          style={{ background: theme.cardBg, border: `1px solid ${cardBorder}`, borderRadius: theme.cardRadius }}
        >
          <AnimatePresence mode="wait">
            {flow.step === 'pick' && (
              <motion.div
                key="pick"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={stepTransition}
                className="w-full text-center"
              >
                <p className="mb-4 text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {theme.copy.ratingPrompt}
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = (flow.hover || flow.rating) >= n;
                    return (
                      <motion.button
                        key={n}
                        type="button"
                        whileHover={{ scale: 1.14 }}
                        whileTap={{ scale: 0.92 }}
                        onMouseEnter={() => flow.setHover(n)}
                        onMouseLeave={() => flow.setHover(0)}
                        onClick={() => flow.pick(n)}
                        aria-label={`Oceń ${n} na 5`}
                        className="p-1"
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill={filled ? accent : theme.starMutedFill} stroke={filled ? accent : theme.starMutedStroke} strokeWidth="1.4" strokeLinejoin="round">
                          <path d="M12 2.6l2.9 6.1 6.6.6-5 4.5 1.5 6.6L12 16.9l-5.9 3.5 1.5-6.6-5-4.5 6.6-.6z" />
                        </svg>
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-3.5 text-[11.5px]" style={{ color: theme.textSecondary }}>
                  {theme.copy.ratingHint}
                </p>
              </motion.div>
            )}

            {flow.step === 'positive' && (
              <motion.div
                key="positive"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={stepTransition}
                className="w-full text-center"
              >
                <div
                  className="mx-auto mb-3 flex h-[46px] w-[46px] items-center justify-center rounded-full"
                  style={{ background: `${accent}22` }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={accent} stroke={accent} strokeWidth="1.4">
                    <path d="M12 2.6l2.9 6.1 6.6.6-5 4.5 1.5 6.6L12 16.9l-5.9 3.5 1.5-6.6-5-4.5 6.6-.6z" />
                  </svg>
                </div>
                <h3 className="text-[19px] font-semibold" style={headingStyle}>
                  {theme.copy.positiveTitle}
                </h3>
                <p className="mb-[18px] mt-1.5 text-[12.5px] leading-relaxed" style={{ color: theme.textSecondary }}>
                  {theme.copy.positiveBody}
                </p>
                <a
                  href={company.google_review_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13.5px] font-semibold shadow-lg"
                  style={{ background: primaryBtnBg, color: primaryBtnText }}
                >
                  <ExternalLink size={15} />
                  Wystaw opinię na Google
                </a>
                <button
                  type="button"
                  onClick={flow.reset}
                  className="mt-3 text-[11.5px] underline"
                  style={{ color: theme.textSecondary }}
                >
                  Zmień ocenę
                </button>
              </motion.div>
            )}

            {flow.step === 'negative' && (
              <motion.form
                key="negative"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={stepTransition}
                onSubmit={flow.handleSubmit}
                className="w-full"
              >
                <h3 className="text-[17px] font-semibold" style={headingStyle}>
                  {theme.copy.negativeTitle}
                </h3>
                <p className="mb-3.5 mt-1 text-xs" style={{ color: theme.textSecondary }}>
                  {theme.copy.negativeBody}
                </p>
                <textarea
                  required
                  rows={3}
                  value={flow.message}
                  onChange={(e) => flow.setMessage(e.target.value)}
                  placeholder="Opisz, co poszło nie tak..."
                  className="mb-2 w-full resize-none rounded-xl border p-3 text-[13px] outline-none"
                  style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                />
                <input
                  type="text"
                  value={flow.contact}
                  onChange={(e) => flow.setContact(e.target.value)}
                  placeholder="Twój e-mail lub nr tel. (opcjonalnie)"
                  className="mb-3 w-full rounded-xl border p-3 text-[13px] outline-none"
                  style={{ background: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                />
                <button
                  type="submit"
                  disabled={flow.isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13.5px] font-semibold disabled:opacity-60"
                  style={{ background: secondaryBtnBg, color: secondaryBtnText }}
                >
                  <Send size={14} />
                  {flow.isSubmitting ? 'Wysyłanie...' : 'Wyślij prywatną opinię'}
                </button>
                <button
                  type="button"
                  onClick={flow.reset}
                  className="mx-auto mt-2.5 block text-[11.5px] underline"
                  style={{ color: theme.textSecondary }}
                >
                  Anuluj
                </button>
              </motion.form>
            )}

            {flow.step === 'thanks' && (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={stepTransition}
                className="text-center"
              >
                <CheckCircle2 className="mx-auto mb-2" size={40} color="#4A996E" />
                <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  Dziękujemy za wiadomość!
                </h3>
                <p className="mt-1 text-xs" style={{ color: theme.textSecondary }}>
                  Przekazaliśmy Twoje uwagi kierownictwu.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5 flex w-full flex-col gap-2">
          {company.instagram_url && (
            <a
              href={company.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[12.5px] font-medium"
              style={{ borderColor: cardBorder, color: theme.textPrimary }}
            >
              <Instagram size={14} /> Instagram
            </a>
          )}
          {company.facebook_url && (
            <a
              href={company.facebook_url}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[12.5px] font-medium"
              style={{ borderColor: cardBorder, color: theme.textPrimary }}
            >
              <Facebook size={14} /> Facebook
            </a>
          )}
          {company.website_url && (
            <a
              href={company.website_url}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[12.5px] font-medium"
              style={{ borderColor: cardBorder, color: theme.textPrimary }}
            >
              <Globe size={14} /> Strona WWW
            </a>
          )}
        </div>

        <p className="mt-3.5 flex items-center gap-1.5 text-[10.5px]" style={{ color: theme.textSecondary }}>
          <ShieldCheck size={11} />
          Bezpieczne i anonimowe
        </p>
      </div>
    </main>
  );
}
