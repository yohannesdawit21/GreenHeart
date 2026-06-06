/**
 * M2/M3 smoke test — run: npm run test:smoke
 * Requires .env with valid DATABASE_URL and PAYMENT_WEBHOOK_SECRET
 */
import dotenv from 'dotenv';
dotenv.config();

const BASE = `http://127.0.0.1:${process.env.PORT ?? '4000'}`;
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET ?? '';

let passed = 0;
let failed = 0;

function ok(name: string) {
  passed++;
  console.log(`  ✓ ${name}`);
}

function fail(name: string, detail: string) {
  failed++;
  console.log(`  ✗ ${name}`);
  console.log(`    ${detail.slice(0, 300)}`);
}

async function req(
  method: string,
  path: string,
  opts: { body?: unknown; cookie?: string; headers?: Record<string, string> } = {},
): Promise<{ status: number; body: unknown; cookie?: string }> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.body) headers['Content-Type'] = 'application/json';
  if (opts.cookie) headers['Cookie'] = opts.cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const setCookie = res.headers.get('set-cookie') ?? undefined;
  let body: unknown;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, cookie: setCookie ?? opts.cookie };
}

function extractCookie(setCookie: string | undefined, prev?: string): string {
  const token = setCookie?.match(/auth_token=([^;]+)/)?.[1];
  if (token) return `auth_token=${token}`;
  return prev ?? '';
}

async function main() {
  console.log('=== GreenHeart M2/M3 Smoke Test ===\n');

  const ts = Date.now();
  const clientEmail = `client-${ts}@test.com`;
  const advisorEmail = `advisor-${ts}@test.com`;
  let cookie = '';

  // Health
  try {
    const h = await req('GET', '/health');
    if (h.status === 200 && (h.body as { status?: string }).status === 'ok') ok('GET /health');
    else fail('GET /health', JSON.stringify(h));
  } catch (e) {
    fail('GET /health', `Server not reachable at ${BASE} — start with npm run dev. ${e}`);
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    process.exit(1);
  }

  // Register client
  const reg = await req('POST', '/api/auth/register', {
    body: { email: clientEmail, password: 'password123' },
  });
  if (reg.status === 201 && (reg.body as { user?: { id?: string } }).user?.id) {
    ok('POST /api/auth/register (client)');
    cookie = extractCookie(reg.cookie, cookie);
  } else fail('POST /api/auth/register (client)', JSON.stringify(reg.body));

  const clientId = (reg.body as { user?: { id?: string } }).user?.id ?? '';

  // Me
  const me = await req('GET', '/api/auth/me', { cookie });
  if (me.status === 200) ok('GET /api/auth/me');
  else fail('GET /api/auth/me', JSON.stringify(me.body));

  const advisorUsername = `DrSmoke_${ts}`;

  // Register advisor applicant (pending_review — not in public list)
  const advReg = await req('POST', '/api/auth/register/advisor', {
    body: {
      email: advisorEmail,
      password: 'password123',
      profile: { username: advisorUsername, bio: 'Test advisor', tags: ['stress'], coinRatePerSession: 10 },
    },
  });
  const advisorId = (advReg.body as { user?: { id?: string } }).user?.id ?? '';
  if (advReg.status === 201 && advisorId) ok('POST /api/auth/register/advisor');
  else fail('POST /api/auth/register/advisor', JSON.stringify(advReg.body));

  const pendingStatus = (advReg.body as { user?: { profile?: { verificationStatus?: string } } }).user
    ?.profile?.verificationStatus;
  if (pendingStatus === 'pending_review') ok('Advisor applicant pending_review');
  else fail('Advisor verification status', JSON.stringify(advReg.body));

  // List advisors — pending applicant must NOT appear
  const advisors = await req('GET', '/api/users/advisors');
  const list = (advisors.body as { advisors?: { id?: string }[] }).advisors ?? [];
  if (advisors.status === 200 && !list.some((a) => a.id === advisorId)) {
    ok('GET /api/users/advisors (excludes pending)');
  } else fail('GET /api/users/advisors', JSON.stringify(advisors.body));

  // Balance
  const bal0 = await req('GET', '/api/wallet/balance', { cookie });
  const coin0 = (bal0.body as { wallet?: { coinBalance?: number } }).wallet?.coinBalance;
  if (bal0.status === 200 && coin0 === 0) ok('GET /api/wallet/balance (0)');
  else fail('GET /api/wallet/balance (0)', JSON.stringify(bal0.body));

  // Purchase
  const purchase = await req('POST', '/api/wallet/purchase/initiate', {
    cookie,
    body: { packageId: 'starter' },
  });
  const mockId = (purchase.body as { mockPaymentId?: string }).mockPaymentId;
  if (purchase.status === 200 && mockId) ok('POST /api/wallet/purchase/initiate');
  else fail('POST /api/wallet/purchase/initiate', JSON.stringify(purchase.body));

  // Webhook without secret
  if (WEBHOOK_SECRET) {
    const whFail = await req('POST', '/api/wallet/webhook/payment', {
      body: { gatewayReference: mockId, status: 'completed' },
    });
    if (whFail.status === 401) ok('Webhook rejects missing secret');
    else fail('Webhook rejects missing secret', JSON.stringify(whFail.body));
  }

  // Webhook with secret
  const whOk = await req('POST', '/api/wallet/webhook/payment', {
    body: { gatewayReference: mockId, status: 'completed' },
    headers: WEBHOOK_SECRET ? { 'X-Webhook-Secret': WEBHOOK_SECRET } : {},
  });
  if (whOk.status === 200) ok('POST /api/wallet/webhook/payment');
  else fail('POST /api/wallet/webhook/payment', JSON.stringify(whOk.body));

  // Balance after deposit
  const bal1 = await req('GET', '/api/wallet/balance', { cookie });
  const coin1 = (bal1.body as { wallet?: { coinBalance?: number } }).wallet?.coinBalance;
  if (coin1 === 20) ok('Balance after deposit (20 coins)');
  else fail('Balance after deposit', JSON.stringify(bal1.body));

  // Escrow lock
  const lock = await req('POST', '/api/wallet/escrow/lock', {
    cookie,
    body: { clientId, amountCoins: 10, sessionId: 'smoke-test' },
  });
  if (lock.status === 200 && (lock.body as { success?: boolean }).success) ok('POST /api/wallet/escrow/lock');
  else fail('POST /api/wallet/escrow/lock', JSON.stringify(lock.body));

  const bal2 = await req('GET', '/api/wallet/balance', { cookie });
  const w2 = (bal2.body as { wallet?: { coinBalance?: number; escrowBalance?: number } }).wallet;
  if (w2?.coinBalance === 10 && w2?.escrowBalance === 10) ok('Balance after escrow lock');
  else fail('Balance after escrow lock', JSON.stringify(bal2.body));

  // Escrow release
  const rel = await req('POST', '/api/wallet/escrow/release', {
    cookie,
    body: { clientId, advisorId, amountCoins: 10 },
  });
  if (rel.status === 200) ok('POST /api/wallet/escrow/release');
  else fail('POST /api/wallet/escrow/release', JSON.stringify(rel.body));

  // Login / logout
  const login = await req('POST', '/api/auth/login', {
    body: { email: clientEmail, password: 'password123' },
  });
  let loginCookie = extractCookie(login.cookie);
  if (login.status === 200) ok('POST /api/auth/login');
  else fail('POST /api/auth/login', JSON.stringify(login.body));

  const logout = await req('POST', '/api/auth/logout', { cookie: loginCookie });
  if (logout.status === 200) ok('POST /api/auth/logout');
  else fail('POST /api/auth/logout', JSON.stringify(logout.body));

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
