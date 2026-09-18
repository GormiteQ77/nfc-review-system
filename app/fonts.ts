import { Bebas_Neue, Cormorant_Garamond, Fraunces, Work_Sans } from 'next/font/google';

export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  style: ['normal'],
  variable: '--font-fraunces',
});

export const workSans = Work_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
});

export const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

export const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
});
