# GreenHeart — Full E2E Test Guide

Use **3 browser windows** (1 normal + 2 incognito) so sessions stay separate.

## Prerequisites

```bash
# Terminal 1 — backend
cd backend && npm run db:migrate && npm run db:seed && npm run dev

# Terminal 2 — frontend (restart after .env changes)
cd frontend && npm run dev
```

**frontend/.env**

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

**Seeded admin:** `admin@greenheart.dev` / `AdminChangeMe123!`

---

## Phase 0 — Admin setup (Window 1)

| Step | Action |
|------|--------|
| 1 | Open http://localhost:5173/auth |
| 2 | Login as **admin** |
| 3 | You land on **/admin** |
| 4 | Click **Register Partner** → create partner doctor (email, name, password) |
| 5 | Note partner credentials |

---

## Phase 1 — Doctor applies (Window 2)

| Step | Action |
|------|--------|
| 1 | Open http://localhost:5173/auth/advisor-apply |
| 2 | Fill application (name, email, password, bio) → **Submit** |
| 3 | Redirected to **/advisor** with **Under review** banner |
| 4 | Online toggle is **disabled** (not verified yet) |

---

## Phase 2 — Partner verifies doctor (Window 3)

| Step | Action |
|------|--------|
| 1 | Login as **partner doctor** → **/partner** |
| 2 | See applicant in queue → **Start Interview** |
| 3 | Both join **/verification/:id** video room |
| 4 | Partner clicks **Pass / Verify** |
| 5 | Applicant status becomes **verified** (Window 2 refresh advisor page) |

**Shortcut (skip video):** Admin can force-verify on **/admin** → verification overrides → ✓ icon.

---

## Phase 3 — Patient registers & buys coins (Window 1)

| Step | Action |
|------|--------|
| 1 | Logout admin → **/auth** → Sign up as **patient** |
| 2 | Go to **/wallet** |
| 3 | Select bundle → **Buy coins (sandbox)** |
| 4 | Balance shows coins (e.g. 20) |

---

## Phase 4 — Discovery & call (Windows 1 + 2)

**Window 2 — Verified advisor**

| Step | Action |
|------|--------|
| 1 | **/advisor** → wait for **Live** indicator (green) in header |
| 2 | Toggle **Online** ON |

**Window 1 — Patient**

| Step | Action |
|------|--------|
| 1 | **/discover** → search e.g. "anxiety sleep" |
| 2 | Find **online** advisor → click **Connect** |
| 3 | **Calling advisor…** overlay appears |

**Window 2 — Advisor**

| Step | Action |
|------|--------|
| 1 | **Incoming call** screen → **Accept** |

**Both**

| Step | Action |
|------|--------|
| 1 | Redirected to **/consultation** video room |
| 2 | End session → patient balance reduced, advisor earns coins |

---

## Automated tests (optional)

```bash
cd backend && npm run test:smoke && npm run test:smoke:m5 && npm run test:smoke:m6 && npm run test:functional
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Socket not connected | Restart frontend; check `VITE_SOCKET_URL=http://localhost:4000` |
| Can't go online | Must be **verified** + **Live** indicator green |
| Connect disabled | Advisor offline — toggle online in Window 2 |
| Insufficient coins | Buy coins on **/wallet** first |
| No search results | Advisor must be **verified**; try semantic search |
| Video fails | Check LiveKit keys in `backend/.env` |
