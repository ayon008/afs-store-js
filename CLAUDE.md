# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint validation
```

No test runner is configured. Turbopack is disabled (`NEXT_USE_TURBOPACK=0`).

## Architecture Overview

This is a **Next.js 16 e-commerce frontend** for AFS Foiling (hydrofoil equipment), connecting to a WordPress/WooCommerce backend via REST API.

### Core Technology Stack
- **Next.js 16.1** with App Router and React 19
- **React Compiler** enabled via Babel plugin
- **Tailwind CSS v4** for styling
- **next-intl** for i18n (English/French, default: English)
- **TanStack Query** for client-side data fetching
- **React Hook Form** for form handling
- **GSAP** for animations

### Data Flow Architecture

```
WordPress/WooCommerce (staging.afs-foiling.com)
         ↓
    REST API / Store API
         ↓
  Server Actions (src/app/actions/)
  API Routes (src/app/api/)
         ↓
  React Query / Context Providers
         ↓
     React Components
```

### Key Directories

- `src/app/[locale]/` - Locale-based routing (en/fr)
- `src/app/actions/WC/` - Server actions for WooCommerce data fetching
- `src/app/api/` - API routes for cart, orders, payments
- `src/Shared/` - Reusable components and hooks
- `src/lib/` - Utility functions and payment integrations
- `src/i18n/` - Internationalization configuration
- `locales/` - Translation JSON files
- `wordpress-plugin/` - Custom WordPress plugins (menu, WCML API)

### State Management

- **AuthProvider** (`src/Shared/Provider/AuthProvider.jsx`) - JWT auth context
- **CartProvider** - Shopping cart with localStorage + WooCommerce sync
- **React Query** via `QueryProvider` - Server state caching

### Payment Gateways

Three payment providers integrated in `src/lib/`:
- **PayPal** - `CheckoutPaypal.js`
- **Monetico** - `CheckoutMonitico.js` (French gateway, supports split payments)
- **Authorize.Net** - Native integration with Accept.js (PCI SAQ A compliant)

### Authorize.Net Integration

Native Authorize.Net CIM integration using Accept.js for PCI-compliant card tokenization:

**Service Layer** (`src/lib/authorize-net/AuthorizeNetService.js`):
- Transaction processing (auth, capture, void, refund)
- CIM profile management (customer profiles, payment profiles)
- Webhook validation

**API Endpoints** (`src/app/api/payments/authorize/`):
- `POST /process` - Create order and process payment with opaqueData or saved profile
- `GET/POST/DELETE /cim/profiles` - Customer profile management
- `GET/POST/DELETE /cim/payment-profiles` - Saved card management
- `POST /webhook` - Handle Authorize.Net webhook notifications
- `GET /config` - Get Accept.js public credentials

**Components** (`src/lib/AuthorizeNet/`):
- `PaymentForm.jsx` - Card input form with Accept.js tokenization
- `SavedPaymentMethods.jsx` - Display and select saved cards

**Environment Variables**:
```
AUTHORIZE_NET_API_LOGIN_ID=...
AUTHORIZE_NET_TRANSACTION_KEY=...
AUTHORIZE_NET_CLIENT_KEY=...  # For Accept.js
AUTHORIZE_NET_ENVIRONMENT=sandbox|production
AUTHORIZE_NET_VALIDATION_MODE=testMode|liveMode
AUTHORIZE_NET_WEBHOOK_SECRET=...  # Optional
```

### WooCommerce Integration

All WooCommerce data fetching goes through:
- Server actions in `src/app/actions/WC/` (products, categories, blog, events)
- Proxy helper in `src/proxy.js` (handles auth headers, cookie management)
- Custom WordPress plugins for menu data and multi-currency (WCML)

### Protected Routes

Middleware (`src/middleware.js` + `src/proxy.js`) protects:
- `/my-account/*` - User account pages
- `/checkout` - Requires non-empty cart
- `/demande-sav` - Service requests

### Environment Variables

Required in `.env.local`:
- `WP_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` - WooCommerce API
- `WP_JWT_LOGIN_URL` - Authentication endpoint
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` - Frontend URLs
- PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`
- Monetico: `MONETICO_TPE`, `MONETICO_SECRET_KEY`, `MONETICO_ENVIRONMENT` (+ split/immediate variants)
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` - Google Maps
- `AFS_WCML_API_TOKEN` - Custom WCML API authentication

### API Route Patterns

Cart operations: `POST/PATCH/DELETE /api/cart/[action]`
Orders: `POST /api/orders`, `GET /api/orders/[id]/payment-url`
Payments: `POST /api/payments/[provider]/initiate`
WooCommerce proxy: `/api/wc/orders/[id]`

### i18n Configuration

- Locales defined in `src/i18n/routing.js`
- Messages in `locales/[locale]/default.json` and `checkout.json`
- Use `useTranslations` hook from next-intl
- Locale prefix mode: "as-needed" (no prefix for default English)

### Image Optimization

Remote patterns configured in `next.config.mjs` for:
- afs-foiling.com, staging.afs-foiling.com
- Wikimedia Commons
- localhost development

### Layout Structure

Main layout (`src/app/[locale]/layout.jsx`) uses `force-dynamic` for SSR. The layout wraps content with QueryProvider, AuthProvider, and internationalization.
