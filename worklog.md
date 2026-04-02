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

---
## Task ID: 6 — enterprise-modals
### Work Task
Rebuild Deposit and Withdraw modals to enterprise level — remove all mock data, add NowPayments crypto with network selection, multi-tab withdrawals, real PIX QR codes, and dynamic SEPA data.

### Work Summary
**File modified:** `src/app/page.tsx` (Dashboard function component, lines ~227-965)

**Changes made:**

1. **New imports added:** `RadioGroup`, `RadioGroupItem` from shadcn/ui, `Coins`, `Globe` from lucide-react

2. **New state variables added:**
   - `selectedCrypto` / `usdtNetwork` — replaces old `cryptoNetwork` for deposit
   - `withdrawTab` — controls multi-tab withdraw modal ('pix' | 'sepa' | 'crypto')
   - `withdrawIban`, `withdrawHolderName`, `withdrawCryptoAddress`, `withdrawCryptoCurrency`, `withdrawNetwork` — SEPA and crypto withdraw fields

3. **Deposit Modal — Crypto Tab (NowPayments):**
   - Professional radio-style currency buttons: BTC (orange), ETH (purple), LTC (gray), XMR (orange), USDT (green)
   - USDT network selection via RadioGroup: TRC-20 (Tron), BEP-20 (BSC), ERC-20 (Ethereum)
   - `getCryptoCurrencyCode()` helper maps selections to API codes: BTC→"BTC", ETH→"ETH", USDT TRC-20→"USDTRC20", USDT BEP-20→"USDTBEP20", USDT ERC-20→"USDT_ERC20"
   - "Gerar Carteira" button calls `api.depositCrypto(currencyCode)`
   - Result renders: network name, wallet address with copy, min deposit, network-specific warning

4. **Deposit Modal — PIX Tab (Real QR Code):**
   - Replaced placeholder QrCode icon with real `<img>` from API base64 data
   - Handles both `data:image/...` prefixed and raw base64 strings

5. **Deposit Modal — SEPA Tab (Dynamic Fields):**
   - Changed `sepaResult` type from `{ reference: string }` to `Record<string, string>`
   - Renders all API response fields dynamically with copy buttons
   - Removed all hardcoded bank data (NexTrustX Bank, DE89 IBAN, NEXADEFF BIC)

6. **Withdraw Modal — Multi-Tab:**
   - PIX tab: Valor (BRL), Chave PIX, Saldo display → `api.withdrawFiat(amount, 'BRL', pixKey)`
   - SEPA tab: Valor (EUR), IBAN, Nome do Titular → `api.withdrawFiat(amount, 'EUR', iban)`
   - Crypto tab: Currency selector (BTC/ETH/LTC/XMR/USDT), USDT network RadioGroup, Valor, Endereço da Carteira → `api.withdrawCrypto(amount, currency, address, network)`

7. **Backdrop transparency:** All modals changed from `bg-black/80` to `bg-black/60 backdrop-blur-sm`

8. **Error handling:** All handlers use proper `try/catch (err) { console.error(err); }` pattern

9. **Lint:** `bun run lint` passes with 0 errors. Dev server compiles successfully.

---
## Task ID: 2
### Work Task
Rebuild B2B Payment Links module, Public Checkout page, Security Hub, and Analytical Transactions panel at Stripe/Binance enterprise level.

### Work Summary

**4 files written — zero lint errors, all pages 200 OK:**

1. **`/src/app/dashboard/payment-links/page.tsx`** — Stripe-level payment links management
   - Page header with title "Links de Pagamento", subtitle, "+ Novo Link" green button, and refresh button
   - Create Link Modal (Dialog): Título, Descrição, Moeda (BRL/EUR/USDT via Select), Valor fields
   - Submit calls `api.createCheckoutLink()` with proper error handling
   - Data table with columns: Título, Moeda, Valor (Intl.NumberFormat), Status (Badge: active=green, expired=gray, paid=cyan), Criado em, Ações
   - "Copiar URL" copies `window.location.origin + '/c/' + link.id` with CheckCircle2 feedback
   - External link button to open checkout in new tab
   - Loading state with skeleton rows, empty state with Link2 icon
   - Cancel-safe async fetching with useEffect cleanup

2. **`/src/app/c/[id]/page.tsx`** — Public checkout page (no sidebar, no auth)
   - Standalone page using `useParams()` to get checkout ID
   - Three states: loading (spinner), error ("Link inválido ou expirado"), success (receipt card)
   - Luxurious Stripe-inspired receipt card on `bg-[#fafafa]` with max-w-lg
   - NeXPay logo, product title, description, amount (text-4xl formatted)
   - PIX QR Code rendered from `data.pix_code` base64 via `<img>` tag
   - Dashed border placeholder with QrCode icon when no pix_code
   - Copy-paste PIX code in readonly input with "Copiar" button
   - Footer: "Pagamento seguro via NeXPay • Powered by NexTrustX" with Shield icon

3. **`/src/app/dashboard/security/page.tsx`** — Security hub with 3 cards in grid layout
   - Card 1 (Alterar Senha): Current/new/confirm password inputs with show/hide toggles, validation (min 6 chars, match), `api.changePassword()`, success/error feedback
   - Card 2 (Autenticação 2FA): Dynamic UI based on `user.two_factor_enabled`
     - If active: green "2FA Ativo" badge, "Desativar 2FA" button, InputOTP for 6-digit code, `api.disable2FA()`
     - If inactive: "Ativar Google Authenticator" button, `api.generate2FA()` → QR code + secret with copy, InputOTP verification, `api.verify2FA()`
   - Card 3 (Preferências): Dark/Light toggle via `useTheme()`, support contact info (WhatsApp, Telegram, Email)
   - Uses `useAuth()` for user state and `refreshUser()` after 2FA changes

4. **`/src/app/dashboard/transactions/page.tsx`** — Analytical transaction panel
   - 3 summary cards (grid grid-cols-1 md:grid-cols-3): Entradas (green), Saídas (red), Volume Swap (cyan)
   - Advanced filters row: Tipo (Select), Moeda (Select), Date picker (Calendar/Popover), Clear button, result count
   - Client-side filtering via useMemo on allTransactions
   - Data table with: Data (dd/mm/yy HH:mm), Tipo (colored badge), Moeda, Valor (formatted), Status (colored badge)
   - Loading state (8 skeleton rows), empty state with Clock icon, max-h-[60vh] scroll
   - Summary calculated by iterating transactions where status='completed'

**All files start with `'use client';`** • Portuguese (Brazilian) UI text • Lucide icons • Dark theme styling with glass-strong classes • Only real API responses rendered (no mock data)

**Verification:**
- `bun run lint` → 0 errors
- Dev server → all pages return 200 OK
- curl tests pass for /dashboard/payment-links, /dashboard/transactions, /dashboard/security
