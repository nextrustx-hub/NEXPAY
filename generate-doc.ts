import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  TableOfContents, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak
} from "docx";
import * as fs from "fs";

// ─── Midnight Code Color Palette ───
const colors = {
  primary: "020617",     // Titles
  body: "1E293B",        // Body Text
  secondary: "64748B",   // Subtitles
  accent: "94A3B8",      // UI/Decor
  tableBg: "F8FAFC",     // Table/Background
  white: "FFFFFF",
  coverAccent: "0F172A",
  lightBorder: "CBD5E1",
};

// ─── Shared Borders ───
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.lightBorder };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// ─── Helper: Create body paragraph ───
function bodyPara(text: string, opts: any = {}) {
  return new Paragraph({
    spacing: { line: 250, after: 120, ...opts.spacing },
    alignment: AlignmentType.LEFT,
    ...opts,
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 22,
        color: colors.body,
        ...(opts.runOpts || {}),
      }),
    ],
  });
}

// ─── Helper: Bold inline text ───
function boldRun(text: string) {
  return new TextRun({ text, font: "Calibri", size: 22, color: colors.body, bold: true });
}

function normalRun(text: string) {
  return new TextRun({ text, font: "Calibri", size: 22, color: colors.body });
}

function accentRun(text: string) {
  return new TextRun({ text, font: "Calibri", size: 22, color: colors.secondary });
}

function codeRun(text: string) {
  return new TextRun({ text, font: "Courier New", size: 20, color: colors.primary });
}

// ─── Helper: Create a header cell ───
function headerCell(text: string, width: number) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 250 },
        children: [new TextRun({ text, bold: true, font: "Calibri", size: 22, color: colors.primary })],
      }),
    ],
  });
}

// ─── Helper: Create a data cell ───
function dataCell(text: string, width: number, opts: any = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    ...opts,
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.CENTER,
        spacing: { line: 250 },
        children: [new TextRun({ text, font: "Calibri", size: 22, color: colors.body })],
      }),
    ],
  });
}

// ─── Helper: Create a data cell with multiple runs ───
function dataCellMulti(runs: any[], width: number, opts: any = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    ...opts,
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.CENTER,
        spacing: { line: 250 },
        children: runs,
      }),
    ],
  });
}

// ─── Helper: Table caption ───
function tableCaption(text: string) {
  return new Paragraph({
    spacing: { line: 250, before: 60, after: 200 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: "Calibri", size: 18, color: colors.secondary, italics: true })],
  });
}

// ─── Helper: Spacer paragraph ───
function spacer(twips: number = 200) {
  return new Paragraph({ spacing: { before: twips } });
}

// ─── Helper: Bullet list paragraph ───
function bulletItem(text: string, ref: string, level: number = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { line: 250, after: 60 },
    children: [normalRun(text)],
  });
}

function bulletItemMulti(runs: any[], ref: string, level: number = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { line: 250, after: 60 },
    children: runs,
  });
}

// ─── Helper: Numbered list paragraph ───
function numberedItem(text: string, ref: string, level: number = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { line: 250, after: 60 },
    children: [normalRun(text)],
  });
}

// ─── Helper: Numbered item with multiple runs ───
function numberedItemMulti(runs: any[], ref: string, level: number = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { line: 250, after: 60 },
    children: runs,
  });
}

// ─── Heading 3 paragraph (sub-section) ───
function h3(text: string) {
  return new Paragraph({
    spacing: { line: 250, before: 300, after: 150 },
    children: [new TextRun({ text, font: "Times New Roman", size: 24, bold: true, color: colors.primary })],
  });
}

// ─── Separator line ───
function separator() {
  const sepBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.accent };
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: sepBorder },
    children: [new TextRun("")],
  });
}

// ─── Current date ───
const today = new Date();
const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

// ════════════════════════════════════════════════════════════════
//  NUMBERING CONFIGURATION — unique references for each section
// ════════════════════════════════════════════════════════════════
function bulletConfig(ref: string) {
  return {
    reference: ref,
    levels: [{
      level: 0,
      format: LevelFormat.BULLET,
      text: "\u2022",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  };
}

function numberedConfig(ref: string) {
  return {
    reference: ref,
    levels: [{
      level: 0,
      format: LevelFormat.DECIMAL,
      text: "%1.",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  };
}

const numberingConfig = [
  bulletConfig("bullets-overview"),
  bulletConfig("bullets-auth-flow"),
  bulletConfig("bullets-landing"),
  bulletConfig("bullets-auth"),
  bulletConfig("bullets-dashboard"),
  bulletConfig("bullets-deposit"),
  bulletConfig("bullets-withdraw"),
  bulletConfig("bullets-exchange"),
  bulletConfig("bullets-transactions"),
  bulletConfig("bullets-payment-links"),
  bulletConfig("bullets-developers"),
  bulletConfig("bullets-2fa"),
  bulletConfig("bullets-kyc"),
  bulletConfig("bullets-sidebar"),
  bulletConfig("bullets-error"),
  bulletConfig("bullets-security"),
  bulletConfig("bullets-prod-notes"),
  bulletConfig("bullets-deploy-db"),
  bulletConfig("bullets-features-4-1"),
  bulletConfig("bullets-features-4-2"),
  bulletConfig("bullets-features-4-3"),
  bulletConfig("bullets-features-4-4"),
  bulletConfig("bullets-features-4-5"),
  bulletConfig("bullets-features-4-6"),
  bulletConfig("bullets-features-4-7"),
  bulletConfig("bullets-features-4-8"),
  bulletConfig("bullets-features-4-9"),
  bulletConfig("bullets-features-4-10"),
  bulletConfig("bullets-features-4-11"),
  bulletConfig("bullets-features-4-12"),
  numberedConfig("numbered-deploy-steps"),
  numberedConfig("numbered-deploy-config"),
  numberedConfig("numbered-deploy-prod"),
];

// ════════════════════════════════════════════════════════════════
//  COVER PAGE SECTION
// ════════════════════════════════════════════════════════════════
const coverSection = {
  properties: {
    page: {
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      size: { width: 11906, height: 16838 },
    },
    titlePage: true,
  },
  children: [
    // Top accent bar
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun("")],
    }),
    // Push content down ~4000 twips from top
    new Paragraph({ spacing: { before: 4500 } }),
    // Decorative line
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", font: "Calibri", size: 20, color: colors.accent })],
    }),
    // Main Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "NeXPay", font: "Times New Roman", size: 72, bold: true, color: colors.primary })],
    }),
    // Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "Documentação Técnica", font: "Times New Roman", size: 40, color: colors.primary })],
    }),
    // Tagline
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [new TextRun({ text: "Carteira Digital Multi-Moeda", font: "Calibri", size: 26, color: colors.secondary, italics: true })],
    }),
    // Decorative line
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", font: "Calibri", size: 20, color: colors.accent })],
    }),
    // Version
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "Versão v1.0.0", font: "Calibri", size: 22, color: colors.secondary })],
    }),
    // Date
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: dateStr, font: "Calibri", size: 22, color: colors.secondary })],
    }),
    // Organization
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [new TextRun({ text: "NexTrustX", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
    }),
  ],
};

// ════════════════════════════════════════════════════════════════
//  TOC SECTION
// ════════════════════════════════════════════════════════════════
const tocSection = {
  properties: {
    page: {
      margin: { top: 1800, bottom: 1440, left: 1440, right: 1440 },
    },
  },
  headers: {
    default: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "NeXPay — Documentação Técnica", font: "Calibri", size: 18, color: colors.accent })],
        }),
      ],
    }),
  },
  footers: {
    default: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Página ", font: "Calibri", size: 18, color: colors.accent }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: colors.accent }),
            new TextRun({ text: " de ", font: "Calibri", size: 18, color: colors.accent }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 18, color: colors.accent }),
          ],
        }),
      ],
    }),
  },
  children: [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 300 },
      children: [new TextRun({ text: "Sumário", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
    }),
    new TableOfContents("Sumário", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: "Nota: Este Sumário é gerado via field codes. Para garantir a precisão dos números de página após a edição, clique com o botão direito no Sumário e selecione \"Atualizar Campo\".",
          font: "Calibri",
          size: 18,
          color: colors.accent,
          italics: true,
        }),
      ],
    }),
  ],
};

// ════════════════════════════════════════════════════════════════
//  MAIN CONTENT SECTION — shared header/footer factory
// ════════════════════════════════════════════════════════════════
function mainHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "NeXPay — Documentação Técnica", font: "Calibri", size: 18, color: colors.accent })],
      }),
    ],
  });
}

function mainFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Página ", font: "Calibri", size: 18, color: colors.accent }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: colors.accent }),
          new TextRun({ text: " de ", font: "Calibri", size: 18, color: colors.accent }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 18, color: colors.accent }),
        ],
      }),
    ],
  });
}

function mainPage() {
  return {
    margin: { top: 1800, bottom: 1440, left: 1440, right: 1440 },
  };
}

// ════════════════════════════════════════════════════════════════
//  SECTION 1 — Visão Geral do Projeto
// ════════════════════════════════════════════════════════════════
const section1Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "1. Visão Geral do Projeto", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),
  bodyPara("NeXPay é uma plataforma de carteira digital multi-moeda desenvolvida pela NexTrustX, projetada para oferecer uma experiência completa de gestão financeira digital. A aplicação suporta operações em quatro moedas distintas:"),
  bulletItem("BRL (Real Brasileiro) — moeda fiduciária principal para o mercado nacional", "bullets-overview"),
  bulletItem("EUR (Euro) — suporte a transferências internacionais via SEPA", "bullets-overview"),
  bulletItem("USDT (Tether) — stablecoin para operações com criptomoedas", "bullets-overview"),
  bulletItem("BTC (Bitcoin) — principal criptomoeda do mercado", "bullets-overview"),
  bodyPara("A plataforma implementa um sistema de contas em dois tiers diferenciados:"),
  bulletItemMulti([boldRun("WHITE: "), normalRun("Contas verificadas com exigência de CPF e processo de KYC (Know Your Customer) obrigatório. Ideal para usuários que buscam transparência e conformidade regulatória.")], "bullets-overview"),
  bulletItemMulti([boldRun("BLACK: "), normalRun("Contas anônimas identificadas por alias, sem exigência de KYC. Direcionadas para usuários que priorizam privacidade, com limites estendidos de operação.")], "bullets-overview"),
  bodyPara("O sistema integra depósitos via PIX e SEPA, conversão entre moedas (exchange), saques, links de pagamento B2B, e um painel para desenvolvedores com geração de API Keys e configuração de webhooks. A autenticação é realizada via JWT com suporte opcional a 2FA (Two-Factor Authentication) via TOTP."),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 2 — Stack Tecnológica
// ════════════════════════════════════════════════════════════════
const techStackData = [
  ["Next.js 16", "16.x", "Framework React com App Router"],
  ["TypeScript", "5.x", "Tipagem estática"],
  ["Tailwind CSS 4", "4.x", "Framework de estilos utilitário"],
  ["shadcn/ui", "latest", "Biblioteca de componentes UI"],
  ["Prisma ORM", "6.x", "ORM para banco de dados (SQLite)"],
  ["Framer Motion", "12.x", "Animações e transições"],
  ["Zustand", "5.x", "Gerenciamento de estado no cliente"],
  ["jsonwebtoken", "9.x", "Autenticação JWT"],
  ["bcryptjs", "3.x", "Hashing de senhas"],
  ["Sonner", "2.x", "Notificações toast"],
  ["TanStack Table", "8.x", "Tabelas de dados profissionais"],
  ["TanStack Query", "5.x", "Gerenciamento de estado no servidor"],
];

const techStackRows = [
  new TableRow({
    tableHeader: true,
    children: [
      headerCell("Tecnologia", 3000),
      headerCell("Versão", 1800),
      headerCell("Finalidade", 4560),
    ],
  }),
  ...techStackData.map(([tech, ver, purpose]) =>
    new TableRow({
      children: [
        dataCell(tech, 3000),
        dataCell(ver, 1800),
        dataCell(purpose, 4560),
      ],
    })
  ),
];

const section2Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "2. Stack Tecnológica", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),
  bodyPara("A tabela abaixo apresenta todas as tecnologias utilizadas no desenvolvimento do NeXPay, com suas respectivas versões e finalidades no projeto:"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [3000, 1800, 4560],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: techStackRows,
  }),
  tableCaption("Tabela 1 — Stack tecnológica do NeXPay"),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 3 — Arquitetura da Aplicação
// ════════════════════════════════════════════════════════════════
const directoryLines = [
  "src/",
  "├── app/",
  "│   ├── page.tsx          (Landing + Auth + Dashboard)",
  "│   ├── layout.tsx        (Root layout)",
  "│   ├── globals.css       (Estilos globais)",
  "│   └── dashboard/",
  "│       ├── transactions/page.tsx",
  "│       ├── developers/page.tsx",
  "│       └── payment-links/page.tsx",
  "├── components/",
  "│   ├── layout/           (Navigation, Sidebar, Footer, etc.)",
  "│   ├── settings/         (SecuritySettings)",
  "│   └── ui/               (47 componentes shadcn/ui)",
  "├── contexts/",
  "│   └── AuthContext.tsx    (Auth provider)",
  "├── lib/",
  "│   ├── api.ts            (API service singleton)",
  "│   ├── db.ts             (Prisma client)",
  "│   ├── cookies.ts        (Cookie utilities)",
  "│   └── jwt.ts            (JWT utilities)",
  "├── types/",
  "│   └── auth.ts           (Interfaces TypeScript)",
  "prisma/",
  "├── schema.prisma         (Modelos do banco de dados)",
  "public/",
  "├── logo.png",
  "└── logo.svg",
];

const section3Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "3. Arquitetura da Aplicação", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),

  // 3.1 Estrutura de Diretórios
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "3.1 Estrutura de Diretórios", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("A estrutura de diretórios do projeto segue as convenções do Next.js 16 com App Router, organizando o código de forma modular e escalável:"),
  ...directoryLines.map(
    (line) =>
      new Paragraph({
        spacing: { line: 250, after: 20 },
        children: [new TextRun({ text: line, font: "Courier New", size: 20, color: colors.body })],
      })
  ),

  // 3.2 Fluxo de Autenticação
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "3.2 Fluxo de Autenticação", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O sistema de autenticação do NeXPay segue um fluxo baseado em JWT (JSON Web Tokens) com as seguintes etapas:"),
  numberedItemMulti([boldRun("Login / Registro: "), normalRun("O usuário submete suas credenciais (email + senha) via componente AuthForm para a API route correspondente.")], "numbered-deploy-config"),
  numberedItemMulti([boldRun("API Route: "), normalRun("A rota processa a requisição, valida as credenciais, gera o hash bcrypt se necessário e retorna um token JWT assinado.")], "numbered-deploy-config"),
  numberedItemMulti([boldRun("Cookie Storage: "), normalRun("O token JWT é armazenado em cookies do navegador para persistência de sessão.")], "numbered-deploy-config"),
  numberedItemMulti([boldRun("Hydration via AuthContext: "), normalRun("Ao montar, o AuthContext consome o endpoint /api/auth/me para restaurar a sessão do usuário.")], "numbered-deploy-config"),
  numberedItemMulti([boldRun("Guard 401: "), normalRun("Qualquer resposta 401 das APIs remove automaticamente o token e redireciona o usuário para /?auth=login.")], "numbered-deploy-config"),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 4 — Funcionalidades Implementadas
// ════════════════════════════════════════════════════════════════
const section4Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "4. Funcionalidades Implementadas", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),

  // 4.1 Landing Page
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.1 Landing Page", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("A landing page é o primeiro ponto de contato do usuário com a plataforma, apresentada quando não autenticado. Suas principais características incluem:"),
  bulletItem("Hero section com animações fluidas via Framer Motion, criando uma experiência visual impactante", "bullets-features-4-1"),
  bulletItem("Cards de funcionalidades destacando os pilares do NeXPay: Segurança, Transações Rápidas, Suporte 24/7 e Swap de moedas", "bullets-features-4-1"),
  bulletItem("Botões CTA (Call to Action) para Login e Criar Conta, direcionando para o fluxo de autenticação", "bullets-features-4-1"),
  bulletItem("Design responsivo com tema escuro e efeitos de glassmorphism", "bullets-features-4-1"),

  // 4.2 Sistema de Autenticação
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.2 Sistema de Autenticação", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O módulo de autenticação centraliza login e registro em um único componente reutilizável (AuthForm), com suporte aos dois tiers de conta:"),
  bulletItem("Login e Registro integrados no mesmo componente com transição visual suave", "bullets-features-4-2"),
  bulletItem("Contas WHITE exigem CPF para registro, com validação de formato (000.000.000-00)", "bullets-features-4-2"),
  bulletItem("Contas BLACK utilizam alias anônimo, sem exigência de CPF ou KYC", "bullets-features-4-2"),
  bulletItem("Toggle visual entre WHITE e BLACK com componente Switch, alterando dinamicamente os campos do formulário", "bullets-features-4-2"),
  bulletItem("Validação de input em tempo real no frontend e servidor", "bullets-features-4-2"),

  // 4.3 Dashboard Principal
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.3 Dashboard Principal", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O dashboard é a tela principal após autenticação, apresentando um resumo financeiro completo do usuário:"),
  bulletItem("Header de boas-vindas com nome do usuário e badge visual indicando o tier da conta (WHITE/BLACK)", "bullets-features-4-3"),
  bulletItem("Card \"Saldo Fiduciário\" agregando BRL e EUR com ícone verde", "bullets-features-4-3"),
  bulletItem("Card \"NeXWallet Crypto\" agregando USDT e BTC com ícone laranja", "bullets-features-4-3"),
  bulletItem("Botões de ação: Depositar, Sacar e Converter Moedas", "bullets-features-4-3"),
  bulletItem("Preview das 5 transações mais recentes com link para o extrato completo", "bullets-features-4-3"),

  // 4.4 Modal de Depósito
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.4 Modal de Depósito (Omni-Channel)", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O modal de depósito implementa um sistema omni-channel com três métodos de pagamento:"),
  bulletItemMulti([boldRun("PIX: "), normalRun("Geração de QR Code e código Copia e Cola para depósitos em BRL")], "bullets-features-4-4"),
  bulletItemMulti([boldRun("SEPA: "), normalRun("Exibição de dados bancários internacionais (IBAN, BIC, Referência) para depósitos em EUR")], "bullets-features-4-4"),
  bulletItemMulti([boldRun("Crypto: "), normalRun("Endereços de wallet para USDT (TRC-20) e BTC via integração NowPayments")], "bullets-features-4-4"),
  bodyPara("Cada canal fornece feedback visual inline (ícone de checkmark verde) após a geração dos dados de depósito, sem dependência de toasts."),

  // 4.5 Modal de Saque
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.5 Modal de Saque", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O modal de saque permite retiradas via PIX com as seguintes funcionalidades:"),
  bulletItem("Campo de valor com saldo disponível exibido em tempo real", "bullets-features-4-5"),
  bulletItem("Campo para chave PIX (CPF, telefone, e-mail ou chave aleatória)", "bullets-features-4-5"),
  bulletItem("Validação de saldo suficiente antes da submissão", "bullets-features-4-5"),
  bulletItem("Feedback visual inline após confirmação do saque", "bullets-features-4-5"),

  // 4.6 Exchange
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.6 Exchange (Conversão de Moedas)", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("A página dedicada de exchange (/exchange) oferece uma interface profissional inspirada na Binance para conversão entre moedas:"),
  bulletItem("Blocos \"Pagar\" e \"Receber\" com seletores de moeda (BRL, EUR, USDT, BTC)", "bullets-features-4-6"),
  bulletItem("Botão \"Máx\" para preencher automaticamente o saldo total disponível", "bullets-features-4-6"),
  bulletItem("Botão circular de swap entre as moedas de origem e destino", "bullets-features-4-6"),
  bulletItem("Botão \"Converter\" com exibição dinâmica do par (ex: \"Converter BRL → USDT\")", "bullets-features-4-6"),
  bulletItem("Taxa de conversão de 0.5% exibida abaixo do botão de conversão", "bullets-features-4-6"),
  bulletItem("Visão geral de todos os saldos com links clicáveis para preencher valores", "bullets-features-4-6"),
  bulletItem("Animação de sucesso com spring animation ao concluir swap", "bullets-features-4-6"),

  // 4.7 Extrato de Transações
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.7 Extrato de Transações", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O extrato (/dashboard/transactions) apresenta o histórico completo de transações do usuário:"),
  bulletItem("Tabela profissional com 5 colunas: Data, Tipo, Moeda, Valor e Status", "bullets-features-4-7"),
  bulletItem("Badges coloridos por status: Concluído (verde), Pendente (amarelo), Falhou (vermelho)", "bullets-features-4-7"),
  bulletItem("Badges por tipo de transação: Depósito (verde), Saque (vermelho), Swap (ciano)", "bullets-features-4-7"),
  bulletItem("Scroll com altura máxima (70vh) para grandes volumes de dados", "bullets-features-4-7"),
  bulletItem("Loading state com 8 linhas skeleton animadas", "bullets-features-4-7"),
  bulletItem("Estado vazio com ícone Clock e mensagem \"Nenhuma transação encontrada\"", "bullets-features-4-7"),

  // 4.8 Links de Pagamento B2B
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.8 Links de Pagamento B2B", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O gerenciador de links de pagamento (/dashboard/payment-links) permite criar e gerenciar links de cobrança:"),
  bulletItem("Criação de links com título, descrição, moeda (BRL/EUR) e valor", "bullets-features-4-8"),
  bulletItem("Tabela profissional listando todos os links gerados com status (ativo, expirado, pago)", "bullets-features-4-8"),
  bulletItem("Botão \"Copiar Link\" com feedback visual de checkmark por 2 segundos", "bullets-features-4-8"),
  bulletItem("Página de checkout pública (/c/[id]) acessível sem autenticação", "bullets-features-4-8"),
  bulletItem("Design do checkout inspirado no Stripe, com QR Code PIX e código de pagamento", "bullets-features-4-8"),

  // 4.9 Painel Developers
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.9 Painel Developers", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O painel para desenvolvedores (/dashboard/developers) oferece ferramentas de integração:"),
  bulletItem("Geração de API Keys com prefixo nxp_live_", "bullets-features-4-9"),
  bulletItem("Dialog de segurança ao gerar nova chave com aviso amarelo: \"Esta chave NÃO será exibida novamente. Guarde-a em local seguro.\"", "bullets-features-4-9"),
  bulletItem("Lista de chaves existentes com exibição mascarada (primeiros 12 + *** + últimos 4 caracteres)", "bullets-features-4-9"),
  bulletItem("Configuração de Webhook URL com salvamento em tempo real e feedback de sucesso", "bullets-features-4-9"),

  // 4.10 Segurança (2FA)
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.10 Segurança (2FA)", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O sistema de autenticação de dois fatores adiciona uma camada extra de segurança:"),
  bulletItem("Geração de QR Code TOTP para configuração em apps autenticadores (Google Authenticator, Authy)", "bullets-features-4-10"),
  bulletItem("Verificação com código de 6 dígitos para ativação", "bullets-features-4-10"),
  bulletItem("Opção de desabilitar 2FA com verificação de código", "bullets-features-4-10"),
  bulletItem("Componente integrado nas configurações de segurança da sidebar", "bullets-features-4-10"),

  // 4.11 KYC Banner
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.11 KYC Banner", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O banner de KYC alerta contas WHITE sobre a necessidade de verificação:"),
  bulletItem("Alerta amarelo exibido apenas para contas WHITE com status KYC pendente", "bullets-features-4-11"),
  bulletItem("Botão \"Verificar\" para iniciar o processo de KYC", "bullets-features-4-11"),
  bulletItem("Banner dismissable — o usuário pode fechá-lo temporariamente", "bullets-features-4-11"),
  bulletItem("Renderização condicional no layout principal, acima do dashboard", "bullets-features-4-11"),

  // 4.12 Sidebar Colapsável
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "4.12 Sidebar Colapsável", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("A sidebar de navegação utiliza o componente Sidebar do shadcn/ui com modo colapsável:"),
  bulletItem("Menu com ícones Lucide React para cada item de navegação", "bullets-features-4-12"),
  bulletItem("Dois grupos de navegação: \"Carteira\" (Dashboard, Extrato, Exchange) e \"Plataforma\" (Links de Pagamento, Developers, Segurança)", "bullets-features-4-12"),
  bulletItem("Footer com avatar, nome e e-mail do usuário, além de botão de Logout", "bullets-features-4-12"),
  bulletItem("Modo colapsado exibe apenas ícones, economizando espaço na tela", "bullets-features-4-12"),
  bulletItem("Detecção automática de rota ativa via usePathname()", "bullets-features-4-12"),
  bulletItem("Renderização condicional — apenas visível para usuários autenticados", "bullets-features-4-12"),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 5 — Conexões API
// ════════════════════════════════════════════════════════════════
const apiData = [
  ["POST", "/api/auth/login", "Login com email/senha", "Não"],
  ["POST", "/api/auth/register", "Registro (WHITE/BLACK)", "Não"],
  ["GET", "/api/auth/me", "Dados do usuário logado", "Sim"],
  ["POST", "/api/auth/2fa/generate", "Gerar QR Code 2FA", "Sim"],
  ["POST", "/api/auth/2fa/verify", "Verificar código 2FA", "Sim"],
  ["POST", "/api/auth/2fa/disable", "Desabilitar 2FA", "Sim"],
  ["GET", "/api/wallet/balance", "Saldos (BRL/EUR/USDT/BTC)", "Sim"],
  ["POST", "/api/wallet/deposit/fiat", "Depósito PIX/SEPA", "Sim"],
  ["POST", "/api/wallet/deposit/crypto", "Depósito USDT/BTC", "Sim"],
  ["POST", "/api/wallet/withdraw/fiat", "Saque via PIX", "Sim"],
  ["POST", "/api/wallet/swap", "Conversão de moedas", "Sim"],
  ["GET", "/api/transactions", "Lista de transações", "Sim"],
  ["POST", "/api/checkout/create", "Criar link de pagamento", "Sim"],
  ["GET", "/api/checkout/list", "Listar links criados", "Sim"],
  ["GET", "/api/checkout/[id]", "Detalhes do checkout", "Não"],
  ["POST", "/api/b2b/api-keys/generate", "Gerar API Key", "Sim"],
  ["GET", "/api/b2b/api-keys", "Listar API Keys", "Sim"],
  ["POST", "/api/b2b/webhooks/config", "Configurar webhook", "Sim"],
];

const apiRows = [
  new TableRow({
    tableHeader: true,
    children: [
      headerCell("Método", 1200),
      headerCell("Endpoint", 3160),
      headerCell("Descrição", 3560),
      headerCell("Autenticado", 1440),
    ],
  }),
  ...apiData.map(([method, endpoint, desc, auth]) =>
    new TableRow({
      children: [
        dataCell(method, 1200),
        dataCell(endpoint, 3160, { align: AlignmentType.LEFT }),
        dataCell(desc, 3560, { align: AlignmentType.LEFT }),
        dataCell(auth, 1440),
      ],
    })
  ),
];

const section5Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "5. Conexões API (src/lib/api.ts)", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),
  bodyPara("O arquivo src/lib/api.ts implementa um singleton de serviço API que centraliza todas as requisições HTTP do frontend. A tabela abaixo lista todos os endpoints disponíveis:"),

  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [1200, 3160, 3560, 1440],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: apiRows,
  }),
  tableCaption("Tabela 2 — Endpoints da API do NeXPay"),

  // Error Handling
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "5.1 Tratamento de Erros", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O serviço API implementa três camadas de tratamento de erros:"),
  bulletItemMulti([boldRun("401 Unauthorized: "), normalRun("Remove automaticamente o token JWT dos cookies e redireciona o usuário para a página de login (/?auth=login)")], "bullets-error"),
  bulletItemMulti([boldRun("Network Errors: "), normalRun("Exibe toast com mensagem \"Erro de conexão\" quando não há resposta do servidor (TypeError)")], "bullets-error"),
  bulletItemMulti([boldRun("API Errors: "), normalRun("Exibe toast com a mensagem de erro retornada pelo backend, extraindo de data.message ou error")], "bullets-error"),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 6 — Banco de Dados
// ════════════════════════════════════════════════════════════════
const section6Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "6. Banco de Dados (Prisma Schema)", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),

  // 6.1 Modelos
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "6.1 Modelos", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O schema Prisma define cinco modelos principais que formam a base de dados do NeXPay:"),

  // User model table
  h3("Modelo User"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [2600, 2200, 4560],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell("Campo", 2600), headerCell("Tipo", 2200), headerCell("Descrição", 4560)],
      }),
      ...([
        ["id", "String (UUID)", "Identificador único do usuário"],
        ["email", "String", "E-mail único do usuário"],
        ["password", "String", "Senha hasheada com bcrypt"],
        ["name", "String", "Nome completo ou alias"],
        ["cpf", "String?", "CPF (obrigatório para WHITE)"],
        ["role", "Enum", "WHITE ou BLACK"],
        ["kyc_status", "Enum", "PENDING, APPROVED ou REJECTED"],
        ["two_factor_enabled", "Boolean", "2FA ativado (default: false)"],
        ["two_factor_secret", "String?", "Segredo TOTP para 2FA"],
        ["webhook_url", "String?", "URL de webhook configurada"],
        ["createdAt", "DateTime", "Data de criação"],
        ["updatedAt", "DateTime", "Data de atualização"],
      ] as string[][]).map(([field, type, desc]) =>
        new TableRow({
          children: [
            dataCellMulti([codeRun(field)], 2600),
            dataCell(type, 2200),
            dataCell(desc, 4560, { align: AlignmentType.LEFT }),
          ],
        })
      ),
    ],
  }),
  tableCaption("Tabela 3 — Modelo User"),

  // Balance model table
  h3("Modelo Balance"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [2600, 2200, 4560],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell("Campo", 2600), headerCell("Tipo", 2200), headerCell("Descrição", 4560)],
      }),
      ...([
        ["id", "String (UUID)", "Identificador único"],
        ["userId", "String (FK)", "Referência ao usuário"],
        ["currency", "Enum", "BRL, EUR, USDT ou BTC"],
        ["amount", "Float", "Saldo disponível"],
        ["updatedAt", "DateTime", "Data de atualização"],
      ] as string[][]).map(([field, type, desc]) =>
        new TableRow({
          children: [
            dataCellMulti([codeRun(field)], 2600),
            dataCell(type, 2200),
            dataCell(desc, 4560, { align: AlignmentType.LEFT }),
          ],
        })
      ),
    ],
  }),
  tableCaption("Tabela 4 — Modelo Balance"),

  // Transaction model table
  h3("Modelo Transaction"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [2600, 2200, 4560],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell("Campo", 2600), headerCell("Tipo", 2200), headerCell("Descrição", 4560)],
      }),
      ...([
        ["id", "String (UUID)", "Identificador único"],
        ["userId", "String (FK)", "Referência ao usuário"],
        ["type", "Enum", "deposit, withdraw ou swap"],
        ["method", "String?", "PIX, SEPA, TRC-20, BTC"],
        ["currencyFrom", "String?", "Moeda de origem"],
        ["amountFrom", "Float?", "Valor de origem"],
        ["currencyTo", "String?", "Moeda de destino (swap)"],
        ["amountTo", "Float?", "Valor de destino (swap)"],
        ["pixKey", "String?", "Chave PIX (saque)"],
        ["status", "Enum", "pending, completed ou failed"],
        ["createdAt", "DateTime", "Data de criação"],
        ["updatedAt", "DateTime", "Data de atualização"],
      ] as string[][]).map(([field, type, desc]) =>
        new TableRow({
          children: [
            dataCellMulti([codeRun(field)], 2600),
            dataCell(type, 2200),
            dataCell(desc, 4560, { align: AlignmentType.LEFT }),
          ],
        })
      ),
    ],
  }),
  tableCaption("Tabela 5 — Modelo Transaction"),

  // CheckoutLink model table
  h3("Modelo CheckoutLink"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [2600, 2200, 4560],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell("Campo", 2600), headerCell("Tipo", 2200), headerCell("Descrição", 4560)],
      }),
      ...([
        ["id", "String (UUID)", "Identificador único"],
        ["userId", "String (FK)", "Referência ao usuário"],
        ["title", "String", "Título do link de pagamento"],
        ["description", "String", "Descrição do pagamento"],
        ["currency", "Enum", "BRL ou EUR"],
        ["amount", "Float", "Valor do pagamento"],
        ["status", "Enum", "active, expired ou paid"],
        ["paymentUrl", "String", "URL pública do checkout"],
        ["createdAt", "DateTime", "Data de criação"],
        ["updatedAt", "DateTime", "Data de atualização"],
      ] as string[][]).map(([field, type, desc]) =>
        new TableRow({
          children: [
            dataCellMulti([codeRun(field)], 2600),
            dataCell(type, 2200),
            dataCell(desc, 4560, { align: AlignmentType.LEFT }),
          ],
        })
      ),
    ],
  }),
  tableCaption("Tabela 6 — Modelo CheckoutLink"),

  // ApiKey model table
  h3("Modelo ApiKey"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [2600, 2200, 4560],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell("Campo", 2600), headerCell("Tipo", 2200), headerCell("Descrição", 4560)],
      }),
      ...([
        ["id", "String (UUID)", "Identificador único"],
        ["userId", "String (FK)", "Referência ao usuário"],
        ["key", "String (unique)", "Chave API com prefixo nxp_live_"],
        ["isActive", "Boolean", "Status de ativação"],
        ["createdAt", "DateTime", "Data de criação"],
      ] as string[][]).map(([field, type, desc]) =>
        new TableRow({
          children: [
            dataCellMulti([codeRun(field)], 2600),
            dataCell(type, 2200),
            dataCell(desc, 4560, { align: AlignmentType.LEFT }),
          ],
        })
      ),
    ],
  }),
  tableCaption("Tabela 7 — Modelo ApiKey"),

  // 6.2 Relações
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "6.2 Relações", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("O modelo de dados estabelece as seguintes relações um-para-muitos (1:N) a partir da entidade User:"),
  bulletItemMulti([boldRun("User → Balance: "), normalRun("Cada usuário pode possuir múltiplos saldos, um para cada moeda suportada (BRL, EUR, USDT, BTC)")], "bullets-deploy-db"),
  bulletItemMulti([boldRun("User → Transaction: "), normalRun("Cada usuário possui um histórico completo de transações (depósitos, saques e swaps)")], "bullets-deploy-db"),
  bulletItemMulti([boldRun("User → CheckoutLink: "), normalRun("Cada usuário pode criar múltiplos links de pagamento para cobranças B2B")], "bullets-deploy-db"),
  bulletItemMulti([boldRun("User → ApiKey: "), normalRun("Cada usuário pode gerar múltiplas chaves de API para integrações externas")], "bullets-deploy-db"),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 7 — Sistema de Tiers
// ════════════════════════════════════════════════════════════════
const tierData = [
  ["Registro", "Nome + CPF", "Alias anônimo"],
  ["KYC", "Obrigatório", "Não obrigatório"],
  ["Limites", "Padrão", "Estendidos"],
  ["Badges", "Verde neon", "Cinza premium"],
  ["Identidade", "Verificada", "Privada"],
];

const tierRows = [
  new TableRow({
    tableHeader: true,
    children: [
      headerCell("Feature", 3120),
      headerCell("WHITE", 3120),
      headerCell("BLACK", 3120),
    ],
  }),
  ...tierData.map(([feature, white, black]) =>
    new TableRow({
      children: [
        dataCellMulti([boldRun(feature)], 3120),
        dataCell(white, 3120),
        dataCell(black, 3120),
      ],
    })
  ),
];

const section7Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "7. Sistema de Tiers", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),
  bodyPara("O NeXPay implementa um sistema de dois tiers de conta que atendem diferentes perfis de usuários. A tabela abaixo resume as diferenças entre as contas WHITE e BLACK:"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [3120, 3120, 3120],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: tierRows,
  }),
  tableCaption("Tabela 8 — Comparativo entre tiers WHITE e BLACK"),
  bodyPara("A escolha do tier é feita no momento do registro via toggle visual no formulário de autenticação, e determina os campos obrigatórios, o processo de verificação e os limites operacionais da conta."),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 8 — Guia de Deploy — Vercel
// ════════════════════════════════════════════════════════════════
const envData = [
  ["DATABASE_URL", "URL do SQLite (para produção usar PostgreSQL/Turso)"],
  ["JWT_SECRET", "Chave secreta para assinatura de JWT tokens"],
  ["NEXT_PUBLIC_APP_URL", "URL pública da aplicação (ex: https://nexpay.vercel.app)"],
];

const envRows = [
  new TableRow({
    tableHeader: true,
    children: [
      headerCell("Variável", 3120),
      headerCell("Descrição", 6240),
    ],
  }),
  ...envData.map(([varName, desc]) =>
    new TableRow({
      children: [
        dataCellMulti([codeRun(varName)], 3120),
        dataCell(desc, 6240, { align: AlignmentType.LEFT }),
      ],
    })
  ),
];

const section8Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "8. Guia de Deploy — Vercel", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),

  // 8.1 Pré-requisitos
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "8.1 Pré-requisitos", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("Antes de iniciar o deploy, certifique-se de possuir:"),
  bulletItem("Conta ativa no Vercel (vercel.com)", "bullets-prod-notes"),
  bulletItem("Projeto versionado em um repositório GitHub", "bullets-prod-notes"),
  bulletItem("Bun ou Node.js instalado localmente para testes", "bullets-prod-notes"),

  // 8.2 Configuração
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "8.2 Configuração", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("Siga os passos abaixo para configurar o projeto no Vercel:"),
  numberedItem("Faça push do projeto para o repositório GitHub", "numbered-deploy-steps"),
  numberedItem("Acesse o painel do Vercel e clique em \"Add New Project\"", "numbered-deploy-steps"),
  numberedItem("Importe o repositório GitHub do NeXPay", "numbered-deploy-steps"),
  numberedItem("Configure as seguintes definições de build:", "numbered-deploy-steps"),
  bulletItemMulti([boldRun("Build Command: "), codeRun("next build")], "bullets-prod-notes", 0),
  bulletItemMulti([boldRun("Output Directory: "), codeRun(".next")], "bullets-prod-notes", 0),
  bulletItemMulti([boldRun("Install Command: "), codeRun("bun install")], "bullets-prod-notes", 0),

  // 8.3 Variáveis de Ambiente
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "8.3 Variáveis de Ambiente", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("Configure as seguintes variáveis de ambiente no painel do Vercel (Settings → Environment Variables):"),
  new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [3120, 6240],
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    rows: envRows,
  }),
  tableCaption("Tabela 9 — Variáveis de ambiente do NeXPay"),

  // 8.4 Deploy para Produção
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "8.4 Deploy para Produção", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("Execute os seguintes passos para colocar o NeXPay em produção:"),
  numberedItem("Faça push do código mais recente para a branch main do GitHub", "numbered-deploy-prod"),
  numberedItem("Acesse o dashboard do Vercel e selecione o projeto NeXPay", "numbered-deploy-prod"),
  numberedItem("O Vercel detectará automaticamente o commit e iniciará o build", "numbered-deploy-prod"),
  numberedItem("Aguarde a conclusão do build e verifique se não há erros nos logs", "numbered-deploy-prod"),
  numberedItem("Acesse a URL gerada (ex: nexpay.vercel.app) para validar o deploy", "numbered-deploy-prod"),
  numberedItem("Em Settings → Domains, configure um domínio personalizado se necessário", "numbered-deploy-prod"),

  // 8.5 Banco de Dados em Produção
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "8.5 Banco de Dados em Produção", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("Para ambientes de produção, é altamente recomendado migrar do SQLite local para um banco de dados gerenciado:"),
  bulletItemMulti([boldRun("Turso (libSQL): "), normalRun("Recomendado — banco de dados serverless compatível com SQLite. Atualize o provider em schema.prisma para \"libsql\" e configure a DATABASE_URL com a URL do Turso.")], "bullets-deploy-db"),
  bulletItemMulti([boldRun("PlanetScale: "), normalRun("Alternativa MySQL serverless com branch workflows para schema migrations.")], "bullets-deploy-db"),
  bulletItemMulti([boldRun("Neon: "), normalRun("PostgreSQL serverless com auto-scaling e suporte a connection pooling.")], "bullets-deploy-db"),
  bodyPara("Após escolher o provedor, atualize a variável DATABASE_URL no Vercel para apontar ao banco de dados remoto."),

  // 8.6 Observações para Produção
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 250, before: 400, after: 200 },
    children: [new TextRun({ text: "8.6 Observações para Produção", font: "Times New Roman", size: 28, bold: true, color: colors.primary })],
  }),
  bodyPara("Antes de colocar a aplicação em produção, considere os seguintes pontos:"),
  bulletItem("Substituir SQLite por banco de dados gerenciado (Turso, PlanetScale ou Neon)", "bullets-security"),
  bulletItem("Configurar a variável NOWPAYMENTS_API_KEY para depósitos crypto reais", "bullets-security"),
  bulletItem("Implementar rate limiting para proteção contra abuso de endpoints", "bullets-security"),
  bulletItem("Configurar CORS adequadamente para as origens permitidas", "bullets-security"),
  bulletItem("Garantir HTTPS em todas as comunicações (padrão no Vercel)", "bullets-security"),
  bulletItem("Configurar CDN para assets estáticos (logo, imagens, fontes)", "bullets-security"),
  bulletItem("Implementar monitoramento e alertas (ex: Sentry, Vercel Analytics)", "bullets-security"),
];

// ════════════════════════════════════════════════════════════════
//  SECTION 9 — Considerações de Segurança
// ════════════════════════════════════════════════════════════════
const section9Children = [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 250, before: 600, after: 300 },
    children: [new TextRun({ text: "9. Considerações de Segurança", font: "Times New Roman", size: 36, bold: true, color: colors.primary })],
  }),
  bodyPara("A segurança é um pilar fundamental do NeXPay. As seguintes medidas foram implementadas para proteger os dados e transações dos usuários:"),
  bulletItemMulti([boldRun("JWT com Expiração: "), normalRun("Os tokens JWT possuem tempo de expiração configurável, garantindo que sessões inativas sejam invalidadas automaticamente.")], "bullets-security"),
  bulletItemMulti([boldRun("Hashing de Senhas: "), normalRun("Todas as senhas são armazenadas como hashes bcrypt com salt rounds padrão, tornando inviável a recuperação da senha original em caso de vazamento.")], "bullets-security"),
  bulletItemMulti([boldRun("2FA TOTP: "), normalRun("Autenticação de dois fatores opcional via TOTP, compatível com Google Authenticator e Authy, adicionando uma camada extra de proteção.")], "bullets-security"),
  bulletItemMulti([boldRun("Cookies Seguros: "), normalRun("O token JWT é armazenado em cookies. Em produção, recomenda-se utilizar cookies HttpOnly, Secure e SameSite para prevenir ataques XSS e CSRF.")], "bullets-security"),
  bulletItemMulti([boldRun("Validação de Input: "), normalRun("Todos os inputs são validados tanto no frontend (componentes React) quanto no backend (API Routes) para prevenir injeção de dados maliciosos.")], "bullets-security"),
];

// ════════════════════════════════════════════════════════════════
//  BACK COVER SECTION
// ════════════════════════════════════════════════════════════════
const backCoverSection = {
  properties: {
    page: {
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      size: { width: 11906, height: 16838 },
    },
  },
  children: [
    new Paragraph({ spacing: { before: 6000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", font: "Calibri", size: 20, color: colors.accent })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "NeXPay", font: "Times New Roman", size: 48, bold: true, color: colors.primary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "NexTrustX", font: "Times New Roman", size: 28, color: colors.secondary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "© 2025 NexTrustX. Todos os direitos reservados.", font: "Calibri", size: 22, color: colors.secondary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", font: "Calibri", size: 20, color: colors.accent })],
    }),
  ],
};

// ════════════════════════════════════════════════════════════════
//  DOCUMENT ASSEMBLY
// ════════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22, color: colors.body },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, font: "Times New Roman", color: colors.primary },
        paragraph: { spacing: { before: 600, after: 300, line: 250 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Times New Roman", color: colors.primary },
        paragraph: { spacing: { before: 400, after: 200, line: 250 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Times New Roman", color: colors.primary },
        paragraph: { spacing: { before: 300, after: 150, line: 250 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: { config: numberingConfig },
  sections: [
    coverSection,
    // TOC Section
    {
      properties: {
        page: {
          margin: { top: 1800, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      headers: { default: mainHeader() },
      footers: { default: mainFooter() },
      children: [
        new Paragraph({ children: [new PageBreak()] }),
        ...tocSection.children,
      ],
    },
    // Main Content Sections (all in one section with headers/footers)
    {
      properties: { page: mainPage() },
      headers: { default: mainHeader() },
      footers: { default: mainFooter() },
      children: [
        new Paragraph({ children: [new PageBreak()] }),
        ...section1Children,
        ...section2Children,
        ...section3Children,
        ...section4Children,
        ...section5Children,
        ...section6Children,
        ...section7Children,
        ...section8Children,
        ...section9Children,
      ],
    },
    // Back Cover
    backCoverSection,
  ],
});

// ════════════════════════════════════════════════════════════════
//  GENERATE FILE
// ════════════════════════════════════════════════════════════════
async function main() {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/NEXPAY-Technical-Document.docx", buffer);
  console.log("Document generated successfully: /home/z/my-project/NEXPAY-Technical-Document.docx");
  console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("Error generating document:", err);
  process.exit(1);
});
