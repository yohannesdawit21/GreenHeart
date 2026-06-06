/**
 * M6 Role C smoke test — verification interview LiveKit token route
 * Run: npm run test:smoke:m6  (server must be running; 004 migration applied)
 */
import dotenv from 'dotenv';
import { connectPostgres, disconnectPostgres, getPool } from '../src/database/postgres/connection.js';

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
): Promise<{ status: number; body: unknown; setCookie?: string }> {
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
  return { status: res.status, body, setCookie: res.headers.get('set-cookie') ?? undefined };
}

function extractCookie(setCookie: string | undefined): string {
  const token = setCookie?.match(/auth_token=([^;]+)/)?.[1];
  return token ? `auth_token=${token}` : '';
}

async function main() {
  console.log('=== GreenHeart M6 LiveKit Token Smoke Test ===\n');

  const ts = Date.now();
  let applicantCookie = '';
  let partnerCookie = '';
  let outsiderCookie = '';
  let applicantId = '';
  let partnerId = '';
  let interviewId = '';

  try {
    await req('GET', '/health');
  } catch {
    fail('Server reachable', `Start backend with npm run dev at ${BASE}`);
    process.exit(1);
  }

  const applicantReg = await req('POST', '/api/auth/register', {
    body: {
      email: `m6-applicant-${ts}@test.com`,
      password: 'password123',
      role: 'advisor',
      profile: {
        username: `Applicant_${ts}`,
        bio: 'Applying for verification',
        tags: ['general'],
        coinRatePerSession: 10,
      },
    },
  });
  applicantCookie = extractCookie(applicantReg.setCookie);
  applicantId = (applicantReg.body as { user?: { id?: string } }).user?.id ?? '';
  if (applicantReg.status === 201 && applicantId) ok('Register applicant advisor');
  else fail('Register applicant advisor', JSON.stringify(applicantReg.body));

  const partnerReg = await req('POST', '/api/auth/register', {
    body: {
      email: `m6-partner-${ts}@test.com`,
      password: 'password123',
      role: 'advisor',
      profile: {
        username: `Partner_${ts}`,
        bio: 'Partner doctor stand-in for smoke test',
        tags: ['verification'],
        coinRatePerSession: 0,
      },
    },
  });
  partnerCookie = extractCookie(partnerReg.setCookie);
  partnerId = (partnerReg.body as { user?: { id?: string } }).user?.id ?? '';
  if (partnerReg.status === 201 && partnerId) ok('Register partner stand-in');
  else fail('Register partner stand-in', JSON.stringify(partnerReg.body));

  const outsiderReg = await req('POST', '/api/auth/register', {
    body: { email: `m6-outsider-${ts}@test.com`, password: 'password123', role: 'client' },
  });
  outsiderCookie = extractCookie(outsiderReg.setCookie);
  if (outsiderReg.status === 201) ok('Register outsider client');
  else fail('Register outsider client', JSON.stringify(outsiderReg.body));

  const unauth = await req('GET', `/api/verification/interviews/${crypto.randomUUID()}/livekit-token`);
  if (unauth.status === 401) ok('Reject unauthenticated token request');
  else fail('Reject unauthenticated', JSON.stringify(unauth.body));

  try {
    await connectPostgres();
    const { rows } = await getPool().query<{ id: string }>(
      `INSERT INTO verification_interviews (applicant_id, partner_doctor_id, status, livekit_room)
       VALUES ($1, $2, 'in_progress', $3)
       RETURNING id`,
      [applicantId, partnerId, `verification-smoke-${ts}`],
    );
    interviewId = rows[0]?.id ?? '';
    if (interviewId) ok('Seed verification_interviews row');
    else fail('Seed interview row', 'INSERT returned no id');
  } catch (err) {
    fail('Seed interview row', String(err));
    console.log('    Hint: run npm run db:migrate to apply 004_advisor_verification.sql');
    await disconnectPostgres().catch(() => {});
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    process.exit(1);
  }

  const applicantToken = await req(
    'GET',
    `/api/verification/interviews/${interviewId}/livekit-token`,
    { cookie: applicantCookie },
  );
  const aBody = applicantToken.body as { token?: string; livekitUrl?: string; roomName?: string };
  if (applicantToken.status === 200 && aBody.token && aBody.livekitUrl && aBody.roomName) {
    ok('Applicant receives LiveKit token');
  } else if (applicantToken.status === 503) {
    fail('Applicant LiveKit token', 'LiveKit not configured — set LIVEKIT_* in .env');
  } else {
    fail('Applicant LiveKit token', JSON.stringify(applicantToken.body));
  }

  const partnerToken = await req(
    'GET',
    `/api/verification/interviews/${interviewId}/livekit-token`,
    { cookie: partnerCookie },
  );
  const pBody = partnerToken.body as { token?: string };
  if (partnerToken.status === 200 && pBody.token) ok('Partner receives LiveKit token');
  else fail('Partner LiveKit token', JSON.stringify(partnerToken.body));

  const forbidden = await req(
    'GET',
    `/api/verification/interviews/${interviewId}/livekit-token`,
    { cookie: outsiderCookie },
  );
  if (forbidden.status === 403) ok('Reject non-participant');
  else fail('Reject non-participant', JSON.stringify(forbidden.body));

  const missing = await req('GET', `/api/verification/interviews/${crypto.randomUUID()}/livekit-token`, {
    cookie: applicantCookie,
  });
  if (missing.status === 404) ok('Interview not found → 404');
  else fail('Interview not found', JSON.stringify(missing.body));

  await getPool()
    .query('DELETE FROM verification_interviews WHERE id = $1', [interviewId])
    .catch(() => {});
  await disconnectPostgres().catch(() => {});

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
