# VisaHub

A modern visa application platform — compare, apply, and track visas for 150+ countries.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS v4**
- **Shadcn UI** (Radix primitives)
- **Framer Motion**
- **TanStack Query**
- **React Hook Form** + **Zod**
- **Axios**

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
# Add your Vughy API key to .env.local:
# VUGHY_API_KEY=your_key_here

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── countries/    # GET /api/countries — proxies Vughy country list
│   │   └── search-visas/ # POST /api/search-visas — proxies Vughy visa search
│   └── visa-results/     # /visa-results — search results page
├── components/
│   ├── ui/               # Reusable UI primitives (Button, Card, Input, etc.)
│   ├── layout/           # Navbar, Footer
│   ├── sections/         # Homepage sections (Hero, Destinations, FAQ, etc.)
│   ├── animations/       # Framer Motion wrappers (FadeUp, Stagger, etc.)
│   ├── search/           # CountrySelect, VisaSearchForm
│   └── visa/             # VisaCard, skeletons, error/empty states
├── features/             # Feature modules (auth, visa, applications, etc.)
├── hooks/                # React Query hooks (useCountries, useVisaSearch)
├── services/             # API service layer (country.service, visa.service)
├── lib/                  # Utilities (cn, vughy-client, constants, flags)
├── types/                # TypeScript interfaces
├── providers/            # React context providers (TanStack Query)
└── constants/            # Site constants
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/countries` | GET | Returns all countries with flags |
| `/api/search-visas` | POST | Searches visas for origin → destination |

API routes proxy the Vughy API server-side — the API key is never exposed to the browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VUGHY_API_KEY` | Vughy API key for visa data |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
