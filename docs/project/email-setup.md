# Email setup checklist (owner)

For `email-spec.md`. Brevo is the provider; turboterp.com's DNS is at Porkbun.

## 1. Brevo: verify turboterp.com
1. In Brevo, open the account menu (top right) → **Senders, Domains & Dedicated IPs** → **Domains** → **Add a domain** → `turboterp.com`. Choose to authenticate it yourself.
2. Brevo lists DNS records, usually:
   - a TXT `brevo-code:…`
   - two DKIM records (`brevo1._domainkey` and `brevo2._domainkey`, CNAME)
   - a DMARC TXT on `_dmarc`
3. Add each one in Porkbun: **Domain Management** → turboterp.com → **DNS**. Copy the type, host and answer exactly. Porkbun appends `.turboterp.com` to the host, so enter only the part before it.
4. Back in Brevo, click **Verify** (DNS can take minutes to an hour) until the domain shows Authenticated.
5. **Senders** tab → **Add a sender**: name `TurboTerp`, email `noreply@turboterp.com`. Because the domain is authenticated, there's no inbox to confirm.

## 2. Brevo: keys
Account menu → **SMTP & API**:
- **SMTP tab:** note the server `smtp-relay.brevo.com`, port `587` and your SMTP **login** (it looks like `…@smtp-brevo.com`). Click **Generate a new SMTP key** and copy it. It's shown once.
- **API keys tab:** **Generate a new API key** (name it `turboterp-vercel`) and copy it.
- Account menu → **Security** → **Authorised IPs**: turn the restriction **off** if it's on. Vercel's servers don't have fixed IPs, so the API would reject the site's calls.

## 3. Supabase: sign-in emails (works as soon as it's saved; no deploy needed)
Supabase dashboard → project `turboterp`:
1. **Authentication → Emails → SMTP Settings** → enable **Custom SMTP**:
   - Sender email `noreply@turboterp.com`, sender name `TurboTerp`
   - Host `smtp-relay.brevo.com`, port `587`
   - Username = the Brevo SMTP login, password = the SMTP key
2. **Authentication → Rate Limits** → "Rate limit for sending emails": raise it to about 30 per hour.
3. **Authentication → URL Configuration**:
   - Site URL `https://turboterp.com`
   - Redirect URLs: `https://turboterp.com/**`, `https://www.turboterp.com/**`, and `http://localhost:3000/**` for local dev
4. Test: open the Advisor on turboterp.com and sign in with an address that isn't on the Supabase team. The link should arrive from noreply@turboterp.com.

## 4. Vercel: settings for reports and plan emails
Vercel → project `turboterp` → **Settings → Environment Variables**. Add these for Production (and Preview, if you want them there):
- `BREVO_API_KEY` = the API key (mark it Sensitive)
- `EMAIL_FROM` = `noreply@turboterp.com`
- `REPORT_TO_EMAIL` = the address reports go to

These take effect on the next deploy after `feat/email` is merged. Until then, nothing reads them.

## 5. Supabase: migration 0006 (after `feat/email` is merged)
Supabase → **SQL Editor** → paste and run `supabase/migrations/0006_email_sends.sql`. It creates the rate-limit table. Without it, report and plan emails are refused (fail closed).
