# nfc-review-system

Aplikacja NFC do zbierania opinii klientów (Next.js 14 + Supabase + Tailwind).

## Uruchomienie lokalnie

```bash
npm install
cp .env.example .env.local   # uzupełnij NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Konfiguracja Supabase (jednorazowo)

1. **Migracja bazy** — w Supabase SQL Editor uruchom `supabase/migrations/0001_admin_upgrade.sql`.
   Dodaje kolumny `template`/`accent_color` do `companies`, flagę `resolved` do `feedbacks`
   oraz nową tabelę `ratings` (log wszystkich ocen, używany na wykresie w panelu).
2. **Konto do logowania w panelu** — w Supabase → Authentication → Users dodaj użytkownika
   (e-mail + hasło), którym będziesz logować się na `/login`. Panel `/admin` jest chroniony
   przez middleware — bez zalogowania przekieruje na `/login`.

## Strony

- `/r/[slug]` — publiczna karta do wystawiania opinii (4 warianty wyglądu: uniwersalny,
  kwiaciarnia, barbershop, restauracja — ustawiane per klient w panelu administratora).
- `/login` — logowanie do panelu (Supabase Auth).
- `/admin` — panel administratora: statystyki, wykres ocen, lista klientów z możliwością
  zmiany szablonu strony opinii, lista prywatnego feedbacku, wylogowanie.
