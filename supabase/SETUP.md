# Supabase Setup Guide — Matrimony App

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Project name**: `matrimony-app`
   - **Database password**: (save this securely)
   - **Region**: Choose closest to your users (e.g., `ap-south-1` for India)
4. Wait ~2 minutes for project to spin up

---

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
3. Create your `.env` file in the project root:

```bash
cp .env.example .env
```

4. Paste your values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 3: Run SQL Schema (in order)

Go to **SQL Editor** in Supabase dashboard and run each file in this exact order:

### 3a. Core Schema
Copy and paste contents of `supabase/schema.sql` → Run

### 3b. Triggers
Copy and paste contents of `supabase/triggers.sql` → Run

### 3c. RLS Policies
Copy and paste contents of `supabase/rls_policies.sql` → Run

### 3d. Storage Setup
Copy and paste contents of `supabase/storage.sql` → Run

---

## Step 4: Configure Authentication

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. Under **Email → OTP**, make sure:
   - ✅ Enable Email OTP
   - Set OTP expiry to **600 seconds** (10 minutes)
4. Go to **Authentication → Email Templates**
5. Customize the OTP email template for your branding

---

## Step 5: Configure Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. You should see `profile-images` bucket (created by storage.sql)
3. Verify it is set to **Private** (not public)
4. The SQL file already created all necessary policies

> **If the bucket wasn't created by SQL**, create it manually:
> - Click **New Bucket**
> - Name: `profile-images`
> - Toggle **Public bucket** OFF
> - Click **Create bucket**
> - Then run the storage.sql policies manually

---

## Step 6: Configure Email (Optional but recommended)

For production, set up a custom SMTP provider:
1. Go to **Settings → Authentication → SMTP Settings**
2. Add your SMTP credentials (e.g., from Resend, SendGrid, or Postmark)
3. This prevents Supabase's default email limits from blocking OTP delivery

---

## Step 7: Verify Setup

Run this query in SQL Editor to confirm tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
```
contact_details
contact_reveal_requests
interests
photos
preferences
profile_views
profiles
```

---

## Step 8: Start Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Environment Variables Reference

| Variable | Description | Where to find |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | Settings → API |

---

## Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

The `vercel.json` file in the project root handles SPA routing automatically.

---

## MSG91 Phone OTP (Future Integration)

When ready to add phone verification:

1. Sign up at [https://msg91.com](https://msg91.com)
2. Create a template for OTP
3. Add to `.env`:
   ```env
   VITE_MSG91_AUTH_KEY=your_auth_key
   VITE_MSG91_TEMPLATE_ID=your_template_id
   ```
4. Implement `src/services/phoneService.js` — the placeholder functions are already structured

---

## Admin Access

The admin page is available at `/admin`. To protect it properly in production:

1. Create an `admins` table or use Supabase custom claims
2. The current implementation uses a `is_admin` check in the session
3. For now, you can manually set a user as admin via SQL:
   ```sql
   -- Example: manually set admin flag (use your own mechanism)
   UPDATE auth.users SET raw_user_meta_data = '{"is_admin": true}' 
   WHERE email = 'admin@yoursite.com';
   ```
