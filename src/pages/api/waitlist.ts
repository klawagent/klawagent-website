import type { APIRoute } from 'astro';

// This endpoint runs ONLY on the Railway (SSR/node) deployment, never on the
// static GitHub Pages build. The public homepage (klawagent.ai) POSTs here
// cross-origin; we add the email to a Resend Audience (the waitlist) and,
// optionally, email the team a heads-up.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_ORIGINS = new Set([
  'https://klawagent.ai',
  'https://www.klawagent.ai',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://klawagent.ai';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const env: Record<string, string | undefined> = (globalThis as any).process?.env ?? {};

export const OPTIONS: APIRoute = ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders(request.headers.get('origin')),
  };

  try {
    const body = (await request.json().catch(() => ({}))) as { email?: unknown; source?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const source = typeof body.source === 'string' ? body.source : '';

    if (!EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_email' }), { status: 400, headers });
    }

    // Accept the Resend key under either name — it was first added to Railway
    // as RAILWAY_API_KEY, so we read that as a fallback. The VALUE must be a
    // Resend key (re_…); a non-Resend value will surface as a 401 on send.
    const apiKey = env.RESEND_API_KEY || env.RAILWAY_API_KEY;
    const segmentId = env.RESEND_SEGMENT_ID;
    if (!apiKey || !segmentId) {
      // Not wired up yet — surface clearly in logs, fail soft to the visitor.
      return new Response(JSON.stringify({ ok: false, error: 'not_configured' }), { status: 503, headers });
    }

    // 1) Add the contact to the account audience, tagged into the waitlist
    // segment. (Resend's current model: POST /contacts with a segments array.)
    const addRes = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, unsubscribed: false, segments: [{ id: segmentId }] }),
    });

    // 201 = created. A duplicate may return 4xx — that's still "on the list".
    if (!addRes.ok && addRes.status !== 409 && addRes.status !== 422) {
      if (addRes.status === 401 || addRes.status === 403 || addRes.status >= 500) {
        return new Response(JSON.stringify({ ok: false, error: 'provider_error' }), { status: 502, headers });
      }
    }

    // 2) Optional team notification (only if a verified sender is configured).
    const notifyTo = env.WAITLIST_NOTIFY_TO;
    const notifyFrom = env.WAITLIST_NOTIFY_FROM;
    if (notifyTo && notifyFrom) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: notifyFrom,
          to: [notifyTo],
          subject: `New early-access signup: ${email}`,
          text: `${email} just joined the KlawAgent waitlist${source ? ` (via ${source})` : ''}.`,
        }),
      }).catch(() => { /* notification is best-effort */ });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'server_error' }), { status: 500, headers });
  }
};
