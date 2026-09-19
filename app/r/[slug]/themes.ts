export type TemplateId = 'universal' | 'kwiaciarnia' | 'barbershop' | 'restauracja' | 'custom';

export interface ReviewTheme {
  id: TemplateId;
  label: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  cardRadius: string;
  textPrimary: string;
  textSecondary: string;
  pageTextPrimary: string;
  pageTextSecondary: string;
  accentDefault: string;
  starMutedFill: string;
  starMutedStroke: string;
  fontDisplay: string;
  fontDisplayItalic: boolean;
  primaryBtnBg: string;
  primaryBtnText: string;
  secondaryBtnBg: string;
  secondaryBtnText: string;
  inputBg: string;
  inputBorder: string;
  swatch: string;
  copy: {
    ratingPrompt: string;
    ratingHint: string;
    positiveTitle: string;
    positiveBody: string;
    negativeTitle: string;
    negativeBody: string;
  };
}

export const THEMES: Record<Exclude<TemplateId, 'custom'>, ReviewTheme> = {
  universal: {
    id: 'universal',
    label: 'Uniwersalny',
    pageBg: '#F7F1E8',
    cardBg: '#FFFFFF',
    cardBorder: '#ECE3D2',
    cardRadius: '26px',
    textPrimary: '#211D18',
    textSecondary: '#8B7F6B',
    pageTextPrimary: '#211D18',
    pageTextSecondary: '#8B7F6B',
    accentDefault: '#B8863B',
    starMutedFill: '#E7DEC9',
    starMutedStroke: '#D8CDB4',
    fontDisplay: 'var(--font-fraunces)',
    fontDisplayItalic: false,
    primaryBtnBg: 'accent',
    primaryBtnText: '#FFFFFF',
    secondaryBtnBg: '#211D18',
    secondaryBtnText: '#FFFFFF',
    inputBg: '#FBF8F2',
    inputBorder: '#ECE3D2',
    swatch: 'linear-gradient(135deg,#F7F1E8,#B8863B)',
    copy: {
      ratingPrompt: 'Jak oceniasz dzisiejszą wizytę?',
      ratingHint: 'Wystarczy jeden dotyk gwiazdki',
      positiveTitle: 'To wspaniałe!',
      positiveBody:
        'Będzie nam niezmiernie miło, jeśli podzielisz się opinią na Google — zajmie to tylko chwilę.',
      negativeTitle: 'Przepraszamy! Co możemy poprawić?',
      negativeBody: 'Twoja opinia trafi bezpośrednio do właściciela — nie pojawi się publicznie.',
    },
  },
  kwiaciarnia: {
    id: 'kwiaciarnia',
    label: 'Kwiaciarnia',
    pageBg: '#F5F3EA',
    cardBg: '#FFFFFF',
    cardBorder: '#EDE8DA',
    cardRadius: '22px',
    textPrimary: '#33301F',
    textSecondary: '#8B8874',
    pageTextPrimary: '#33301F',
    pageTextSecondary: '#8B8874',
    accentDefault: '#7C8B6F',
    starMutedFill: '#E5E1CF',
    starMutedStroke: '#D8D3BC',
    fontDisplay: 'var(--font-cormorant)',
    fontDisplayItalic: false,
    primaryBtnBg: 'accent',
    primaryBtnText: '#FFFFFF',
    secondaryBtnBg: '#33301F',
    secondaryBtnText: '#FFFFFF',
    inputBg: '#FAF8F0',
    inputBorder: '#EDE8DA',
    swatch: 'linear-gradient(135deg,#F5F3EA,#7C8B6F)',
    copy: {
      ratingPrompt: 'Jak oceniasz nasze kwiaty?',
      ratingHint: 'Dziękujemy, że jesteś z nami',
      positiveTitle: 'Jak miło to czytać!',
      positiveBody: 'Będzie nam bardzo miło, jeśli podzielisz się opinią na Google.',
      negativeTitle: 'Co możemy poprawić?',
      negativeBody: 'Twoja opinia trafi bezpośrednio do właściciela kwiaciarni.',
    },
  },
  barbershop: {
    id: 'barbershop',
    label: 'Barbershop',
    pageBg: '#15130F',
    cardBg: '#1E1B17',
    cardBorder: '#33302A',
    cardRadius: '18px',
    textPrimary: '#F1ECDD',
    textSecondary: '#9A9384',
    pageTextPrimary: '#F1ECDD',
    pageTextSecondary: '#9A9384',
    accentDefault: '#C9A227',
    starMutedFill: '#3A362E',
    starMutedStroke: '#4A453A',
    fontDisplay: 'var(--font-bebas)',
    fontDisplayItalic: false,
    primaryBtnBg: 'accent',
    primaryBtnText: '#1A1305',
    secondaryBtnBg: 'accent',
    secondaryBtnText: '#1A1305',
    inputBg: '#15130F',
    inputBorder: '#33302A',
    swatch: 'linear-gradient(135deg,#C9A227,#15130F)',
    copy: {
      ratingPrompt: 'Jak oceniasz dzisiejszą wizytę?',
      ratingHint: 'Ostrzymy nie tylko brzytwy',
      positiveTitle: 'Trzymaj fason!',
      positiveBody: 'Będzie nam bardzo miło, jeśli podzielisz się opinią na Google.',
      negativeTitle: 'Co możemy poprawić?',
      negativeBody: 'Twoja opinia trafi bezpośrednio do właściciela salonu.',
    },
  },
  restauracja: {
    id: 'restauracja',
    label: 'Restauracja',
    pageBg: '#1B1512',
    cardBg: '#FBF3E7',
    cardBorder: 'accent',
    cardRadius: '4px',
    textPrimary: '#2A211B',
    textSecondary: '#8A7A63',
    pageTextPrimary: '#F3ECDD',
    pageTextSecondary: '#B7AC97',
    accentDefault: '#C9A15A',
    starMutedFill: '#E4D8C2',
    starMutedStroke: '#D6C7A8',
    fontDisplay: 'var(--font-cormorant)',
    fontDisplayItalic: true,
    primaryBtnBg: '#2A211B',
    primaryBtnText: 'accent',
    secondaryBtnBg: '#2A211B',
    secondaryBtnText: 'accent',
    inputBg: '#FFFFFF',
    inputBorder: '#E4D8C2',
    swatch: 'linear-gradient(135deg,#C9A15A,#1B1512)',
    copy: {
      ratingPrompt: 'Jak smakowała dzisiejsza wizyta?',
      ratingHint: 'Smacznego i dziękujemy za wizytę',
      positiveTitle: 'Smacznego wspomnienia!',
      positiveBody: 'Będzie nam bardzo miło, jeśli podzielisz się opinią na Google.',
      negativeTitle: 'Co możemy poprawić?',
      negativeBody: 'Twoja opinia trafi bezpośrednio do szefa kuchni.',
    },
  },
};

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string; swatch: string; accentDefault: string }[] = [
  ...Object.values(THEMES).map((t) => ({
    id: t.id,
    label: t.label,
    swatch: t.swatch,
    accentDefault: t.accentDefault,
  })),
  {
    id: 'custom',
    label: 'Custom (własny projekt)',
    swatch: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
    accentDefault: '#8B5CF6',
  },
];

export function resolveColor(value: string, accent: string) {
  return value === 'accent' ? accent : value;
}

// --- Per-client "custom" template ---
// Unlike the presets above (shared, picked by id), a custom design lives
// entirely on the company's own row (companies.custom_theme) and is built
// into a full ReviewTheme on the fly. It is never added to THEMES/
// TEMPLATE_OPTIONS, so it can never appear as a pickable preset for a
// different client.

export interface CustomThemeConfig {
  accent: string;
  font: 'fraunces' | 'cormorant' | 'cormorant-italic' | 'bebas';
  pageBg: string;
  cardBg: string;
  backgroundImageUrl: string | null;
  copy: ReviewTheme['copy'];
}

export const CUSTOM_FONT_OPTIONS: { id: CustomThemeConfig['font']; label: string; family: string; italic: boolean }[] = [
  { id: 'fraunces', label: 'Eleganckie (Fraunces)', family: 'var(--font-fraunces)', italic: false },
  { id: 'cormorant', label: 'Klasyczne (Cormorant)', family: 'var(--font-cormorant)', italic: false },
  { id: 'cormorant-italic', label: 'Eleganckie, kursywa', family: 'var(--font-cormorant)', italic: true },
  { id: 'bebas', label: 'Mocne, wersaliki (Bebas)', family: 'var(--font-bebas)', italic: false },
];

export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
  accent: '#B8863B',
  font: 'fraunces',
  pageBg: '#F7F1E8',
  cardBg: '#FFFFFF',
  backgroundImageUrl: null,
  copy: {
    ratingPrompt: 'Jak oceniasz dzisiejszą wizytę?',
    ratingHint: 'Wystarczy jeden dotyk gwiazdki',
    positiveTitle: 'Dziękujemy!',
    positiveBody: 'Będzie nam bardzo miło, jeśli podzielisz się opinią na Google.',
    negativeTitle: 'Co możemy poprawić?',
    negativeBody: 'Twoja opinia trafi bezpośrednio do właściciela — nie pojawi się publicznie.',
  },
};

function hexLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function isLightColor(hex: string): boolean {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return true;
  return hexLuminance(hex) > 0.5;
}

export function buildCustomTheme(custom: CustomThemeConfig): ReviewTheme {
  const cardLight = isLightColor(custom.cardBg);
  const pageLight = custom.backgroundImageUrl ? false : isLightColor(custom.pageBg);
  const accentLight = isLightColor(custom.accent);
  const fontDef = CUSTOM_FONT_OPTIONS.find((f) => f.id === custom.font) ?? CUSTOM_FONT_OPTIONS[0];

  return {
    id: 'custom',
    label: 'Custom',
    pageBg: custom.pageBg,
    cardBg: custom.cardBg,
    cardBorder: cardLight ? '#00000014' : '#FFFFFF1F',
    cardRadius: '22px',
    textPrimary: cardLight ? '#211D18' : '#F1ECDD',
    textSecondary: cardLight ? '#8B7F6B' : '#9A9384',
    pageTextPrimary: pageLight ? '#211D18' : '#F5F3EE',
    pageTextSecondary: pageLight ? '#8B7F6B' : '#C9C7C2',
    accentDefault: custom.accent,
    starMutedFill: cardLight ? '#E7DEC9' : '#3A362E',
    starMutedStroke: cardLight ? '#D8CDB4' : '#4A453A',
    fontDisplay: fontDef.family,
    fontDisplayItalic: fontDef.italic,
    primaryBtnBg: 'accent',
    primaryBtnText: accentLight ? '#211D18' : '#FFFFFF',
    secondaryBtnBg: cardLight ? '#211D18' : 'accent',
    secondaryBtnText: cardLight ? '#FFFFFF' : accentLight ? '#211D18' : '#FFFFFF',
    inputBg: cardLight ? '#FBF8F2' : '#15130F',
    inputBorder: cardLight ? '#ECE3D2' : '#33302A',
    swatch: `linear-gradient(135deg, ${custom.pageBg}, ${custom.accent})`,
    copy: custom.copy,
  };
}
