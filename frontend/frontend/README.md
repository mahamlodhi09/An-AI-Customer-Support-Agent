# Storefront Admin (frontend)

A React + TypeScript admin console for your AI-store backend — Products,
Customers, Orders, Refunds, and Support Tickets, all in one place instead of
Postman. Dark purple/blue theme by default, with a light mode toggle (top
right) that's remembered between visits.

## 1. Install and run

```powershell
cd D:\AI-store
```

Put this `frontend` folder here, as a sibling of `backend`, so you end up
with `D:\AI-store\frontend` and `D:\AI-store\backend`.

```powershell
cd frontend
npm install
npm run dev
```

It'll start at **http://localhost:5173** — open that in your browser.

## 2. Enable CORS on your NestJS backend (required)

Browsers block a webpage on one origin (`localhost:5173`) from calling an
API on a different origin (`localhost:3000`) unless the API explicitly
allows it. This is called **CORS** (Cross-Origin Resource Sharing), and
without it every request from this frontend will fail with a CORS error in
the browser console, even though the backend itself is running fine.

Open `backend/src/main.ts` and add one line:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // add this line
  await app.listen(3000);
}
```

Restart your NestJS server (`Ctrl+C`, then `npm run start`) after adding
this. `enableCors()` with no arguments allows requests from any origin,
which is fine for local development — you'd lock this down to a specific
origin before ever deploying this for real.

## 3. Pointing at a different backend URL

The frontend reads the API URL from `frontend/.env`:

```
VITE_API_URL=http://localhost:3000
```

Change this if your backend runs on a different port, then restart
`npm run dev` (Vite only reads `.env` on startup).

## What's included

- **Dashboard** — live counts (products, customers, orders, pending
  refunds, open tickets), an orders-by-status chart, and a recent orders
  list.
- **Products** — full CRUD with search.
- **Customers** — full CRUD with search.
- **Orders** — create an order by picking a customer and adding multiple
  products with quantities; list view with totals; a detail page showing
  the full nested order (items, product info, customer info), with quick
  links to file a refund or open a support ticket for that order. Orders
  can't be edited or deleted from here because your backend doesn't expose
  those endpoints (by design — orders are immutable once placed).
- **Refunds** — file a refund against an order; approve or reject pending
  ones inline.
- **Support tickets** — open a ticket for a customer, optionally linked to
  an order; change its status inline.

## Notes on the code

- `src/api/` — one file per resource, each a thin wrapper around `fetch`
  calling your NestJS endpoints. `src/api/client.ts` is the shared request
  helper (adds JSON headers, parses errors from NestJS's validation
  responses).
- `src/context/ThemeContext.tsx` — light/dark theme, persisted to
  `localStorage`, applied via a `data-theme` attribute read by the CSS
  variables in `src/index.css`.
- `src/components/` — shared UI pieces (buttons, modals, tables, form
  fields, toasts) used across every page.
- `src/pages/` — one file per screen, matching your backend's modules
  1:1 (Products, Customers, Orders, Refunds, SupportTickets).

No backend code was touched — this only talks to your existing API over
HTTP, exactly like Postman did.
