# CurriculoATSfriendly — Radar ATS

Aplicação web que compara um currículo com a descrição de uma vaga e devolve uma versão **ATS friendly** desse currículo. ATS é o *Application Tracking System*: o software que lê, ranqueia e descarta candidatos antes de qualquer pessoa do RH abrir o arquivo.

Desafio DIO "Entendendo o Desafio ATS Friendly" · construído no [Lovable](https://lovable.dev).

---

## 1. O problema que a aplicação resolve

Um currículo pode estar impecável para um humano e ilegível para a máquina: duas colunas, tabela, foto, contato no cabeçalho, "Responsável por…" sem resultado nenhum. O ATS não lê o PDF como uma pessoa lê — ele extrai texto na ordem em que foi desenhado na página. Quando a extração sai embaralhada, o candidato é eliminado por um motivo que nunca vai descobrir.

A aplicação resolve esse ponto cego com quatro respostas objetivas:

1. **Quanto** o currículo casa com aquela vaga específica (nota de 0 a 100);
2. **Quais** palavras-chave da vaga aparecem no currículo e **quais faltam**;
3. **O que** no formato está atrapalhando a leitura automática;
4. **Como** ficaria a versão ajustada, pronta para exportar.

A regra que atravessa o produto inteiro, e que está escrita na própria interface:

> **Reescrevemos a forma, nunca os fatos.** O ajuste reorganiza e prioriza o que já existe no currículo. Nenhuma empresa, data, formação ou número é inventado.

---

## 2. Aplicação publicada

> **Endereço:** `https://[seu-projeto].lovable.app` — preencher após o Publish no Lovable.

O build e a publicação acontecem na conta do autor no Lovable (seção 7). O repositório é a especificação completa usada para gerar a aplicação e o lugar onde o código exportado pelo Lovable vai morar.

---

## 3. O mega prompt usado

**Arquivo:** [`mega-prompt.md`](./mega-prompt.md) · versão final 2.0

O prompt é autossuficiente e descreve o produto inteiro em 20 seções: promessa, persona, escopo do MVP, stack, telas, motor de nota, regras ATS, guardrails, contratos de IA, modelo de dados, acessibilidade e critérios de aceite. A paleta e os componentes vêm de um segundo arquivo, [`design-system.md`](./design-system.md), colado junto para o Lovable não improvisar cor.

### O que mudou do rascunho (1.0) até a versão final (2.0)

| # | Mudança | Por quê |
|---|---|---|
| 1 | A nota passou a ser **calculada em código**, com 6 critérios e pesos fixos que somam 100. A IA só extrai requisitos e reescreve. | Na v1 a IA dava a nota. Duas execuções com o mesmo currículo davam notas diferentes, e não havia como explicar de onde saiu o número. Diagnóstico precisa ser reprodutível. |
| 2 | Cada critério passou a exigir **evidência citável** (o trecho do currículo, ou a ausência explícita). | "Faltam 3 pontos" sem apontar onde é inútil para quem vai corrigir. |
| 3 | Entrou a **lista de 10 checagens binárias de formato**, valendo 20 pontos. | É o problema número 1 do ATS (layout), e o único que o usuário conserta em 2 minutos. Ficava escondido atrás da análise de palavras-chave. |
| 4 | Guardrail **anti-alucinação** virou regra numerada e foi para a interface, com faixa fixa na tela de resultado e ao lado do botão de exportar. | O risco real do produto é inventar experiência para preencher lacuna de vaga. O alerta na tela protege o usuário e educa sobre o limite da ferramenta. |
| 5 | Onde falta métrica, a saída usa o marcador `[métrica: ex. %]` em vez de estimar. | Impede que o modelo "arredonde" um resultado que não existe. Vira pendência do candidato. |
| 6 | **Diferença (diff) obrigatória** por seção, com aceite individual. | O usuário precisa aprovar cada mudança; sem isso a reescrita é uma caixa-preta. |
| 7 | A extração de PDF/DOCX passou a acontecer **no navegador**. O arquivo não sobe; só o texto vai para o servidor. | Currículo é dado pessoal (LGPD). Subir o arquivo sem necessidade é risco jurídico e de confiança. |
| 8 | Entraram **limites e estados de erro explícitos** (PDF escaneado, teto de caracteres, limite do plano free). | Todo teste com PDF escaneado travava o fluxo com erro genérico. |
| 9 | O escopo ganhou a prioridade "núcleo primeiro": colar vaga → colar currículo → match → exportar. Login, dashboard e integrações ficaram no fim. | É o que o desafio pede e o que cabe em créditos diários. |
| 10 | O design system virou arquivo separado, com tokens em HSL no formato shadcn/ui. | Colar tudo num prompt só fazia o Lovable inventar cores nas telas secundárias. |

---

## 4. Como a análise funciona

Do texto da vaga até o currículo ajustado, em cinco etapas. Detalhe completo no [`mega-prompt.md`](./mega-prompt.md).

### Etapa 1 — Entrada

- **Vaga:** colar o texto do anúncio ou colar a URL (o texto é extraído da página).
- **Currículo:** upload de PDF/DOCX, processado no navegador com `pdfjs-dist` e `mammoth`, ou texto colado direto.
- Limites: 20.000 caracteres de vaga, 15.000 de currículo. PDF digitalizado (imagem) é detectado e o app orienta a colar o texto.

### Etapa 2 — Extração dos requisitos da vaga

A IA transforma a vaga em JSON estrito: cargo, senioridade, requisitos com tipo (`hard_skill`, `ferramenta`, `idioma`, `certificação`, `senioridade`) e obrigatoriedade.

- `must_have`: está no bloco de requisitos, ou aparece 2+ vezes, ou vem com "obrigatório/imprescindível/necessário".
- `nice_to_have`: "desejável", "diferencial", "plus" — e todo caso ambíguo.

### Etapa 3 — Cruzamento e nota

Todo texto é normalizado (minúsculas, sem acento, sem pontuação, singular/plural) e comparado com dicionário de sinônimos (`js` ↔ `javascript`, `power bi` ↔ `powerbi`) e match aproximado ≥ 0,88.

| Critério | Peso | Como é medido |
|---|---|---|
| Palavras-chave obrigatórias | 30 | cobertura ponderada — `must_have` vale 2, `nice_to_have` vale 1 |
| Formato / parseabilidade | 20 | 10 checagens binárias de 2 pontos cada |
| Resultados quantificados | 15 | % de bullets com número, %, R$, tempo ou volume |
| Aderência de cargo e senioridade | 12 | título do currículo × título da vaga + anos de experiência |
| Estrutura e seções | 13 | seções padrão presentes + ordem cronológica inversa |
| Clareza das bullets | 10 | verbo de ação no início, 1–2 linhas, sem "responsável por" |

Nota = soma dos pontos. Faixas: **< 50** "Precisa de ajustes" · **50–74** "Quase lá" · **≥ 75** "Competitivo".

As 10 checagens de formato: texto selecionável · sem tabela/coluna/caixa de texto · contato no corpo e não no cabeçalho · fonte padrão · sem foto, ícone ou barra de habilidade · datas em MM/AAAA e ordem cronológica inversa · headings com nome padrão · 1–2 páginas · arquivo nomeado `Nome-Sobrenome-Cargo.pdf` · sem "referências disponíveis a pedido".

### Etapa 4 — Reescrita

Seção por seção, com contrato de IA rígido: coluna única, headings padrão, contato em duas linhas no topo do corpo, bullets iniciando por verbo de ação no passado, máximo 6 por cargo, palavra-chave repetida no máximo 3 vezes e sempre dentro de frase com sentido.

O que a IA **não pode**: criar empresa, cargo, data, formação, certificação ou número. Se o termo da vaga não tiver lastro nenhum no histórico, ele não entra no currículo — vai para a lista de "lacunas a preencher pelo candidato".

A tela mostra antes × depois em diff: adição em verde, remoção em vermelho, motivo da mudança em cada bloco e aceite individual. A nota é recalculada e o delta aparece (`72 → 90`).

### Etapa 5 — Exportação

- `.docx` gerado no cliente com a lib `docx`: sem tabela, sem cabeçalho, headings como parágrafo em negrito.
- `.pdf` pela rota de impressão com CSS dedicado: A4, margem 1,8 cm, 11 pt, preto no branco, coluna única.
- `.txt` em texto puro.
- Antes de exportar, um checklist "Pronto para ATS?" com os 10 itens de formato.

---

## 5. Ajustes pedidos depois da primeira geração

O Lovable entrega uma versão em 30–60 segundos, e o refinamento é onde o produto fica bom. Técnica usada: selecionar o elemento na tela e pedir a mudança só nele, em vez de redesenhar a página inteira.

### Registro

| # | Pedido ao Lovable | Motivo | Status |
|---|---|---|---|
| 1 | Exportação do currículo em PDF a partir de rota própria de impressão | O PDF nativo saía com dois níveis de layout, e o ATS lia a ordem errada das colunas | planejado |
| 2 | Botão de exportar também em `.docx` | Recrutador e candidato costumam editar antes de enviar | planejado |
| 3 | Faixa "Reescrevemos a forma, nunca os fatos" fixa na tela de resultado | Guardrail visível, não só no prompt | planejado |
| 4 | Barra de progresso nomeada por etapa no lugar do spinner | Espera de 15 s sem contexto parece travamento | planejado |
| 5 | Chips de palavra-chave com ícone além da cor | Cor sozinha não comunica estado e falha em daltonismo | planejado |
| 6 | Mensagem específica para PDF escaneado | O erro genérico não dizia o que fazer | planejado |

> Preencher a coluna **Status** com "feito em …" conforme cada ajuste for aplicado no Lovable, junto do print correspondente.

---

## 6. Estrutura do repositório

```
.
├── README.md          este arquivo
├── mega-prompt.md     prompt completo usado no Lovable (v2.0)
├── design-system.md   tokens de cor, tipografia, componentes e CSS de impressão
├── roteiro-lovable.md mensagens fase a fase, com o que verificar em cada etapa
└── .gitignore
```

O código da aplicação passa a viver aqui quando for exportado pelo Lovable (GitHub → Connect).

---

## 7. Como a aplicação é construída e publicada

O passo a passo completo, mensagem por mensagem, está em [`roteiro-lovable.md`](./roteiro-lovable.md). Resumo:

1. **Criar o projeto** no Lovable e colar [`mega-prompt.md`](./mega-prompt.md) na primeira mensagem. O modo *Plan* mostra a abordagem antes de gerar; o modo *Build* executa direto.
2. **Colar [`design-system.md`](./design-system.md)** na mensagem seguinte com a instrução: *"Aplique exatamente estes tokens. Não invente cores."*
3. **Refinar** com a seleção de elemento na tela, registrando cada pedido na seção 5.
4. **Publicar** em *Publish*: nome, descrição, imagem social. O endereço vai para a seção 2.
5. **Conectar o GitHub** para o código descer para este repositório.
6. **Adicionar os prints** da análise e um exemplo de uso neste README.

---

## 8. Checklist do desafio

- [x] Repositório na conta do autor e público — [github.com/MarcioAntonioGoncalvesdosSantos/CurriculoATSfriendly](https://github.com/MarcioAntonioGoncalvesdosSantos/CurriculoATSfriendly)
- [x] Nenhuma chave, token ou senha versionada (`.gitignore` cobre `.env*` e `node_modules/`)
- [x] Todo arquivo e pasta citado neste README existe e tem conteúdo
- [ ] **Nome do repositório em minúsculas, sem acento** — renomear para `curriculo-ats-friendly` em *Settings → Repository name*
- [ ] Aplicação publicada e abrindo para quem tem o endereço (seção 7)
- [ ] Prints da análise e exemplo de uso anexados
- [ ] Endereço da aplicação preenchido na seção 2

---

## 9. Dados e privacidade (LGPD)

- O arquivo do currículo é lido **no navegador** e não é armazenado; apenas o texto extraído vai para o banco.
- Linhas protegidas por RLS: cada usuário lê e apaga somente os próprios registros.
- Retenção de 30 dias com expurgo automático e botão "Apagar meus dados" na conta.
- Consentimento explícito antes da primeira análise.
- Nenhum texto é usado para treinar modelo.
