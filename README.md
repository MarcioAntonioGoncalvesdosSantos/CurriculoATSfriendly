# CurriculoATSfriendly — Radar ATS

Uma aplicação web que compara um currículo com uma vaga e devolve uma versão ATS friendly desse currículo. ATS é o *Application Tracking System*, o sistema que ranqueia candidatos antes de qualquer pessoa do RH ler alguma coisa.

Este repositório é o pacote de especificação para construir o app no [Lovable](https://lovable.dev). O produto entrega:

1. **Diagnóstico de compatibilidade ATS** (nota 0–100 com 6 critérios e evidências);
2. **Versão reescrita do currículo**, ATS-friendly, em coluna única, sem inventar nenhuma informação;
3. **Exportação** em `.docx`, `.pdf` e `.txt`.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| [`01-mega-prompt.md`](./01-mega-prompt.md) | Prompt completo do produto: escopo, motor de análise com pesos, regras ATS, guardrails anti-alucinação, contratos de IA, modelo de dados, critérios de aceite e plano de execução em 5 fases. |
| [`02-design-system.md`](./02-design-system.md) | Design system: paleta e tokens (HSL/shadcn, claro e escuro), tipografia, espaçamento, componentes-âncora (`ScoreRing`, `KeywordChip`, `DiffViewer`…), microcopy, acessibilidade e CSS de impressão. |

## Como usar no Lovable

1. Crie um projeto novo e cole o conteúdo de `01-mega-prompt.md` na primeira mensagem.
2. Na mensagem seguinte, cole `02-design-system.md` e escreva: *"Aplique exatamente estes tokens. Não invente cores."*
3. Se a mensagem for cortada, siga as fases da seção 19 do mega prompt, uma por vez.

## Ideia central

A nota é **calculada em código**, com pesos fixos e auditáveis. A IA só extrai requisitos da vaga e reescreve seções — nunca atribui nota e nunca cria experiência, empresa, data, formação ou número que não esteja no currículo original.
