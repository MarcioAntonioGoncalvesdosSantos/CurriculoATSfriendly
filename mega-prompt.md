# Mega Prompt — "Radar ATS" (Lovable)

**Versão 2.0** · desafio DIO "Entendendo o Desafio ATS Friendly" · ferramenta: [lovable.dev](https://lovable.dev)

> **Como usar:** cole o bloco abaixo no Lovable em **uma mensagem inicial** (ou divida nas 5 fases da seção 19, se o editor cortar). Depois cole `design-system.md` na conversa e diga: *"Aplique exatamente os tokens deste design system. Não invente cores."*
>
> O bloco é autossuficiente: produto, telas, fluxo, motor de análise, contratos de IA, modelo de dados e critérios de aceite. O histórico do que mudou entre a versão 1.0 e esta está no `README.md`.

---

## CONTEÚDO PARA COLAR

Você vai construir um app web chamado **Radar ATS**. Leia tudo antes de gerar código e siga as seções na ordem. Não simplifique regras de negócio sem me avisar antes.

### 1. Papel e missão

Você é um engenheiro de produto sênior especializado em React + TypeScript + Supabase. Sua missão é construir um app que **compara um currículo com uma descrição de vaga e devolve (a) um diagnóstico de compatibilidade ATS e (b) uma versão reescrita do currículo, ATS-friendly, sem inventar informação**.

Regra de ouro: **o app reorganiza, reescreve e prioriza o que já existe no currículo. Nunca cria experiência, empresa, data, formação, certificação ou número.**

### 2. Produto

- **Promessa:** "Descubra em 60 segundos por que seu currículo não passa no filtro — e receba a versão corrigida."
- **Problema:** 75% dos currículos são descartados por software (ATS) antes de um humano ler. Candidatos não sabem quais palavras-chave faltam nem se o layout é ilegível para a máquina.
- **Diferencial:** nota explicada + diff lado a lado (antes/depois) + exportação em formato comprovadamente parseável.
- **Idioma da interface:** português do Brasil. Conteúdo analisado pode estar em pt-BR ou inglês — detecte e responda no mesmo idioma do currículo.

### 3. Usuário e jobs-to-be-done

Persona: profissional de 25–45 anos, aplicando para 5–40 vagas, usa LinkedIn/Gupy/Indeed, não é técnico.
JTBD:
1. "Quero saber se essa vaga específica vale meu tempo antes de me candidatar."
2. "Quero saber exatamente o que ajustar no meu currículo para essa vaga."
3. "Quero baixar uma versão que passe no filtro automático sem perder meu histórico."

Tom de voz: direto, técnico sem jargão, sem culpar o usuário, sem promessas absolutas ("nenhum app garante aprovação em ATS").

### 4. Escopo

**MVP (fase 1) — construir agora:**
1. Landing com proposta de valor + 3 provas (nota, diff, export).
2. Fluxo de análise em 3 passos: (1) currículo, (2) vaga, (3) resultado.
3. Entrada do currículo: upload PDF/DOCX (extração no navegador) **ou** colar texto.
4. Entrada da vaga: colar descrição **ou** colar URL (buscar e extrair o texto do anúncio).
5. Motor de análise determinístico (seção 8) + camada de IA para extração de keywords e reescrita.
6. Tela de resultado com: nota 0–100, 6 critérios detalhados, lista de palavras-chave (presente / parcial / ausente), avisos de formato, bullets priorizados.
7. Tela de reescrita: diff por seção, edição inline, aprovação seção a seção.
8. Exportação: **.docx**, **.pdf** (via print single-column) e **.txt**; copiar seção.
9. Histórico de análises (até 10 no plano free) + exclusão de dados.
10. Auth (e-mail/senha + Google) e plano free com limite de 3 análises/mês.

> O desafio pede o núcleo primeiro: colar vaga → colar currículo → match + palavras-chave encontradas e ausentes → currículo ajustado pronto para exportar. Se o tempo for curto, entregue o núcleo publicável e só depois os itens 9 e 10.

**Fase 2 (não construir agora, apenas deixar a arquitetura pronta):** comparação com múltiplas vagas, carta de apresentação, versões por vaga, LinkedIn optimizer, plano pago.

**Fora de escopo:** recrutamento, banco de vagas, mentoria, geração de currículo do zero.

### 5. Stack e restrições técnicas (obrigatório)

- React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + lucide-react. Sem Next.js, sem CSS-in-JS.
- Lovable Cloud (Supabase): auth, Postgres com RLS, storage, edge functions.
- IA: Lovable AI Gateway (modelo Gemini). Nunca exponha chave de API no client — toda chamada de IA passa por edge function.
- Extração de PDF e DOCX **no navegador** (`pdfjs-dist` e `mammoth`), para que o arquivo nunca suba para o servidor. Só o texto extraído vai para as edge functions.
- Exportação: `docx` (client-side) para .docx; CSS de impressão dedicado para PDF; Blob para .txt.
- Sem bibliotecas de gráficos. A nota é um anel em SVG puro + barras em div.
- Todo texto de UI em pt-BR, centralizado em `/src/i18n/pt-BR.ts` (sem strings soltas em componentes).

### 6. Design system

Siga o arquivo de design system que vou colar depois. Resumo vinculante:
- Primária verde-petróleo `#0C4A45`, texto ink `#0A1620`, canvas `#F7F7F4`, superfície `#FFFFFF`, borda `#E3E8ED`.
- Semânticas: sucesso `#157F3C`, atenção `#B45309`, erro `#B42318` — **sempre acompanhadas de ícone e texto, nunca só cor**.
- Tipografia: Sora (títulos), Inter (corpo), JetBrains Mono (números, keywords, notas).
- Raio 10px em cards, 6px em inputs, sombras discretas (1 nível), zero gradiente, zero glassmorphism, zero roxo.
- Layout: coluna central máx. 1120px, grid de 12 colunas, gutter 24px, mobile-first.

### 7. Arquitetura de telas

```
/                     Landing
/auth                 Login / cadastro
/app                  Dashboard (histórico + CTA "Nova análise")
/app/nova             Wizard 3 passos (currículo → vaga → processando)
/app/analise/:id      Resultado (tabs: Diagnóstico | Palavras-chave | Formato | Reescrita)
/app/analise/:id/export  Exportar
/app/conta            Perfil, plano, exclusão de dados
```
Wizard em 3 passos com barra de progresso, estado persistido em `sessionStorage` (rascunho sobrevive a reload). Botão voltar sempre ativo. Passo 3 mostra skeleton com etapas nomeadas ("Extraindo texto", "Lendo a vaga", "Cruzando requisitos", "Calculando nota").

**Aviso permanente na interface (obrigatório em 2 lugares):** uma faixa discreta, com ícone `ShieldCheck`, na tela de resultado e ao lado dos botões de exportação, com o texto fixo:

> **Reescrevemos a forma, nunca os fatos.** O ajuste reorganiza e prioriza o que já existe no seu currículo. Nenhuma empresa, data, formação ou número é inventado.

### 8. Motor de análise — nota de compatibilidade (determinístico)

A nota final é **calculada em código**, nunca pela IA. A IA só extrai e classifica dados; a matemática é auditável.

**Extração de requisitos da vaga** (IA + normalização em código):
- Classifique cada requisito em `must_have` (aparece em bloco de requisitos obrigatórios, ou repetido ≥2×, ou com "obrigatório/imprescindível/necessário") ou `nice_to_have` ("desejável/plus/diferencial"). Na dúvida: `nice_to_have`.
- Normalize toda comparação: minúsculas, sem acento, sem pontuação, singular/plural, e dicionário de sinônimos (ex.: `js`↔`javascript`, `gestão de pessoas`↔`liderança de equipe`, `power bi`↔`powerbi`). Match exato primeiro, depois fuzzy ≥0.88.

**Pesos (somam 100):**

| Critério | Peso | Como é medido |
|---|---|---|
| Palavras-chave obrigatórias | 30 | cobertura ponderada (must_have = 2, nice_to_have = 1) |
| Formato/parseabilidade | 20 | checagens binárias da seção 10 |
| Resultados quantificados | 15 | % de bullets com número, %, R$, tempo ou volume |
| Aderência de cargo e senioridade | 12 | título do currículo vs. título da vaga + anos de experiência |
| Estrutura e seções | 13 | presença das seções padrão + ordem cronológica inversa |
| Clareza das bullets | 10 | verbo de ação no início, 1–2 linhas, sem "responsável por" |

- Cada critério gera `{criterio, pontos, pontos_max, evidencia[]}`. **Toda nota precisa de evidência citável** (trecho do currículo ou ausência explícita).
- Nota = soma arredondada. Faixas: `<50` crítico (vermelho), `50–74` em progresso (âmbar), `≥75` competitivo (verde). Rótulos: "Precisa de ajustes", "Quase lá", "Competitivo".
- Sempre exibir: *"Notas ATS variam por sistema. Este é um diagnóstico de compatibilidade, não uma garantia."*
- Recalcular a nota após a reescrita e mostrar **antes → depois** com delta.

**Checagens binárias de formato (20 pontos, 2 cada):**
1. Texto selecionável (não é imagem/scan).
2. Sem tabelas, colunas duplas ou caixas de texto.
3. Contato no corpo do documento (não em header/footer).
4. Fontes padrão (Arial, Calibri, Helvetica, Georgia, Times).
5. Sem foto, ícones, gráficos, barras de habilidade.
6. Datas em MM/AAAA e ordem cronológica inversa.
7. Headings com nomes padrão da seção 10.
8. 1–2 páginas.
9. Arquivo nomeado `Nome-Sobrenome-Cargo.pdf` (checar ao exportar).
10. Sem "Referências disponíveis a pedido".

### 9. Extração de palavras-chave

Para cada requisito retorne: `{termo, tipo: hard_skill|soft_skill|ferramenta|idioma|certificacao|senioridade, obrigatoriedade, status: presente|parcial|ausente, ocorrencias_no_curriculo, onde_aparece[], sugestao_de_onde_inserir}`.
Regras: contar ocorrências no currículo normalizado; `parcial` = sinônimo/fuzzy encontrado ou termo presente só em contexto diferente; nunca contar ocorrência dentro do nome da empresa; agrupar em "Must-have ausentes", "Nice-to-have ausentes", "Presentes".
Ordenar a lista por impacto (`must_have` ausente primeiro, depois frequência na vaga).

### 10. Regras de reescrita ATS (rígidas)

A saída deve ser um currículo **em texto puro estruturado**, sem layout decorativo:
- **Coluna única**, leitura de cima para baixo. Nada de tabela, coluna dupla, ícone, caixa de texto, gráfico ou barra de skill.
- **Headings exatos:** Resumo Profissional · Experiência Profissional · Formação Acadêmica · Habilidades · Idiomas · Certificações (omitir seção vazia, nunca criar seção vazia).
- **Contato em 2 linhas no topo do corpo:** Nome · Cidade/UF · telefone · e-mail · LinkedIn (sem foto, sem idade, sem estado civil, sem endereço completo).
- **Datas:** `MM/AAAA – MM/AAAA` (ou "Atual"), ordem cronológica inversa dentro de cada seção.
- **Bullets:** começar com verbo de ação no passado (3ª pessoa não; "Liderei", "Reduzi", "Implantei"); 1 linha ideal, máximo 2; máx. 6 bullets por cargo; sem ponto final.
- **Resumo Profissional:** 3–4 linhas, contendo o título da vaga-alvo, anos de experiência e 2–3 competências centrais que já constam no currículo.
- **Habilidades:** lista separada por vírgula, agrupada em "Técnicas" e "Comportamentais". Só o que existe no currículo ou é comprovado por uma bullet existente.
- **Densidade de palavra-chave:** no máximo 3 repetições de um mesmo termo no documento, sempre dentro de frase com sentido. Se o termo não existir de forma nenhuma no histórico, **não inserir**: listar em "Lacunas a preencher pelo candidato".
- **Sem embelezamento:** sem sinônimos inflados ("visionário", "guru"), sem adjetivos vazios, sem "responsável por".
- Preservar nomes próprios, empresas, cargos reais e números originais. Corrigir apenas gramática, ordem e clareza.
- Onde faltar métrica, inserir o marcador `[métrica: ex. %]` e listar em "Pendências do candidato" (nunca inventar número).

### 11. Guardrails (inegociáveis)

1. **Zero invenção.** Se a informação não está no currículo, ela não entra na saída. Sem exceção. Essa regra é **escrita na própria interface** (seção 7), não só seguida em silêncio.
2. **Diff sempre visível.** Toda alteração é apresentada como adição (verde), remoção (vermelho) ou movida, com aceite individual.
3. **Nada de nota sem evidência.** Toda perda de ponto aponta o trecho ou a ausência.
4. **PII:** o arquivo do currículo é processado no navegador e nunca armazenado; o texto é guardado cifrado em repouso do Supabase com RLS por `user_id`; retenção de 30 dias com exclusão automática e botão "Apagar meus dados" (LGPD). Checkbox de consentimento antes da primeira análise.
5. **Sem promessa de aprovação.** Nenhum texto afirma que o usuário "vai passar" no ATS.
6. **Limite de tamanho:** currículo até 15.000 caracteres, vaga até 20.000. Acima disso, bloquear com mensagem clara.

### 12. Contratos de IA (edge functions)

**`POST /analyze/extract-jd`** — entrada `{jobText}`. Saída JSON estrita:
```json
{"title":"...","seniority":"junior|pleno|senior|especialista|gerencia","requirements":[{"term":"...","type":"hard_skill","obligatoriness":"must_have","evidence":"trecho da vaga"}],"responsibilities":["..."],"company":"...","location":"..."}
```
Prompt: *"Extraia requisitos da vaga. Não invente requisitos que não estão no texto. Classifique obrigatoriedade pelas regras dadas. Responda apenas JSON válido, sem markdown."* Temperatura 0.2.

**`POST /rewrite/section`** — entrada `{sectionName, sectionText, jobTitle, keywords[], pendencies[]}`. Saída `{rewritten, changes:[{type:"added|removed|moved", before, after, reason}], pendencies[]}`.
Prompt: *"Reescreva mantendo 100% dos fatos. Proibido criar empresas, cargos, datas, métricas, formações ou certificações. Se faltar métrica, use o marcador [métrica: ex. %]. Máx. 6 bullets por cargo, cada uma com até 2 linhas iniciando por verbo de ação no passado. Responda apenas JSON válido."* Temperatura 0.3.

**`POST /analyze/score-explain`** — recebe os pontos já calculados e devolve texto explicando cada perda de ponto (nunca recalcula a nota).

Toda resposta de IA passa por validação de schema (zod). Em falha: 1 retry com o erro no prompt; depois erro amigável.

### 13. Modelo de dados + RLS

```sql
profiles(id uuid pk, email, full_name, plan text default 'free', analyses_this_month int default 0, created_at)
analyses(id uuid pk, user_id uuid fk, cv_text text, job_text text, job_title text,
         score jsonb, keywords jsonb, format_checks jsonb, rewrite jsonb,
         score_before int, score_after int, status text, created_at, expires_at)
events(id uuid pk, user_id uuid, name text, props jsonb, created_at)
```
RLS: `user_id = auth.uid()` em select/insert/update/delete. Nenhuma tabela legível por `anon`. Edge functions com service role apenas para expurgo de dados expirados.

### 14. Exportação

- **.docx** via `docx`: estilos `Normal` 11pt, sem tabelas, sem header/footer, headings como parágrafo em negrito (não como estilo Heading, que alguns ATS ignoram), bullets como parágrafo com "• ". Nome do arquivo: `Nome-Sobrenome-Cargo.docx`.
- **.pdf**: abrir rota `/app/analise/:id/print` com CSS `@media print` (A4, margem 1,8 cm, fonte 11pt, preto sobre branco), instrução "Salvar como PDF". Sem nenhum elemento de UI na impressão.
- **.txt**: texto puro com quebras de linha duplas entre seções.
- Antes de exportar: checklist "Pronto para ATS?" com os 10 itens de formato.

### 15. Estados, erros e limites

- Vazio: ilustração leve + "Cole a vaga para começar".
- Carregando: skeleton nomeado por etapa, nunca spinner genérico sem contexto.
- Erro de upload: "Não conseguimos ler este PDF. Ele parece ser uma imagem digitalizada. Cole o texto ou envie um DOCX."
- Erro de IA: mensagem + botão "Tentar novamente", preservando os textos já inseridos.
- Limite de plano: paywall suave ("Você usou suas 3 análises deste mês") com opção de exportar as anteriores.
- Sucesso: toast com ação "Ver diff".

### 16. Analytics (nomes fixos)

`analysis_started`, `cv_uploaded`, `cv_pasted`, `jd_pasted`, `jd_url_fetched`, `analysis_completed` (props: score, missing_must_have, parseable), `rewrite_section_accepted`, `rewrite_section_rejected`, `export_clicked` (props: format), `plan_limit_hit`, `data_deleted`.

### 17. Acessibilidade e responsividade

WCAG AA (contraste ≥4.5:1), navegação 100% por teclado, `focus-visible` visível, `aria-live="polite"` ao terminar a análise, anel de nota com `role="img"` e `aria-label="Compatibilidade: 72 de 100"`, chips com texto + ícone (nunca só cor), `prefers-reduced-motion` respeitado, alvos de toque ≥44px. Quebrar em 1 coluna abaixo de 768px (diff vira abas "Antes"/"Depois").

### 18. Critérios de aceite (testar antes de dizer que terminou)

1. Envio de um PDF de 1 página com texto selecionável produz análise com nota, 6 critérios e evidência em todos.
2. Envio de PDF escaneado mostra o erro específico da seção 15, sem travar o fluxo.
3. Uma vaga com 12 requisitos gera lista de keywords com status correto e ordenação por impacto.
4. A reescrita nunca contém empresa, data ou número que não exista no currículo original (testar com um currículo fictício sem métricas).
5. A nota é idêntica em duas execuções com os mesmos insumos (determinismo dos pesos).
6. .docx abre no Word sem tabelas/colunas e mantém a ordem das seções.
7. Impressão em PDF sai em preto e branco, uma coluna, sem elementos de UI.
8. Nenhuma rota de outra pessoa é acessível trocando o `:id` na URL (RLS testada).
9. Fluxo completo funciona em 375px de largura.
10. Nenhuma string de UI fora do arquivo de i18n.

### 19. Plano de execução (faça nesta ordem, pare e me avise entre fases)

1. **Fundação:** projeto, design tokens, componentes base (Button, Card, Input, Textarea, Badge, Tabs, Dialog), shell de navegação, rotas vazias, i18n.
2. **Entrada:** wizard 3 passos + upload com extração no navegador + validação de tamanho.
3. **Motor:** edge functions de extração de vaga, cálculo determinístico da nota, tela de diagnóstico.
4. **Reescrita:** diff por seção, aceite individual, recalcular nota.
5. **Entrega:** exportação docx/pdf/txt, histórico, auth, limites de plano, LGPD.

### 20. O que NÃO fazer

- Não usar gradiente, glassmorphism, roxo, sombra pesada ou "dashboard cyberpunk".
- Não usar imagens de banco de imagens genérico (aperto de mão, pessoas em reunião).
- Não gerar texto de IA diretamente na tela sem passar pela validação de schema.
- Não deixar a IA calcular a nota.
- Não armazenar o arquivo original do currículo.
- Não criar funcionalidades da fase 2 sem eu pedir.
- Não reescrever o design system por conta própria.

Comece pela fase 1 e me mostre o resultado antes de seguir.
