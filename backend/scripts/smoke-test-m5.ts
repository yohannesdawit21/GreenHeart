/**
 * M5 smoke test — run: npm run test:smoke:m5
 * Requires .env with DATABASE_URL, REDIS_URL, JWT_SECRET
 */
import dotenv from 'dotenv';
dotenv.config();

const BASE = `http://127.0.0.1:${process.env.PORT ?? '4000'}`;

let passed = 0;
let failed = 0;

function ok(name: string) {
  passed++;
  console.log(`  ✓ ${name}`);
}

function fail(name: string, detail: string) {
  failed++;
  console.log(`  ✗ ${name}`);
  console.log(`    ${detail.slice(0, 400)}`);
}

async function req(
  method: string,
  path: string,
  opts: { body?: unknown; cookie?: string } = {},
): Promise<{ status: number; body: unknown; cookie?: string }> {
  const headers: Record<string, string> = {};
  if (opts.body) headers['Content-Type'] = 'application/json';
  if (opts.cookie) headers['Cookie'] = opts.cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, cookie: opts.cookie };
}

function extractCookie(setCookie: string | undefined, prev?: string): string {
  const token = setCookie?.match(/auth_token=([^;]+)/)?.[1];
  if (token) return `auth_token=${token}`;
  return prev ?? '';
}

async function main() {
  console.log('=== GreenHeart M5 Smoke Test ===\n');

  const ts = Date.now();
  let clientCookie = '';
  let advisorCookie = '';
  let advisorId = '';

  try {
    await req('GET', '/health');
  } catch {
    fail('Server reachable', `Start backend with npm run dev at ${BASE}`);
    process.exit(1);
  }

  const clientReg = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `m5-client-${ts}@test.com`,
      password: 'password123',
    }),
  });
  const clientBody = (await clientReg.json()) as { user?: { id?: string } };
  clientCookie = extractCookie(clientReg.headers.get('set-cookie') ?? undefined);
  if (clientReg.status === 201) ok('Register client');
  else fail('Register client', JSON.stringify(clientBody));

  const advisorReg = await fetch(`${BASE}/api/auth/register/advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `m5-advisor-${ts}@test.com`,
      password: 'password123',
      profile: {
        username: `DrM5_${ts}`,
        bio: 'Stress and sleep coaching',
        tags: ['stress', 'sleep'],
        coinRatePerSession: 10,
      },
    }),
  });
  const advisorBody = (await advisorReg.json()) as { user?: { id?: string } };
  advisorCookie = extractCookie(advisorReg.headers.get('set-cookie') ?? undefined);
  advisorId = advisorBody.user?.id ?? '';
  if (advisorReg.status === 201 && advisorId) ok('Register advisor applicant');
  else fail('Register advisor applicant', JSON.stringify(advisorBody));

  const offlineInit = await req('POST', '/api/session/initiate', {
    cookie: clientCookie,
    body: { advisorId },
  });
  const initCode = (offlineInit.body as { error?: { code?: string } }).error?.code;
  if (offlineInit.status === 403 && initCode === 'ADVISOR_NOT_VERIFIED') {
    ok('Initiate blocked for unverified advisor → ADVISOR_NOT_VERIFIED');
  } else fail('Initiate while unverified', JSON.stringify(offlineInit.body));

  const onlineTry = await req('PATCH', '/api/presence/status', {
    cookie: advisorCookie,
    body: { online: true },
  });
  const onlineCode = (onlineTry.body as { error?: { code?: string } }).error?.code;
  if (onlineTry.status === 403 && onlineCode === 'ADVISOR_NOT_VERIFIED') {
    ok('Go online blocked until verified → ADVISOR_NOT_VERIFIED');
  } else fail('Go online while unverified', JSON.stringify(onlineTry.body));

  const onlineList = await req('GET', '/api/presence/advisors');
  if (onlineList.status === 200) ok('GET /api/presence/advisors');
  else fail('GET /api/presence/advisors', JSON.stringify(onlineList.body));

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  console.log('Note: full call flow requires verified advisor — see npm run test:functional.');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
