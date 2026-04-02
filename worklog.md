---
Task ID: 5
Agent: Main
Task: Correções cirúrgicas — Headless architecture, API blindagem, legal pages, logo branding, GitHub push

Work Log:
- Deleted entire src/app/api/ folder (18 route.ts files) — zero internal API routes
- Deleted src/lib/db.ts (Prisma client) and src/lib/auth.ts (JWT middleware) — only used by removed routes
- Rewrote src/lib/api.ts: all fetch() calls now use `${API_BASE_URL}${endpoint}` (absolute URL)
  - Default: https://api-wallet.nextrustx.com/api/v1
  - Configurable via NEXT_PUBLIC_API_URL environment variable
  - Error message includes the actual API URL for easier debugging
- Created src/app/termos/page.tsx — server-side redirect to https://nextrustx.com/termos
- Created src/app/privacidade/page.tsx — server-side redirect to https://nextrustx.com/privacidade
- Updated Footer legal links from <Link> to <a href="https://nextrustx.com/..."> (external)
- Created src/components/layout/NeXPayLogo.tsx — reusable logo with two-color effect
  - "Ne" + "Pay" in white, "X" + "P" in neon-green (#4ADE80)
  - Sizes: sm (24px), md (28px), lg (36px), xl (80px)
  - Applied to: DashboardLayout header, AppSidebar, Footer, Auth form
- Replaced public/logo.png with official NeXPay green logo (331x311 PNG)
- Fixed auth card logo in page.tsx: applied two-color inline branding
- Verified: bun run lint = 0 errors, dev server 200 OK
- Pushed to GitHub master: commit aab4e00

Stage Summary:
- Frontend is now 100% headless — no server-side API routes
- All API calls route to external NexTrustX VPS backend
- /termos and /privacidade no longer 404
- Branding consistent with two-color NeXPay everywhere
- Logo updated to official green version
