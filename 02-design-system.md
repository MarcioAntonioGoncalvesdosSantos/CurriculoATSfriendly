# Design System — Radar ATS

Sistema de design do app de comparação currículo × vaga. Colável no Lovable junto com o mega prompt.
**Princípio:** credibilidade antes de charme. É uma ferramenta de diagnóstico — a interface deve parecer um instrumento de precisão, não um app de marketing.

---

## 1. Fundamento de marca

| | |
|---|---|
| Nome | Radar ATS |
| Personalidade | Preciso · Sóbrio · Direto · Confiável |
| Metáfora visual | Instrumento de medição: régua, mira, sinal |
| Referências | Linear (densidade), Stripe Dashboard (clareza), Notion (respiração) |
| Anti-referências | Gradientes roxos de IA, dashboards "cyber", cards flutuantes com glow, ilustrações 3D |

**Regra dos 3 segundos:** o usuário deve entender *nota + o que falta* sem rolar a tela.

---

## 2. Cor

### 2.1 Paleta primitiva

| Token | Hex | Uso |
|---|---|---|
| `--ink-900` | `#0A1620` | Texto principal, títulos |
| `--ink-700` | `#2A3B4C` | Texto secundário forte |
| `--ink-500` | `#5B6B7B` | Texto auxiliar, legendas |
| `--ink-300` | `#9AA8B4` | Placeholder, ícones inativos |
| `--ink-100` | `#E3E8ED` | Bordas, divisores |
| `--ink-050` | `#F1F4F6` | Fundo de campo, hover sutil |
| `--paper` | `#FFFFFF` | Superfície de card |
| `--canvas` | `#F7F7F4` | Fundo da página (off-white quente) |
| `--brand-900` | `#08302C` | Pressed |
| `--brand-700` | `#0C4A45` | **Primária** (botão, links, anel de nota) |
| `--brand-500` | `#176B62` | Hover / estados |
| `--brand-100` | `#E4F1EF` | Fundo de chip/badge brand |
| `--success-700` | `#0E5C2C` | Texto sobre verde claro |
| `--success-500` | `#157F3C` | Nota alta, item presente |
| `--success-100` | `#E7F5EC` | Fundo "presente" |
| `--warning-700` | `#8A3F07` | Texto sobre âmbar claro |
| `--warning-500` | `#B45309` | Nota média, item parcial |
| `--warning-100` | `#FCEFDF` | Fundo "parcial" |
| `--danger-700` | `#8C1D14` | Texto sobre vermelho claro |
| `--danger-500` | `#B42318` | Nota baixa, item ausente |
| `--danger-100` | `#FBEAE8` | Fundo "ausente" |
| `--info-500` | `#1D4ED8` | Links informativos, foco secundário |

Semânticas **nunca** aparecem sozinhas: sempre `ícone + rótulo` junto da cor (daltonismo ~8% dos homens).

### 2.2 Tokens semânticos (CSS — formato shadcn, HSL)

```css
:root {
  --background: 60 15% 96%;        /* canvas #F7F7F4 */
  --foreground: 207 52% 8%;        /* ink-900 */
  --card: 0 0% 100%;
  --card-foreground: 207 52% 8%;
  --popover: 0 0% 100%;
  --popover-foreground: 207 52% 8%;
  --primary: 175 72% 17%;          /* brand-700 */
  --primary-foreground: 0 0% 100%;
  --secondary: 45 22% 93%;         /* areia */
  --secondary-foreground: 207 30% 18%;
  --muted: 60 15% 96%;
  --muted-foreground: 210 15% 42%; /* ink-500 */
  --accent: 172 39% 92%;           /* brand-100 */
  --accent-foreground: 175 72% 14%;
  --destructive: 4 76% 40%;
  --destructive-foreground: 0 0% 100%;
  --border: 210 22% 91%;
  --input: 210 22% 91%;
  --ring: 175 72% 17%;
  --radius: 0.625rem;              /* 10px */

  --score-low: 4 76% 40%;
  --score-mid: 26 91% 37%;
  --score-high: 142 72% 29%;
}

.dark {
  --background: 207 45% 6%;        /* ink profundo */
  --foreground: 60 15% 96%;
  --card: 207 36% 10%;
  --card-foreground: 60 15% 96%;
  --primary: 172 45% 42%;          /* clareia p/ contraste */
  --primary-foreground: 207 45% 6%;
  --secondary: 207 25% 16%;
  --secondary-foreground: 60 15% 96%;
  --muted: 207 25% 16%;
  --muted-foreground: 210 12% 68%;
  --accent: 175 45% 16%;
  --accent-foreground: 172 60% 82%;
  --border: 207 20% 22%;
  --input: 207 20% 22%;
  --ring: 172 45% 42%;
}
```

**Regra:** nenhum `#hex` direto em componente. Só `bg-primary`, `text-muted-foreground`, etc.

---

## 3. Tipografia

| Papel | Fonte | Pesos | Uso |
|---|---|---|---|
| Display | **Sora** | 600, 700 | H1, H2, nota numérica grande |
| Texto/UI | **Inter** | 400, 500, 600 | corpo, botões, labels |
| Dados | **JetBrains Mono** | 400, 500 | nota, %, contagens, termos de keyword |

Carregar via Google Fonts, com `font-display: swap` e fallback (`Sora, Inter, system-ui, sans-serif`).

### Escala (rem / line-height / tracking)

| Token | Size | LH | Tracking | Uso |
|---|---|---|---|---|
| `text-xs` | 0.75rem (12) | 1.5 | +0.01em | caption, helper |
| `text-sm` | 0.875rem (14) | 1.5 | 0 | corpo de UI, labels |
| `text-base` | 1rem (16) | 1.6 | 0 | corpo de leitura |
| `text-lg` | 1.125rem (18) | 1.55 | -0.005em | subtítulo |
| `text-xl` | 1.375rem (22) | 1.35 | -0.01em | H3 |
| `text-2xl` | 1.75rem (28) | 1.25 | -0.015em | H2 |
| `text-3xl` | 2.375rem (38) | 1.15 | -0.02em | H1 landing |
| `text-4xl` | 3rem (48) | 1.05 | -0.025em | hero |
| `text-score` | 3.5rem (56) | 1 | -0.03em | número da nota (mono, 500) |

Regras: máximo 2 níveis de heading por card; largura de leitura 62–75 caracteres (`max-w-[68ch]`); nunca texto em caixa alta além de overline/label (12px, `+0.08em`).

---

## 4. Espaço, grade e layout

- Unidade base **4px**. Escala: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
- Container: `max-w-[1120px]`, padding lateral 16px (mobile) / 24px (≥768) / 32px (≥1280).
- Grid: 12 colunas, gutter 24px. Conteúdo de leitura em 8 colunas; painel lateral em 4.
- Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`.
- Ritmo vertical entre seções: 64px (mobile 40px). Entre cards: 16px. Densidade alta é intencional — não inflar padding.

### Hierarquia de borda e elevação

| Nível | Tratamento |
|---|---|
| Página | `bg-background` |
| Card padrão | `bg-card border border-border rounded-[10px]`, sem sombra |
| Card em destaque (resultado) | `shadow-[0_2px_8px_rgba(10,22,32,0.06)]` |
| Popover/Dialog | `shadow-[0_12px_32px_rgba(10,22,32,0.10)]` |
| Preenchido/hover | `bg-ink-050` |

Uma única sombra por tela em destaque. Proibido empilhar sombra + borda + gradiente no mesmo elemento.

---

## 5. Componentes

### 5.1 Button

| Variante | Padrão | Hover | Pressed | Uso |
|---|---|---|---|---|
| `primary` | `bg-primary text-primary-foreground` | `bg-brand-500` | `bg-brand-900` | 1 por tela |
| `secondary` | `bg-secondary text-secondary-foreground border-border` | `bg-ink-050` | escurece 4% | ações de apoio |
| `ghost` | transparente | `bg-ink-050` | idem | ações em linha |
| `destructive` | `bg-danger-100 text-danger-700` | `bg-danger-100/80` | — | apagar dados |
| `link` | `text-primary underline-offset-4` | `underline` | — | navegação textual |

Tamanhos: `sm 32px · md 40px · lg 48px` (altura), padding-x `12/16/20`, radius 8px, `font-medium`, `text-sm`.
Foco: `outline-none ring-2 ring-ring ring-offset-2 ring-offset-background`.
Carregando: spinner 14px + texto no gerúndio ("Analisando…"), botão `disabled` com `opacity-60`, largura travada (sem salto de layout).

### 5.2 Card / Panel

Estrutura: `header` (título 16px/600 + ação à direita) · `body` · `footer` opcional com borda superior.
Radius 10px, padding 20px (mobile 16px). Título sempre alinhado à esquerda; nunca centralizar texto em card de dados.

### 5.3 ScoreRing (elemento assinatura)

- SVG 160×160, anel de 12px, `stroke-linecap="round"`, trilho `--ink-100`, preenchimento com cor da faixa da nota, animação de 600ms `ease-out` do `0` até o valor (respeitando `prefers-reduced-motion`).
- Dentro: `text-score` mono + `text-xs uppercase` "de 100".
- Abaixo: `Badge` com rótulo textual ("Competitivo" / "Quase lá" / "Precisa de ajustes").
- `role="img"` + `aria-label="Compatibilidade: 72 de 100 — Quase lá"`.
- Delta pós-reescrita: pílula `+18` em `success-100/success-700` com seta ▲ (nunca só cor).

### 5.4 CriteriaBar (6 critérios)

Linha: label (`text-sm`, 200px fixo) · barra (`h-2`, radius full, trilho `ink-100`) · valor `x/y` em mono.
Barra com transição de largura 400ms e `aria-hidden` na barra (o valor textual é a fonte da verdade). Expandir mostra a evidência em `text-sm text-muted-foreground` com citação entre aspas.

### 5.5 KeywordChip

Três estados, sempre com ícone:

| Estado | Estilo | Ícone |
|---|---|---|
| Presente | `bg-success-100 text-success-700 border-success-500/30` | `Check` |
| Parcial | `bg-warning-100 text-warning-700 border-warning-500/30` | `Minus` |
| Ausente | `bg-danger-100 text-danger-700 border-danger-500/30` | `X` |

Altura 28px, `text-xs`, radius 6px, `font-medium`, contador de ocorrências em mono quando >1 (`estratégia ×3`). Hover abre `Popover` com "onde aparece no seu currículo" + "onde inserir na vaga". Nunca usar chip como botão sem `aria-pressed`.

### 5.6 DiffViewer

Duas colunas em ≥1024px (Antes | Depois), abas em <1024px. Remoção: `bg-danger-100` com `line-through` apagado e prefixo `−`; adição: `bg-success-100` com prefixo `+`. Fonte mono 13px para o corpo do CV. Cada bloco tem rodapé `Aceitar` / `Recusar` (`Button sm`) e badge do motivo ("Palavra-chave inserida"). Contador fixo no topo: "7 de 12 seções aceitas".

### 5.7 Dropzone

Área `border-2 border-dashed border-border rounded-[10px]` 200px, ícone `UploadCloud` 24px, título 15px/600 "Solte seu currículo aqui", subtítulo "PDF ou DOCX · até 5 MB". Estados: `idle` / `dragover` (`border-primary bg-accent`) / `error` (`border-danger-500 bg-danger-100` + mensagem específica). Sempre com alternativa textual "ou cole o texto".

### 5.8 Stepper

3 nós numerados 24px, linha 2px `ink-100`, nó ativo `bg-primary`, concluído `Check`. Rótulos abaixo em `text-xs`. `aria-current="step"`.

### 5.9 Tabela de histórico

Sem zebra. Cabeçalho `text-xs uppercase tracking-wide text-muted-foreground`, linha com `border-b border-border`, altura 56px, hover `bg-ink-050`. Colunas: Vaga · Nota (mono, cor da faixa) · Data · Ações (`⋯`).

### 5.10 Estados vazios e de carregamento

Vazio: ícone 32px `ink-300`, título 15px/600, uma linha de texto, um CTA. Nada de ilustração 3D.
Skeleton: blocos `bg-ink-050 animate-pulse rounded-md`, mesma geometria do conteúdo real. Com etapas nomeadas quando >2s.

---

## 6. Movimento

| Token | Duração | Curva |
|---|---|---|
| `fast` | 120ms | `cubic-bezier(.2,.8,.2,1)` |
| `base` | 180ms | `cubic-bezier(.2,.8,.2,1)` |
| `slow` | 260ms | `cubic-bezier(.2,.8,.2,1)` |
| `score` | 600ms | `ease-out` |

Animar apenas `opacity` e `transform`. Nunca animar `height`/`width` de containers. `@media (prefers-reduced-motion: reduce)` zera durações e desliga o preenchimento do anel.

---

## 7. Acessibilidade

- Contraste mínimo 4.5:1 em texto, 3:1 em UI. `brand-700` sobre branco = 8.9:1 ✅; `warning-500` **não** serve como texto sobre branco (usar `warning-700`).
- Foco visível em tudo que é interativo (`ring-2 ring-offset-2`), nunca `outline: none` isolado.
- Ordem de tabulação = ordem visual. Skip link "Ir para o conteúdo".
- `aria-live="polite"` na região que recebe a nota e o resultado da análise.
- Ícone decorativo `aria-hidden`; ícone com significado recebe `aria-label`.
- Alvos ≥44×44px (chips e `⋯` recebem padding invisível).
- Formulário: todo campo com `label` visível (nunca só placeholder), erro com `aria-describedby` + `aria-invalid`.

---

## 8. Microcopy (pt-BR)

| Contexto | Escreva | Não escreva |
|---|---|---|
| CTA principal | "Analisar meu currículo" | "Vamos lá!" |
| CTA de vaga | "Colar descrição da vaga" | "Adicionar vaga" |
| Erro de PDF | "Não conseguimos ler este PDF. Ele parece ser digitalizado — cole o texto ou envie um DOCX." | "Erro 422" |
| Nota baixa | "6 palavras-chave obrigatórias não aparecem no seu currículo." | "Seu currículo é ruim" |
| Ausente | "Ausente" | "Faltando ❌" |
| Limite | "Você usou suas 3 análises deste mês. Elas continuam disponíveis para exportar." | "Limite excedido" |
| Sucesso | "Análise pronta. Nota: 72/100." | "Feito!" |

Regras: verbo no infinitivo em CTA; números sempre com unidade ("72/100", "6 palavras"); sem exclamação dupla; sem emoji na UI; frase ≤ 2 linhas.

---

## 9. CSS de impressão (export do currículo)

```css
@media print {
  @page { size: A4; margin: 1.8cm; }
  html, body { background: #fff !important; color: #000 !important; }
  .no-print { display: none !important; }
  .cv-body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt; line-height: 1.4;
  }
  .cv-body h2 { font-size: 12pt; font-weight: 700; margin: 14pt 0 4pt; }
  .cv-body ul { list-style: none; padding-left: 0; }
  .cv-body li { margin-bottom: 3pt; }
  .cv-body li::before { content: "• "; }
  a { color: #000; text-decoration: none; }
}
```

O que **não** pode existir na rota de impressão: navegação, botões, chips coloridos, sombras, colunas, imagens, ícones, cabeçalho/rodapé.

---

## 10. Checklist de conformidade (revisar cada tela)

- [ ] Zero hex solto; só tokens.
- [ ] Uma cor de destaque por tela (a primária). Semânticas só em contexto de status.
- [ ] Toda cor de status acompanhada de ícone + texto.
- [ ] Máx. 2 pesos de fonte por bloco; títulos Sora, corpo Inter, números mono.
- [ ] Espaçamento na escala de 4px.
- [ ] Nenhuma sombra fora das 3 permitidas.
- [ ] Funciona em 375px sem scroll horizontal.
- [ ] Tabulação completa com foco visível.
- [ ] Estados vazio, carregando, erro e sucesso implementados.
- [ ] Textos vindos do arquivo de i18n.
