# CurriculoATSfriendly — Radar ATS

Aplicação web que compara um currículo com a descrição de uma vaga e devolve uma versão **ATS friendly** desse currículo. ATS é o *Application Tracking System*: o software que lê, ranqueia e descarta candidatos antes de qualquer pessoa do RH abrir o arquivo.

Desafio DIO "Entendendo o Desafio ATS Friendly" · construído no [Lovable](https://lovable.dev) e também implementado como app React/Vite neste repositório.

---

## 1. O problema que a aplicação resolve

Um currículo pode estar impecável para um humano e ilegível para a máquina: duas colunas, tabela, foto, contato no cabeçalho, "Responsável por…" sem resultado nenhum. O ATS não lê o PDF como uma pessoa lê — ele extrai texto na ordem em que foi desenhado na página. Quando a extração sai embaralhada, o candidato é eliminado por um motivo que nunca vai descobrir.

A aplicação responde quatro perguntas objetivas:

1. **Quanto** o currículo casa com aquela vaga específica (nota de 0 a 100);
2. **Quais** palavras-chave da vaga aparecem no currículo e **quais faltam**;
3. **O que** no formato está atrapalhando a leitura automática;
4. **Como** ficaria a versão ajustada, pronta para exportar.

A regra que atravessa o produto inteiro, e que está escrita na própria interface:

> **Reescrevemos a forma, nunca os fatos.** O ajuste reorganiza e prioriza o que já existe no currículo. Nenhuma empresa, data, formação ou número é inventado.

---

## 2. Aplicação

**No ar:** **[curriculo-ats-friendly.vercel.app](https://curriculo-ats-friendly.vercel.app/)** — projeto `puc4/curriculo-ats-friendly` na Vercel, conectado a este repositório: todo push na `main` gera uma nova versão de produção.

**Rodando localmente:**

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 20 testes do motor e das telas
npm run build    # gera dist/
```

O build na Vercel roda `npm ci` e `npm run build` (que executa o typecheck antes de compilar) e publica a pasta `dist`, conforme o [`vercel.json`](./vercel.json).

*(Se você reconstruir a versão no Lovable, o endereço `*.lovable.app` entra aqui também.)*

---

## 3. O mega prompt usado

**Arquivo:** [`mega-prompt.md`](./mega-prompt.md) · versão final 2.0

O prompt descreve o produto inteiro em 20 seções: promessa, persona, escopo do MVP, stack, telas, motor de nota, regras ATS, guardrails, contratos de IA, modelo de dados, acessibilidade e critérios de aceite. Paleta e componentes vêm de um segundo arquivo, [`design-system.md`](./design-system.md), colado junto para o Lovable não improvisar cor.

### O que mudou do rascunho (1.0) até a versão final (2.0)

| # | Mudança | Por quê |
|---|---|---|
| 1 | A nota passou a ser **calculada em código**, com 6 critérios e pesos fixos que somam 100. A IA só extrai requisitos e reescreve. | Na v1 a IA dava a nota. Duas execuções com o mesmo currículo davam notas diferentes, e não havia como explicar de onde saiu o número. Diagnóstico precisa ser reprodutível. |
| 2 | Cada critério passou a exigir **evidência citável** (o trecho do currículo, ou a ausência explícita). | "Faltam 3 pontos" sem apontar onde é inútil para quem vai corrigir. |
| 3 | Entrou a **lista de 10 checagens binárias de formato**, valendo 20 pontos. | É o problema número 1 do ATS (layout), e o único que o usuário conserta em 2 minutos. |
| 4 | Guardrail **anti-alucinação** virou regra numerada e foi para a interface, com faixa fixa na tela de resultado e ao lado do botão de exportar. | O risco real do produto é inventar experiência para preencher lacuna de vaga. O alerta na tela protege o usuário e educa sobre o limite da ferramenta. |
| 5 | Onde falta métrica, a saída usa o marcador `[métrica: ex. %]` em vez de estimar. | Impede que o modelo "arredonde" um resultado que não existe. |
| 6 | **Diff obrigatório**, com as mudanças e o motivo de cada uma. | O usuário precisa ver o que mudou; sem isso a reescrita é caixa-preta. |
| 7 | A extração de PDF/DOCX passou a acontecer **no navegador**. O arquivo não sobe. | Currículo é dado pessoal (LGPD). |
| 8 | Entraram **limites e estados de erro explícitos** (PDF escaneado, teto de caracteres, limite de plano). | Todo teste com PDF escaneado travava o fluxo com erro genérico. |
| 9 | O escopo ganhou a prioridade "núcleo primeiro": colar vaga → colar currículo → match → exportar. | É o que o desafio pede e o que cabe em créditos diários. |
| 10 | O design system virou arquivo separado, com tokens em HSL no formato shadcn/ui. | Colar tudo num prompt só fazia o Lovable inventar cores nas telas secundárias. |

---

## 4. Como a análise funciona

Cinco etapas, todas no navegador. Nenhum dado do currículo sai da máquina.

### Etapa 1 — Entrada

- **Currículo:** upload de PDF (lido com `pdfjs-dist`) ou DOCX (`mammoth`), processado no cliente, ou texto colado. O arquivo nunca é enviado.
- **Vaga:** texto do anúncio colado.
- Limites: 15.000 caracteres de currículo, 20.000 de vaga. PDF digitalizado (imagem) é detectado e explicado com mensagem específica.

### Etapa 2 — Extração dos requisitos da vaga

`src/lib/extract-jd.ts` lê a vaga sem modelo de linguagem:

1. Identifica blocos (`Requisitos`, `Desejável`, `Responsabilidades`, `Sobre a empresa`) para decidir obrigatoriedade.
2. Casa o texto com um dicionário de ~150 competências, ferramentas, idiomas e sinônimos (`js` ↔ `javascript`, `power bi` ↔ `powerbi`).
3. Sem correspondência no dicionário, extrai o trecho depois de conectores como "experiência com…", "domínio de…".
4. Marca `must_have` o que está no bloco de requisitos ou aparece 2+ vezes; `nice_to_have` o resto. Na dúvida, `nice_to_have`.
5. Deduplica e ordena: obrigatórios primeiro.

Cada requisito guarda o **trecho da vaga que o sustenta**.

### Etapa 3 — Cruzamento e nota

`src/lib/score.ts` normaliza tudo (minúsculas, sem acento, sem pontuação, plural simples), casa frases inteiras com fronteira de palavra e aceita sinônimo ou variação ≥ 0,88 de semelhança.

| Critério | Peso | Como é medido |
|---|---|---|
| Palavras-chave obrigatórias | 30 | cobertura ponderada — `must_have` vale 2, `nice_to_have` vale 1 |
| Formato / parseabilidade | 20 | 10 checagens binárias de 2 pontos cada |
| Resultados quantificados | 15 | % de itens de experiência com número, %, R$, tempo ou volume |
| Aderência de cargo e senioridade | 12 | termos do título da vaga presentes + senioridade declarada |
| Estrutura e seções | 13 | seções padrão, bloco de contato e ordem cronológica inversa |
| Clareza dos itens | 10 | verbo de ação no início, até 2 linhas, sem "responsável por" |

Nota = soma dos pontos. Faixas: **< 50** "Precisa de ajustes" · **50–74** "Quase lá" · **≥ 75** "Competitivo".

As 10 checagens de formato: texto legível · contato no corpo · sem indício de coluna/tabela · datas em MM/AAAA · ordem cronológica inversa · títulos de seção reconhecíveis · sem "referências a pedido" · sem emoji ou barra gráfica · 1 a 2 páginas · sem empilhamento de palavras-chave.

Todo critério devolve **evidência**: o trecho citado ou a ausência explícita. Mesma entrada, mesma nota — há teste para isso.

### Etapa 4 — Reescrita

`src/lib/rewrite.ts` só faz o que pode provar:

- Reconhece as seções e **padroniza os títulos** nos nomes que o ATS espera.
- Coloca as seções na ordem padrão.
- Padroniza datas por extenso em **MM/AAAA** (`jan 2020` → `01/2020`).
- Remove a muleta **"responsável por"**, mantendo o fato.
- Reordena as habilidades já existentes para colocar na frente as que a vaga pede.
- Remove duplicatas e prefixa cada item com `•`.

O que **não** faz: criar empresa, cargo, data, formação, certificação, número ou competência. Termo da vaga que não tem lastro no currículo **não entra no texto** — vai para a lista de *pendências*, junto com os itens que precisam de métrica. Há teste automatizado que garante que nenhum número novo aparece na saída e que `Power BI` não é inserido em um currículo que não o menciona.

### Etapa 5 — Exportação

Os três botões (**DOCX**, **PDF**, **TXT**) ficam fixos no topo do resultado, visíveis em qualquer aba — não só na de reescrita.

- `.docx` gerado no cliente (lib `docx`): Arial 11 pt, sem tabela, sem cabeçalho, títulos em parágrafo negrito.
- `.pdf` gerado com `jspdf`: A4, margem 18 mm, coluna única, **texto vetorial** — não é captura de tela, então o ATS extrai o texto na ordem correta.
- `.txt` em texto puro.
- Nome do arquivo: `Nome-Sobrenome-Cargo.ext`.
- A rota `/print/:id` continua como pré-visualização de impressão.
- A nota é recalculada sobre o texto ajustado e o delta aparece na tela (`72 → 90`).

---

## 5. Ajustes feitos depois da primeira versão, e por quê

| # | Ajuste | Motivo | Onde |
|---|---|---|---|
| 1 | Exportação em PDF por rota própria de impressão | PDF nativo saía com duas colunas e o ATS lia a ordem errada | `pages/PrintCv.tsx` |
| 2 | Exportação em `.docx` | Recrutador e candidato editam antes de enviar | `lib/export.ts` |
| 3 | Faixa "Reescrevemos a forma, nunca os fatos" fixa | Guardrail visível, não só no prompt | `Layout`, `Analysis` |
| 4 | Progresso nomeado por etapa no lugar de spinner | Espera sem contexto parece travamento | `pages/Wizard.tsx` |
| 5 | Chips com ícone além da cor | Cor sozinha não comunica estado (daltonismo) | `components/KeywordChip.tsx` |
| 6 | Mensagem específica para PDF escaneado | O erro genérico não dizia o que fazer | `lib/parsers.ts` |
| 7 | Nota determinística em vez de gerada por IA | Duas execuções davam notas diferentes | `lib/score.ts` |
| 8 | Evidência obrigatória em cada critério | Número sem explicação não é acionável | `lib/score.ts` |
| 9 | Pendências separadas do currículo | Inserir termo sem lastro seria inventar experiência | `lib/rewrite.ts` |

---

## 6. Estrutura do repositório

```
.
├── README.md                  este arquivo
├── mega-prompt.md             prompt completo usado no Lovable (v2.0)
├── design-system.md           tokens, tipografia, componentes e CSS de impressão
├── roteiro-lovable.md         mensagens fase a fase para reconstruir no Lovable
├── index.html
├── package.json
├── vite.config.ts             build + configuração dos testes
├── tailwind.config.js         tokens do design system no Tailwind
├── tsconfig.json
├── vercel.json                instalação, build e pasta de saída do deploy
├── scripts/gerar-exemplo.ts   gera os três arquivos fora do navegador
└── src/
    ├── App.tsx                rotas
    ├── main.tsx
    ├── index.css              tokens (claro/escuro) + CSS de impressão
    ├── i18n/pt-BR.ts          todos os textos da interface
    ├── lib/
    │   ├── text.ts            normalização, semelhança, contagem
    │   ├── taxonomy.ts        dicionário de competências e sinônimos
    │   ├── sections.ts        detecção de seções do currículo
    │   ├── extract-jd.ts      requisitos da vaga
    │   ├── format.ts          10 checagens de formato ATS
    │   ├── score.ts           nota, critérios e evidências
    │   ├── rewrite.ts         reescrita sem invenção
    │   ├── diff.ts            comparação linha a linha
    │   ├── parsers.ts         leitura de PDF/DOCX no navegador
    │   ├── export.ts          DOCX (docx), PDF (jspdf) e TXT
    │   ├── engine.test.ts     16 testes do motor
    │   └── export.test.ts     4 testes dos arquivos gerados
    ├── components/            ScoreRing, CriteriaBar, KeywordChip, Stepper, Dropzone…
    ├── pages/                 Landing, Wizard, Analysis, PrintCv
    ├── state/store.ts         rascunho e análises na sessão
    └── app.test.tsx           4 testes de renderização
```

---

## 7. Verificação

O que foi de fato executado neste repositório:

```bash
npx tsc --noEmit     # 0 erros
npx vitest run       # 25 testes, 3 arquivos, todos passando
npx vite build       # build de produção concluído
```

Além dos testes automatizados, os arquivos gerados foram inspecionados fora do navegador com `npx vite-node scripts/gerar-exemplo.ts /tmp/ats`:

- `pdftotext -layout exemplo.pdf` devolve o currículo em coluna única, com acentos preservados (`EXPERIÊNCIA`, `Administração`) e as seções na ordem — que é exatamente o que o ATS faz.
- descompactando o `.docx`: fonte Arial, zero `<w:tbl>` (nenhuma tabela) e o mesmo texto íntegro.

Os testes cobrem: normalização e sinônimos, extração de requisitos (obrigatório × desejável, sem inventar), determinismo da nota, soma exata dos 100 pontos, evidência em todo critério, checagens de formato, a regra anti-invenção na reescrita (nenhum número novo, nenhuma competência inserida), padronização de datas e a renderização das telas de wizard, resultado, impressão e erro.

**Não verificado:** comportamento do worker do `pdfjs` em navegador real (os testes rodam em DOM simulado e o build apenas empacota o worker); aparência visual das telas. Vale abrir o app e enviar um PDF de verdade antes de publicar.

---

## 8. Limitações conhecidas

- **Sem IA conectada.** Extração e reescrita são determinísticas. Funciona sem chave de API e sem custo, mas a reescrita é conservadora: não reformula frases, só normaliza estrutura, datas, títulos e ordem. A camada de IA está especificada em [`mega-prompt.md`](./mega-prompt.md) (seção 12) para quando houver backend.
- **Sem leitura de URL da vaga.** Dependeria de servidor por causa de CORS; por ora, colar o texto.
- **Histórico só na sessão.** Fecha a aba, perdeu. Persistência exigiria banco (especificado na seção 13 do prompt).
- **PDF digitalizado não é lido** — o app explica e oferece colar o texto.
- **Dicionário de ~150 termos** cobre tecnologia, dados, gestão, marketing e comportamentais. Vaga de nicho pode ter requisito fora do dicionário; a heurística pega parte.

---

## 9. Checklist do desafio

- [x] Repositório na conta do autor e público — [github.com/MarcioAntonioGoncalvesdosSantos/CurriculoATSfriendly](https://github.com/MarcioAntonioGoncalvesdosSantos/CurriculoATSfriendly)
- [x] Código da aplicação no repositório, com testes passando
- [x] Nenhuma chave, token ou senha versionada
- [x] Todo arquivo e pasta citado neste README existe e tem conteúdo
- [x] Aplicação publicada na Vercel e abrindo para quem tem o endereço
- [x] Endereço da aplicação na seção 2
- [ ] **Nome do repositório em minúsculas, sem acento** — renomear para `curriculo-ats-friendly` em *Settings → Repository name*
- [ ] Prints da análise e exemplo de uso anexados

---

## 10. Dados e privacidade (LGPD)

- O arquivo do currículo é lido **no navegador** e não é armazenado em servidor nenhum.
- O texto e a análise ficam apenas em `sessionStorage`, apagados ao fechar a aba.
- Nenhum texto é usado para treinar modelo.
- Nenhuma dependência de rede em tempo de execução, exceto o Google Fonts.
- Hospedagem estática na Vercel (região `gru1`, São Paulo), sem backend: não há servidor que receba o currículo.
