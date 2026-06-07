# Frontend — Asistente con Tool Calling (Next.js)

UI de chat (Next.js 16 · Tailwind v4 · shadcn/ui) para el asistente. Hace `fetch` al backend
NestJS y muestra las respuestas con chips 🔧 de las herramientas que el modelo ejecutó.

## Setup

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                  # http://localhost:3000
```

> Necesita el backend corriendo (ver `../back`).

## Estructura

- `app/page.tsx` · `app/layout.tsx` — página y layout.
- `components/chat/ChatClient.tsx` — el chat (mensajes, input, loading, chips de tools, memoria).
- `lib/api.ts` — cliente del backend (`sendMessage`).
- `components/ui/` — componentes de shadcn/ui.
