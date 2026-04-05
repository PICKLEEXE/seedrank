# RankRoot AI — Instrukcja instalacji

## Wymagania

- Node.js 18+
- PostgreSQL (lub konto Supabase: supabase.com)
- Konto Stripe (opcjonalnie dla płatności)

## 1. Instalacja zależności

```bash
cd rankroot-ai
npm install
```

## 2. Konfiguracja zmiennych środowiskowych

```bash
cp .env.example .env.local
```

Wypełnij `.env.local`:

```env
# Supabase → Settings → Database → Connection string (Transaction mode, port 6543)
DATABASE_URL="postgresql://postgres.[project]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Wygeneruj: openssl rand -base64 32
NEXTAUTH_SECRET="twoj-sekret-min-32-znaki"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (sk_test_... dla testów)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_BEGINNER="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ULTIMATE="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."

# OpenAI (opcjonalnie – demo mode działa bez)
OPENAI_API_KEY="sk-..."

# Google OAuth (opcjonalnie – dla GSC)
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."

NEXT_PUBLIC_URL="http://localhost:3000"
```

## 3. Baza danych

```bash
# Wygeneruj klienta Prisma
npm run db:generate

# Wypchnij schemat do bazy
npm run db:push
```

## 4. Uruchomienie

```bash
npm run dev
```

Otwórz http://localhost:3000 i zarejestruj konto.

## 5. Stripe Webhook (lokalnie)

```bash
# Zainstaluj Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Skopiuj wyświetlony `whsec_...` do `.env.local` jako `STRIPE_WEBHOOK_SECRET`.

## Struktura projektu

```
rankroot-ai/
├── app/
│   ├── (auth)/          # Login, Signup
│   ├── (dashboard)/     # Panel, Strony, Artykuły, Integracje, Ustawienia
│   └── api/             # API routes
├── components/
│   ├── ui/              # shadcn/ui komponenty
│   └── dashboard/       # Sidebar, TopHeader, StatsCard, DomainVerification
├── lib/
│   ├── prisma.ts        # Klient Prisma
│   ├── auth.ts          # NextAuth config
│   ├── stripe.ts        # Stripe + plany cenowe
│   └── demo-data.ts     # Mock data dla Demo Mode
└── prisma/
    └── schema.prisma    # Schemat bazy danych
```

## Demo Mode

Domyślnie aplikacja działa w **Demo Mode** — generowanie artykułów używa mock data
bez potrzeby konfigurowania OpenAI API. Możesz to zmienić w Ustawienia → Klucze API.
