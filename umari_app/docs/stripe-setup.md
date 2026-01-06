# Stripe Setup Guide for Umari

This guide walks you through setting up Stripe Connect for your Umari platform, enabling business owners to accept payments through their own Stripe accounts.

## Prerequisites

- Stripe account (create at https://stripe.com if you don't have one)
- Umari development/production environment access
- Access to Supabase dashboard for database setup

---

## Part 1: Stripe Dashboard Configuration

### Step 1: Create or Access Your Stripe Account

1. Go to https://stripe.com and sign in (or create an account)
2. You'll start in **Test Mode** (recommended for development)
3. Note the toggle in the top-right - you can switch between Test and Live modes

### Step 2: Enable Stripe Connect

1. In Stripe Dashboard, go to **Connect** from the left sidebar
2. Click **Get started** if this is your first time
3. Under "Connect type", this will be set up for **Standard accounts**

### Step 3: Configure OAuth Settings

1. In Stripe Dashboard, navigate to: **Settings** → **Connect** → **Connect settings**
2. Under **OAuth settings**, configure:
   - **Integration name**: "Umari" (or your platform name)
   - **Brand icon**: Upload your Umari logo
   - **Brand color**: Choose your primary brand color

3. **Add redirect URIs**:
   - Development: `http://localhost:3000/api/stripe/oauth/callback`
   - Production: `https://yourdomain.com/api/stripe/oauth/callback`
   - Click "Add URI" for each environment

4. **Client ID**: Copy this value - you'll need it for environment variables
   - It looks like: `ca_xxxxxxxxxxxxxxxxxxxxx`

### Step 4: Get API Keys

1. Navigate to **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key**: Starts with `pk_test_` (test mode) or `pk_live_` (live mode)
   - **Secret key**: Click "Reveal test key" - starts with `sk_test_` (test mode) or `sk_live_` (live mode)

⚠️ **Security Note**: Never commit secret keys to version control!

### Step 5: Set Up Webhooks

1. Navigate to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Configure the endpoint:
   - **Endpoint URL**:
     - Development: `http://localhost:3000/api/stripe/webhooks` (use Stripe CLI for local testing)
     - Production: `https://yourdomain.com/api/stripe/webhooks`
   - **Description**: "Umari payment events"
   - **Events from**: Select **"Connected and v2 accounts"** (important for Stripe Connect - you need events from business owners' connected accounts, not just your platform account)
   - **Events to send**: Select these events:
     - `account.updated`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Click **Add endpoint**

4. **Copy the Signing Secret**:
   - After creating the endpoint, click on it
   - Under "Signing secret", click "Reveal"
   - Copy the value (starts with `whsec_`)

### Step 6: Configure Application Fee (Optional)

This is set programmatically when creating Payment Intents, but you can review settings:

1. Go to **Connect** → **Settings**
2. Under **Application fees**, review the documentation
3. Note: Umari controls the fee percentage via environment variable (`STRIPE_PLATFORM_FEE_PERCENTAGE`)

---

## Part 2: Umari Environment Setup

### Step 1: Add Environment Variables

Add these to your `.env` file (never commit this file!):

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Stripe Connect OAuth
STRIPE_CLIENT_ID=ca_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_CLIENT_ID=ca_xxxxxxxxxxxxxxxxxxxxx

# Stripe Webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Platform Configuration
STRIPE_PLATFORM_FEE_PERCENTAGE=2.0
```

**Important**:
- Use **test mode** keys during development
- Switch to **live mode** keys for production
- The `NEXT_PUBLIC_` prefix exposes the variable to the browser (safe for publishable keys only)

**Fee Structure Note**:
- The 2% application fee is charged ON TOP of Stripe's standard processing fees (~2.9% + 30¢)
- Total cost to vendors: ~5% + 30¢ per transaction
- Umari nets the 2% application fee, Stripe keeps their processing fees

### Step 2: Install Required Packages

```bash
npm install stripe @stripe/stripe-js
```

### Step 3: Set Up Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the SQL commands from `/database/payments-schema.sql`
4. Verify tables were created: **Database** → **Tables**

---

## Part 3: Testing the Integration

### Local Development with Stripe CLI

The Stripe CLI allows you to test webhooks locally:

1. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

   This will give you a webhook signing secret (starts with `whsec_`)
   - Use this value for `STRIPE_WEBHOOK_SECRET` in development

4. **Trigger test events**:
   ```bash
   stripe trigger payment_intent.succeeded
   stripe trigger account.updated
   ```

### Testing OAuth Connection Flow

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/payments`
3. Click "Connect with Stripe"
4. You'll be redirected to Stripe's OAuth page
5. Click "Skip this form" in test mode (for quick testing)
6. You should be redirected back with a success message

### Verify Database Records

After connecting, check your Supabase dashboard:

1. Go to **Table Editor**
2. Check `stripe_accounts` table - should have a new row
3. Check `payment_settings` table - should have default settings

---

## Part 4: Going to Production

### Before Launching

- [ ] Switch Stripe account from Test Mode to Live Mode
- [ ] Replace all test API keys with live keys
- [ ] Update OAuth redirect URIs to production domain
- [ ] Update webhook endpoint to production URL
- [ ] Set up proper secret management (e.g., Vercel Environment Variables)
- [ ] Review Stripe Connect terms and platform agreement
- [ ] Set up email notifications for failed webhooks
- [ ] Enable 2FA on your Stripe account

### Stripe Account Activation

1. Complete your Stripe account verification:
   - Business details
   - Bank account for payouts
   - Tax information
   - Identity verification

2. Review compliance requirements:
   - Terms of Service
   - Privacy Policy
   - Refund policy (if applicable)

### Monitoring

1. **Stripe Dashboard**: Monitor connected accounts, payments, disputes
2. **Webhook Logs**: Check **Developers** → **Webhooks** for delivery status
3. **Application Logs**: Monitor your server logs for errors
4. **Supabase Logs**: Check database operations

---

## Troubleshooting

### OAuth Connection Fails

**Error: "Invalid redirect_uri"**
- Ensure the redirect URI in your code matches exactly what's in Stripe Dashboard
- Check for trailing slashes (shouldn't have one)

**Error: "Invalid client_id"**
- Verify `STRIPE_CLIENT_ID` matches the value in Stripe Dashboard
- Make sure you're using the correct mode (test vs live)

### Webhooks Not Receiving

- Verify webhook signing secret is correct
- Check webhook endpoint is publicly accessible (use ngrok for local testing)
- Review webhook logs in Stripe Dashboard
- Ensure your server is returning 200 OK responses

### Database Errors

- Check RLS policies are enabled and correct
- Verify user is authenticated before making requests
- Check foreign key constraints (user_id references auth.users)

---

## Security Best Practices

1. **Never commit secrets**:
   - Keep `.env` in `.gitignore`
   - Use environment variables for all keys

2. **Webhook verification**:
   - Always verify webhook signatures
   - Never trust webhook data without verification

3. **OAuth state parameter**:
   - Umari uses user ID as state to prevent CSRF
   - Always validate state matches authenticated user

4. **Token storage**:
   - Access tokens are stored in database
   - Consider encrypting tokens at rest for production

5. **HTTPS only**:
   - Stripe requires HTTPS for OAuth and webhooks
   - Use Vercel or similar for automatic HTTPS

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Connect Guide**: https://stripe.com/docs/connect
- **Stripe API Reference**: https://stripe.com/docs/api
- **Stripe Support**: https://support.stripe.com
- **Stripe Discord**: https://stripe.com/discord
