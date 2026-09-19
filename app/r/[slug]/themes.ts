export type TemplateId = 'universal' | 'kwiaciarnia' | 'barbershop' | 'restauracja';

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

export const THEMES: Record<TemplateId, ReviewTheme> = {
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

export const TEMPLATE_OPTIONS = Object.values(THEMES).map((t) => ({
  id: t.id,
  label: t.label,
  swatch: t.swatch,
  accentDefault: t.accentDefault,
}));

export function resolveColor(value: string, accent: string) {
  return value === 'accent' ? accent : value;
}
