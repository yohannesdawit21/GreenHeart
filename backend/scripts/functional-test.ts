/**
 * Full functional test — M2/M3 wallet + M4 search + M5 presence/sessions/socket/LiveKit
 * Run: npm run test:functional  (server must be running: npm run dev)
 */
import dotenv from 'dotenv';
import { io, type Socket } from 'socket.io-client';

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
  console.log(`    ${detail.slice(0, 500)}`);
}

async function req(
  method: string,
  path: string,
  opts: { body?: unknown; cookie?: string; headers?: Record<string, string> } = {},
): Promise<{ status: number; body: unknown; setCookie?: string }> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
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

function extractCookie(setCookie: string | undefined, prev = ''): string {
  const token = setCookie?.match(/auth_token=([^;]+)/)?.[1];
  if (token) return `auth_token=${token}`;
  return prev;
}

function connectSocket(cookie: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(BASE, {
      extraHeaders: { Cookie: cookie },
      transports: ['websocket'],
    });
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error('socket connect timeout'));
    }, 15000);
    socket.on('connect', () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.on('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function waitForEvent<T>(socket: Socket, event: string, timeoutMs = 20000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), timeoutMs);
    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function main() {
  console.log('=== GreenHeart Functional E2E Test ===\n');

  const ts = Date.now();
  let clientCookie = '';
  let advisorCookie = '';
  let advisorId = '';
  let sessionId = '';
  let advisorSocket: Socket | null = null;
  let clientSocket: Socket | null = null;

  try {
    const h = await req('GET', '/health');
    if (h.status === 200) ok('Server health');
    else fail('Server health', JSON.stringify(h.body));
  } catch {
    fail('Server reachable', `Start backend: cd backend && npm run dev (${BASE})`);
    process.exit(1);
  }

  const clientReg = await req('POST', '/api/auth/register', {
    body: { email: `fn-client-${ts}@test.com`, password: 'password123' },
  });
  clientCookie = extractCookie(clientReg.setCookie);
  const clientId = (clientReg.body as { user?: { id?: string } }).user?.id ?? '';
  if (clientReg.status === 201 && clientId) ok('Register client');
  else fail('Register client', JSON.stringify(clientReg.body));

  const advisorReg = await req('POST', '/api/auth/register/advisor', {
    body: {
      email: `fn-advisor-${ts}@test.com`,
      password: 'password123',
      profile: {
        username: `DrFn_${ts}`,
        bio: `Functional test advisor ${ts}: specialized in anxiety mindfulness sleep stress relief coaching`,
        tags: ['anxiety', 'mindfulness', 'sleep'],
        coinRatePerSession: 10,
      },
    },
  });
  advisorCookie = extractCookie(advisorReg.setCookie);
  advisorId = (advisorReg.body as { user?: { id?: string } }).user?.id ?? '';
  if (advisorReg.status === 201 && advisorId) ok('Register advisor applicant');
  else fail('Register advisor applicant', JSON.stringify(advisorReg.body));

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@gmail.com';
  const adminPass = process.env.ADMIN_SEED_PASSWORD ?? '12345678';
  const adminLogin = await req('POST', '/api/auth/login', {
    body: { email: adminEmail, password: adminPass },
  });
  const adminCookie = extractCookie(adminLogin.setCookie);
  if (adminLogin.status !== 200) {
    fail('Admin login (run npm run db:seed)', JSON.stringify(adminLogin.body));
    console.log('\nResults: aborted — seed admin with npm run db:seed');
    process.exit(1);
  }
  ok('Admin login');

  const verifyAdvisor = await req('PATCH', `/api/admin/advisors/${advisorId}/verification-status`, {
    cookie: adminCookie,
    body: { status: 'verified' },
  });
  if (verifyAdvisor.status === 200) ok('Admin verifies advisor');
  else fail('Admin verifies advisor', JSON.stringify(verifyAdvisor.body));

  const purchase = await req('POST', '/api/wallet/purchase/initiate', {
    cookie: clientCookie,
    body: { packageId: 'starter' },
  });
  const mockId = (purchase.body as { mockPaymentId?: string }).mockPaymentId;
  if (purchase.status === 200 && mockId) ok('Initiate coin purchase');
  else fail('Initiate coin purchase', JSON.stringify(purchase.body));

  const wh = await req('POST', '/api/wallet/webhook/payment', {
    body: { gatewayReference: mockId, status: 'completed' },
    headers: WEBHOOK_SECRET ? { 'X-Webhook-Secret': WEBHOOK_SECRET } : {},
  });
  if (wh.status === 200) ok('Payment webhook credits wallet');
  else fail('Payment webhook', JSON.stringify(wh.body));

  const bal = await req('GET', '/api/wallet/balance', { cookie: clientCookie });
  const coins = (bal.body as { wallet?: { coinBalance?: number } }).wallet?.coinBalance ?? 0;
  if (coins >= 10) ok(`Wallet funded (${coins} coins)`);
  else fail('Wallet funded', JSON.stringify(bal.body));

  const reindex = await req('POST', `/api/search/reindex/${advisorId}`, { cookie: adminCookie });
  if (reindex.status === 200) ok('Reindex advisor embedding');
  else fail('Reindex advisor', JSON.stringify(reindex.body));

  const search = await req('POST', '/api/search/semantic', {
    body: { query: `functional test advisor ${ts} anxiety sleep mindfulness`, limit: 10 },
  });
  const results = (search.body as { results?: { id?: string }[] }).results ?? [];
  const matched = results.filter((r) => r.id === advisorId);
  if (search.status === 200 && matched.length > 0) {
    ok('Semantic search finds advisor');
  } else if (search.status === 502) {
    fail('Semantic search', 'Embedding API failed — check GEMINI_EMBEDDING_MODEL=gemini-embedding-001 in .env');
  } else {
    fail('Semantic search', JSON.stringify(search.body));
  }

  try {
    advisorSocket = await connectSocket(advisorCookie);
    ok('Advisor socket connected');
  } catch (err) {
    fail('Advisor socket connected', String(err));
    process.exit(1);
  }

  const online = await req('PATCH', '/api/presence/status', {
    cookie: advisorCookie,
    body: { online: true },
  });
  if (online.status === 200) ok('Advisor goes online');
  else fail('Advisor goes online', JSON.stringify(online.body));

  const onlineList = await req('GET', '/api/presence/advisors');
  const onlineIds = (onlineList.body as { advisorIds?: string[] }).advisorIds ?? [];
  if (onlineList.status === 200 && onlineIds.includes(advisorId)) ok('Advisor listed online');
  else fail('Advisor listed online', JSON.stringify(onlineList.body));

  try {
    clientSocket = await connectSocket(clientCookie);
    ok('Client socket connected');
  } catch (err) {
    fail('Client socket connected', String(err));
  }

  const sessionReadyPromise = clientSocket
    ? waitForEvent<{
        sessionId?: string;
        livekitToken?: string;
        livekitUrl?: string;
        roomName?: string;
      }>(clientSocket, 'session_ready')
    : null;

  const incomingPromise = waitForEvent<{ sessionId?: string; clientName?: string }>(
    advisorSocket,
    'incoming_call_dispatch',
  );

  const initiate = await req('POST', '/api/session/initiate', {
    cookie: clientCookie,
    body: { advisorId },
  });
  sessionId = (initiate.body as { sessionId?: string }).sessionId ?? '';
  if (initiate.status === 201 && sessionId) ok('Client initiates session (escrow locked)');
  else fail('Client initiates session', JSON.stringify(initiate.body));

  try {
    const incoming = await incomingPromise;
    if (incoming.sessionId === sessionId) ok('Advisor receives incoming_call_dispatch');
    else fail('Incoming call dispatch', JSON.stringify(incoming));
  } catch (err) {
    fail('Incoming call dispatch', String(err));
  }

  advisorSocket.emit('call_accepted', { sessionId });

  try {
    const ready = sessionReadyPromise ? await sessionReadyPromise : null;
    if (ready?.sessionId === sessionId && ready.livekitToken && ready.livekitUrl) {
      ok('Client receives session_ready with LiveKit token');
    } else {
      fail('session_ready event', JSON.stringify(ready));
    }
  } catch (err) {
    fail('session_ready event', String(err));
  }

  const lkToken = await req('GET', `/api/session/${sessionId}/livekit-token`, {
    cookie: clientCookie,
  });
  const token = (lkToken.body as { token?: string }).token;
  if (lkToken.status === 200 && token) ok('GET session livekit-token');
  else fail('GET session livekit-token', JSON.stringify(lkToken.body));

  const end = await req('POST', `/api/session/${sessionId}/end`, { cookie: clientCookie });
  if (end.status === 200 && (end.body as { status?: string }).status === 'completed') {
    ok('End session (escrow released)');
  } else {
    fail('End session', JSON.stringify(end.body));
  }

  const balAfter = await req('GET', '/api/wallet/balance', { cookie: clientCookie });
  const afterCoins = (balAfter.body as { wallet?: { coinBalance?: number } }).wallet?.coinBalance ?? -1;
  if (afterCoins === coins - 10) ok('Client balance after session');
  else fail('Client balance after session', JSON.stringify(balAfter.body));

  const advisorBal = await req('GET', '/api/wallet/balance', { cookie: advisorCookie });
  const advisorEarned =
    (advisorBal.body as { wallet?: { withdrawableBalance?: number } }).wallet?.withdrawableBalance ?? 0;
  if (advisorEarned === 10) ok('Advisor earnings after session');
  else fail('Advisor earnings after session', JSON.stringify(advisorBal.body));

  const advisorTx = await req('GET', '/api/wallet/transactions', { cookie: advisorCookie });
  const advisorTransactions =
    (advisorTx.body as { transactions?: { type?: string; amountCoins?: number }[] }).transactions ?? [];
  const releaseTx = advisorTransactions.find((tx) => tx.type === 'escrow_release' && tx.amountCoins === 10);
  if (releaseTx) ok('Advisor sees escrow_release in transaction history');
  else fail('Advisor transaction history', JSON.stringify(advisorTx.body));

  const withdraw = await req('POST', '/api/wallet/withdraw', {
    cookie: advisorCookie,
    body: { amountCoins: 10 },
  });
  const withdrawBody = withdraw.body as {
    netPayoutCoins?: number;
    platformFeeCoins?: number;
    feePercent?: number;
  };
  if (withdraw.status === 200 && withdrawBody.netPayoutCoins === 9 && withdrawBody.platformFeeCoins === 1) {
    ok('Advisor withdraws earnings (10% platform fee)');
  } else fail('Advisor withdraws earnings', JSON.stringify(withdraw.body));

  const advisorBalAfterWithdraw = await req('GET', '/api/wallet/balance', { cookie: advisorCookie });
  const afterWithdraw =
    (advisorBalAfterWithdraw.body as { wallet?: { withdrawableBalance?: number } }).wallet?.withdrawableBalance ?? -1;
  if (afterWithdraw === 0) ok('Advisor balance zero after withdrawal');
  else fail('Advisor balance after withdrawal', JSON.stringify(advisorBalAfterWithdraw.body));

  advisorSocket?.disconnect();
  clientSocket?.disconnect();

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
