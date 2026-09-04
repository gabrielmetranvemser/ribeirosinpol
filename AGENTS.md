<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Este projeto é um MODELO, não um site

É a landing page de campanha eleitoral que vira a de qualquer
candidato. Ao receber a tarefa "personalizar para fulano", **leia
[PERSONALIZAR.md](./PERSONALIZAR.md) inteiro antes de editar qualquer
arquivo** — ele é o roteiro, na ordem, com o que perguntar e o que
nunca inventar.

Existe uma skill para isso: `/personalizar-campanha`.

## As três regras que valem sempre

**1. Motor e maquiagem são separados. Personalizar é mexer só na
maquiagem.**

| | Onde | Muda por campanha? |
|---|---|---|
| **Maquiagem** | `content/`, `data/`, `public/`, o banco | sim, sempre |
| **Motor** | `lib/`, `app/painel/`, `app/g/`, `app/api/`, `components/` | não |

Ao personalizar uma campanha, mexer em `lib/` ou em `components/`
quase sempre significa que a coisa devia ter ido para `content/`. Se
for mesmo necessário, diga por quê no comentário.

**2. Nada que é dado de campanha se inventa.**

Número de urna, CNPJ, número de lei, nome de coligação, endereço do
comitê, votos da eleição passada, data de silêncio eleitoral. Um
número inventado numa página de campanha é problema jurídico, não
erro de digitação. Não preencha: **deixe o campo vazio e pergunte**.
`PENDENCIAS.md` é onde essas perguntas ficam registradas até serem
respondidas.

**3. O site tem que ficar de pé em qualquer estado de preenchimento.**

Campo vazio esconde o bloco; nunca deixa erro, "undefined" ou imagem
quebrada na tela. Ao acrescentar campo, mantenha essa propriedade — é
ela que permite publicar com metade dos dados e completar depois, que
é como toda campanha real funciona.

## Português, e português de gente

Os identificadores, os comentários e os textos deste projeto são em
português. Não é preferência estética: quem edita o painel é um
coordenador de campanha, e o código é lido por quem dá manutenção com
o site já no ar.

Comentário aqui explica **por que**, não o que. O padrão do projeto é
registrar a decisão e o que ela custou — inclusive os erros que
levaram a ela. Não apague esses comentários ao editar em volta.

## Antes de dizer que terminou

```bash
npm run typecheck
npm run build
```

E abrir a página. `npm run dev` e olhar a primeira dobra, `/grupos`,
`/filtro` e `/painel` — quatro telas, dois minutos. Build que passa
com a página quebrada é o caso mais comum aqui, porque quase tudo é
conteúdo.
