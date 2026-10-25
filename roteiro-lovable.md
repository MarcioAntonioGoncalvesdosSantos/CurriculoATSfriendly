# Roteiro do Lovable — Radar ATS

Sequência de mensagens para construir a aplicação fase por fase, com o que verificar antes de seguir. Cada bloco em cinza é para **copiar e colar** no chat do Lovable.

**Arquivos de referência:** [`mega-prompt.md`](./mega-prompt.md) · [`design-system.md`](./design-system.md)

---

## Regras de ouro do chat

1. **Uma mensagem, um objetivo.** "Adicione exportação em DOCX" funciona; "melhore o app" não.
2. **Modo *Plan* para lógica, modo *Build* para tela.** Regra de nota, edge function e contrato de IA se discutem no plano antes de gerar código.
3. **Ajuste visual: selecione o elemento na tela** e peça a mudança só nele. Nunca peça "refaça a página".
4. **Diga o que NÃO fazer.** Toda mensagem de tela termina com "sem gradiente, sem roxo, sem sombra".
5. **Se ele ignorar uma regra, repita a regra na mensagem seguinte** com a palavra *obrigatório*. O contexto longo se perde entre mensagens.
6. **Teste com um currículo real antes de avançar de fase.** Fase que passa no teste e falha no currículo verdadeiro custa o dobro depois.

**Currículo de teste:** use o seu, em PDF. **Vaga de teste:** uma real, com pelo menos 10 requisitos.

---

## Fase 0 — Preparação

**Antes:** conta no Lovable aberta, créditos do dia disponíveis. Crie o projeto com o nome **Radar ATS**.

**Mensagem 0 — contrato do produto:**

```
Vou construir o "Radar ATS": um app que compara um currículo com a descrição
de uma vaga e devolve (a) um diagnóstico de compatibilidade ATS e (b) uma
versão reescrita do currículo, ATS-friendly.

Regras que valem para o projeto inteiro, e são obrigatórias:
1. A nota ATS (0 a 100) é calculada em código, com pesos fixos. A IA nunca
   calcula a nota; ela só extrai requisitos da vaga e reescreve seções.
2. A IA nunca cria empresa, cargo, data, formação, certificação ou número que
   não exista no currículo original. Quando faltar uma métrica, insere o
   marcador [métrica: ex. %] e lista como pendência.
3. Interface 100% em português do Brasil.
4. Estética sóbria de instrumento de medição: sem gradiente, sem glassmorphism,
   sem roxo, uma sombra por tela.
5. Stack: React + Vite + TypeScript + Tailwind + shadcn/ui + lucide-react.
6. Toda chamada de IA passa por edge function. Nenhuma chave de API no client.

Antes de gerar código, responda em 5 linhas como você entendeu essas regras.
```

**Verificar:** a resposta repete as 6 regras, sem inventar funcionalidade nova. Se ele propuser login, dashboard ou banco de dados agora, responda: `Só a fundação. Login e dashboard ficam para o fim.`

---

## Fase 1 — Fundação (tokens, shell, rotas)

**Mensagem 1.1 — design system:**

```
Aplique exatamente este design system. Não invente cores, fontes ou sombras.

Cole no index.css (formato shadcn/ui, HSL):

[cole o bloco :root e .dark da seção 2.2 de design-system.md]

Fontes do Google Fonts: Sora (600,700) para títulos, Inter (400,500,600)
para texto, JetBrains Mono (400,500) para números e palavras-chave.

Escala: 12/14/16/18/22/28/38/48 px. Raio 10px em card, 6px em input.
Sombra permitida: 0 2px 8px rgba(10,22,32,0.06) e 0 12px 32px rgba(10,22,32,0.10).
Container máximo 1120px. Sem gradiente, sem roxo.
```

**Mensagem 1.2 — shell e rotas:**

```
Crie o shell do app com estas rotas vazias (só o esqueleto, cada uma com um
título temporário): /, /auth, /app, /app/nova, /app/analise/:id, /app/conta.

O shell tem: header com logo "Radar ATS" à esquerda e navegação "Nova análise"
+ "Histórico" + avatar à direita. Em mobile, header compacto com menu.
Fundo do app em bg-background, cards em bg-card com border e rounded-[10px].
Nenhum texto solto em componente: crie src/i18n/pt-BR.ts e importe de lá.
```

**Verificar nesta fase:**
- [ ] `index.css` tem os dois blocos de tokens (`:root` e `.dark`), sem hex solto nos componentes.
- [ ] As três fontes carregam (inspecionar a aba Network ou o texto renderizado).
- [ ] As 6 rotas abrem sem erro no console.
- [ ] Alternar para dark mode não deixa nenhum texto ilegível.
- [ ] Em 375px de largura não há rolagem horizontal.

**Se falhar:** `As cores estão hardcoded. Troque todo hex por tokens (bg-primary, text-muted-foreground, border-border). Obrigatório: nenhum #hex fora de index.css.`

---

## Fase 2 — Entrada (wizard de 3 passos)

**Mensagem 2.1 — wizard:**

```
Construa o wizard de /app/nova com 3 passos e barra de progresso (números
1-2-3, etapa atual destacada, aria-current="step").

Passo 1: upload de currículo. Passo 2: descrição da vaga. Passo 3:
processando, com etapas nomeadas ("Extraindo texto", "Lendo a vaga",
"Cruzando requisitos", "Calculando nota").

O rascunho dos dois textos persiste em sessionStorage (sobrevive a F5).
Botão "Voltar" sempre ativo. Não usa spinner genérico: usa skeleton.
```

**Mensagem 2.2 — leitura do arquivo no navegador:**

```
No passo 1, leia o arquivo no navegador: PDF com pdfjs-dist, DOCX com mammoth.
O arquivo nunca é enviado para o servidor; só o texto extraído é usado.

Validações obrigatórias:
- Currículo: até 15.000 caracteres. Vaga: até 20.000.
- Se o PDF não tiver texto selecionável (digitalizado), mostrar exatamente:
  "Não conseguimos ler este PDF. Ele parece ser uma imagem digitalizada.
   Cole o texto ou envie um DOCX."
- Sempre oferecer a alternativa "ou cole o texto".
- Limpar o texto extraído (espaços duplicados, hífens de quebra de linha).

Dropzone: borda tracejada, estado arrastando, estado de erro em vermelho com
ícone e a mensagem acima. Sem ilustração 3D.
```

**Mensagem 2.3 — vaga por URL:**

```
No passo 2, aceitar colar a descrição OU colar a URL do anúncio. Para a URL,
buscar a página por edge function, extrair o texto do corpo e descartar
menu, rodapé e cookies. Se a extração falhar, cair para o modo colar com a
mensagem: "Não conseguimos ler esta página. Cole o texto da vaga."
```

**Verificar nesta fase:**
- [ ] Seu currículo em PDF entra e o texto aparece legível no passo 1.
- [ ] Um print de PDF escaneado dispara a mensagem correta (teste com `Currículo` exportado como imagem).
- [ ] Recarregar a página no meio do wizard não apaga o que já foi colado.
- [ ] Colar 25.000 caracteres de vaga bloqueia com mensagem clara.
- [ ] A URL de uma vaga real (Gupy ou LinkedIn) traz o texto sem o menu.

**Se falhar:** `A extração de PDF está indo para o servidor. Obrigatório: processar pdfjs-dist no client e enviar só o texto.`

---

## Fase 3 — Motor de análise (a fase crítica — use o modo *Plan*)

**Mensagem 3.1 — extração da vaga:**

```
Crie a edge function POST /analyze/extract-jd.
Entrada: { jobText }.
Saída: JSON estrito, validado com zod:
{ title, seniority, company, location,
  requirements: [{ term, type, obligatoriness, evidence }] }

type: hard_skill | soft_skill | ferramenta | idioma | certificacao | senioridade
obligatoriness: must_have | nice_to_have

Regras de classificação:
- must_have: está no bloco de requisitos, OU aparece 2+ vezes, OU vem com
  "obrigatório/imprescindível/necessário".
- nice_to_have: "desejável/diferencial/plus".
- Na dúvida, nice_to_have.
- Não inventar requisito que não está no texto. Cada requirement traz o
  trecho da vaga que o sustenta em "evidence".
Temperatura 0.2. Se a validação do schema falhar, 1 retry com o erro no
prompt; depois erro amigável.
```

**Mensagem 3.2 — cálculo determinístico:**

```
Implemente o cálculo da nota em código puro (sem IA), em src/lib/score.ts,
com estas funções puras e testáveis:

normalize(text): minúsculas, sem acento, sem pontuação, singular/plural.
Sinônimos: js<->javascript, power bi<->powerbi, gestão de pessoas<->
liderança de equipe. Match exato primeiro, depois aproximado >= 0.88.

Pesos (somam 100):
- palavras-chave obrigatórias: 30 (must_have vale 2, nice_to_have vale 1)
- formato/parseabilidade: 20 (10 checagens binárias, 2 pontos cada)
- resultados quantificados: 15 (% de bullets com número, %, R$, tempo, volume)
- cargo e senioridade: 12
- estrutura e seções: 13
- clareza das bullets: 10

Cada critério retorna { criterio, pontos, pontos_max, evidencia[] }.
Toda perda de ponto precisa de evidência: o trecho citado ou a ausência
explícita. A mesma entrada tem que gerar sempre a mesma nota.
```

**Mensagem 3.3 — tela de diagnóstico:**

```
Construa /app/analise/:id com quatro blocos:
1. ScoreRing: anel SVG 160px, traço 12px, número em JetBrains Mono 56px,
   rótulo por faixa (menor que 50 "Precisa de ajustes", 50-74 "Quase lá",
   acima de 75 "Competitivo"). role="img" com aria-label.
2. Os 6 critérios em barras horizontais com valor "x/y" e, ao expandir,
   a evidência citada entre aspas.
3. Palavras-chave em chips com ícone: presente (Check, verde), parcial
   (Minus, âmbar), ausente (X, vermelho). Nunca só cor. Agrupadas em
   "Must-have ausentes", "Nice-to-have ausentes", "Presentes".
4. Faixa fixa: "Reescrevemos a forma, nunca os fatos. Nenhuma empresa, data,
   formação ou número é inventado." com ícone ShieldCheck.

Abaixo da nota, em texto pequeno: "Notas ATS variam por sistema. Este é um
diagnóstico de compatibilidade, não uma garantia."
```

**Verificar nesta fase:**
- [ ] A vaga de teste com 12 requisitos devolve must_have e nice_to_have coerentes.
- [ ] Rodar a mesma análise duas vezes gera **exatamente** a mesma nota.
- [ ] Todos os 6 critérios mostram evidência (nenhum "0 pontos" sem explicação).
- [ ] Clicar num chip ausente mostra onde ele deveria entrar.
- [ ] A faixa do guardrail aparece na tela de resultado.
- [ ] Nenhuma nota é pedida à IA no código (procurar por "score" nos prompts).

**Se falhar:** `A nota está sendo pedida ao modelo. Obrigatório: a nota vem de src/lib/score.ts, com os pesos fixos. A IA só extrai requisitos.`

---

## Fase 4 — Reescrita com diff

**Mensagem 4.1 — contrato da reescrita:**

```
Crie a edge function POST /rewrite/section.
Entrada: { sectionName, sectionText, jobTitle, keywords[], pendencies[] }
Saída validada com zod:
{ rewritten, changes: [{ type: "added"|"removed"|"moved", before, after,
  reason }], pendencies[] }

Regras obrigatórias da reescrita:
- Preservar 100% dos fatos. Proibido criar empresa, cargo, data, formação,
  certificação ou número.
- Se faltar métrica, usar [métrica: ex. %] e devolver em pendencies.
- Máximo 6 bullets por cargo, cada uma com até 2 linhas, começando por verbo
  de ação no passado. Sem "responsável por".
- Headings padrão: Resumo Profissional, Experiência Profissional, Formação
  Acadêmica, Habilidades, Idiomas, Certificações. Nunca criar seção vazia.
- Palavra-chave repetida no máximo 3 vezes no documento.
- Se o termo da vaga não tiver lastro nenhum no currículo, NÃO inserir:
  devolver em pendencies como "lacuna a preencher".
Temperatura 0.3. Responder apenas JSON válido.
```

**Mensagem 4.2 — tela de diff:**

```
Na aba "Reescrita", mostre antes e depois lado a lado em telas acima de
1024px e em abas "Antes"/"Depois" abaixo disso.
Adição em verde com prefixo +, remoção em vermelho com prefixo -.
Cada bloco tem o motivo da mudança e os botões "Aceitar" e "Recusar".
Contador fixo no topo: "7 de 12 seções aceitas".
Depois de aceitar, recalcular a nota e mostrar o delta (72 -> 90) em pílula
verde com seta.
Nada é aplicado sem aceite.
```

**Verificar nesta fase — o teste que mais importa:**
- [ ] Use um currículo **sem nenhum número**. A saída não pode conter percentual ou valor inventado: precisa sair `[métrica: ex. %]`.
- [ ] Nenhuma empresa, cargo ou data nova aparece no "depois" (comparar linha a linha).
- [ ] Cada bloco tem motivo; o botão Recusar mantém o texto original.
- [ ] A nota depois do aceite muda e o delta aparece.
- [ ] Um termo da vaga sem lastro nenhum vai para pendências, não para o currículo.

---

## Fase 5 — Entrega (exportação, histórico, conta)

**Mensagem 5.1 — exportação:**

```
Adicione a exportação do currículo em três formatos:
- DOCX com a lib docx, gerado no client: sem tabela, sem header/footer,
  headings como parágrafo em negrito, bullets como "• ", fonte Arial 11pt.
  Nome do arquivo: Nome-Sobrenome-Cargo.docx
- PDF pela rota /app/analise/:id/print com @media print: A4, margem 1,8cm,
  11pt, preto no branco, coluna única, sem nenhum elemento de interface.
  Instrução na tela: "Salvar como PDF".
- TXT em texto puro, quebras duplas entre seções.

Antes de exportar, mostrar o checklist "Pronto para ATS?" com os 10 itens de
formato e marcar o que passa.
```

**Mensagem 5.2 — histórico, conta e limites:**

```
Adicione o histórico em /app (lista das análises: vaga, nota, data, ações),
o plano free com 3 análises por mês (paywall suave, sem bloquear a exportação
das anteriores) e a página /app/conta com "Apagar meus dados", que remove
todos os registros do usuário.

Ative RLS em todas as tabelas: cada linha só é visível para o próprio
user_id (auth.uid()). Nenhuma tabela acessível por anon.
```

**Verificar nesta fase:**
- [ ] O `.docx` abre no Word/LibreOffice sem tabela e na ordem correta das seções.
- [ ] O PDF impresso sai em preto e branco, uma coluna, sem cabeçalho nem botão.
- [ ] Trocar o `:id` da URL de outra conta não abre a análise (RLS).
- [ ] "Apagar meus dados" remove tudo e a conta volta ao estado inicial.
- [ ] Nenhum `grep` no código encontra chave de API exposta no client.

---

## Fase 6 — Publicação e entrega do desafio

**Mensagem 6.1 — refinamentos finais** (um por mensagem):

```
1. "Aumente o espaçamento entre o ScoreRing e os critérios para 32px."
2. "No mobile, transforme os chips de palavra-chave em lista de duas linhas."
3. "Adicione estado vazio no histórico: 'Nenhuma análise ainda. Cole uma vaga para começar.'"
```

**Publicar:**
1. *Publish* → nome **Radar ATS**, descrição com a promessa do produto, imagem social.
2. Abrir o endereço em **aba anônima** (é assim que o avaliador vê).
3. Testar o fluxo inteiro logado de fora: colar vaga → colar currículo → nota → reescrita → exportar.
4. *GitHub → Connect* para o código descer para o repositório.
5. Preencher o endereço na seção 2 do [`README.md`](./README.md).

**Evidências para o README** (o que mais pesa na avaliação):

| Print | O que deve aparecer |
|---|---|
| Análise | ScoreRing com nota, faixa, 6 critérios com evidência |
| Palavras-chave | Chips com presente/ausente e o agrupamento must-have |
| Reescrita | Diff antes/depois com motivo e contador de aceites |
| Antes e depois | Delta da nota (ex.: 72 → 90) |
| Exportação | Checklist "Pronto para ATS?" e o PDF gerado aberto |

Salve em `docs/prints/` e referencie na seção 2 do README.

---

## Ordem de sacrifício (se o crédito acabar)

Se o Lovable cortar créditos no meio, essa é a ordem em que se entrega algo apresentável:

1. **Fase 3** (nota + palavras-chave) — é o núcleo do desafio.
2. **Fase 2** (entrada) — sem ela o núcleo não é usável.
3. **Fase 1** (fundação) — já vem antes por dependência.
4. **Fase 4** (reescrita) — o diferencial, mas o diagnóstico já sustenta a entrega.
5. **Fase 5** (exportação) — o PDF é o item que o desafio cita explicitamente.
6. **Fase 6** (refinamentos) — o último polimento, nunca antes do núcleo.

Uma aplicação pequena, publicada e bem explicada vale mais que uma ambiciosa que ninguém consegue abrir.
