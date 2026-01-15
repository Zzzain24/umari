# Umari

A platform for small businesses to create digital menus, accept orders, and get paid instantly.

**Live:** [umari.app](https://umari.app)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe Connect (Direct Charges)
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Features

- Digital menu creation and management
- Real-time order tracking
- Stripe Connect for business payments
- Apple Pay & Google Pay support
- Guest checkout (no account required for customers)
- QR code menu sharing
## .env Example

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_CLIENT_ID=ca_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PLATFORM_FEE_PERCENTAGE=2.0

# App
NEXT_PUBLIC_APP_DOMAIN=yourdomain.com
```
