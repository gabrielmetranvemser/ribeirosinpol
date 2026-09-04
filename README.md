# LP de campanha — modelo universal

Landing page de campanha eleitoral + gerador de moldura para foto de
perfil + painel de edição, grupos de WhatsApp e métricas.

Serve **qualquer candidato, em qualquer estado**: deputado federal ou
estadual, senador, governador, prefeito, vereador. O que muda por
campanha é conteúdo e cinco cores; o motor é o mesmo.

> **Para personalizar:** [PERSONALIZAR.md](./PERSONALIZAR.md).
> Com o Claude Code, a skill `/personalizar-campanha` executa o
> roteiro conversando.
>
> **Para o banco:** [sql/README.md](./sql/README.md).

---

## Rodar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre em `http://localhost:3000`. Painel em `/painel` (senha em
`PAINEL_SENHA`).

Sem `NEXT_PUBLIC_SUPABASE_URL` o site continua de pé: cai nos dados de
`data/` e nos textos de `content/copy.ts`, e o painel abre em modo de
leitura. **Nada quebra sem banco** — é assim de propósito, para o site
existir antes da infraestrutura.

```bash
npm run uf -- SP     # gera o território da campanha (IBGE)
npm run molduras     # gera as molduras do gerador de foto
npm run sql          # reconstrói sql/01-instalacao.sql
npm run build        # build de produção
npm run typecheck    # tsc --noEmit
```

---

## O que a página faz, em ordem de importância

1. **Colocar a pessoa num grupo de WhatsApp.** É a métrica que decide
   se o projeto valeu.
2. **Ser compartilhada.** A página substitui um PDF. Se não circula,
   falhou.
3. **Convencer.** É o trabalho da copy.

O gerador de moldura serve aos três ao mesmo tempo: cada foto de
perfil trocada é uma peça de campanha circulando de graça, assinada
por alguém que a rede da pessoa conhece.

---

## Os três arquivos que fazem o site ser de outra pessoa

| Arquivo | O que decide |
|---|---|
| **`content/campanha.ts`** | nome, número, cargo, partido, estado, cores, canais. O único obrigatório |
| **`content/copy.ts`** | todo o texto da página. É o estado inicial — o painel sobrescreve sem deploy |
| **`data/municipios.json`** | o território. Gerado por `npm run uf` |

Nenhum componente lê `campanha.ts` direto: eles leem o conteúdo
mesclado, que nasce daí e é sobrescrito pelo banco.

### Motor e maquiagem

`lib/`, `app/g/`, `app/api/` e `app/painel/` são **motor**: se repetem
em qualquer campanha. `content/`, `data/`, `public/` e o que está no
banco são **maquiagem**. Foi construído separado de propósito — em
2028 troca-se a maquiagem.

Personalizar mexendo em `lib/` ou `components/` quase sempre significa
que a coisa devia ter ido para `content/`.

---

## O painel

`/painel`, senha única. Oito telas, cada uma com um dono:

| Tela | O que resolve |
|---|---|
| **Início** | o que bloqueia a publicação, funil do dia, **quais seções ainda estão no texto de fábrica** |
| **Seções** | a página inteira, na ordem em que ela aparece. Dentro de cada seção: textos, imagens e vídeos, com prévia ao vivo e histórico |
| **Vídeos** | todos os espaços de vídeo num lugar só — trabalho de produção, com os arquivos na mão |
| **Identidade** | nome, número, marca, ícone, cartão de compartilhamento e a identificação eleitoral do rodapé |
| **Grupos** | link, situação, fixar, limite de cliques, exportar CSV, gerar QR por município |
| **Métricas** | funil, qual botão trabalha, cliques por município, UTM, celular vs desktop |
| **Tráfego** | pixel da Meta, Conversions API pelo servidor e GTM — com o texto de privacidade pronto para colar quando o pixel for ligado |
| **Buscas** | `sitemap.xml`, `robots.txt` e `llms.txt` com botão de copiar, estado da indexação e verificação do Search Console |

Toda escrita passa por Server Action com sessão conferida. O conteúdo
é versionado: cada salvamento guarda uma cópia integral em
`conteudo_versoes`, e restaurar nunca é destrutivo.

A tela **Início** é o checklist de publicação: ela compara o banco com
`content/copy.ts` e lista o que ainda é texto de modelo.

---

## Estrutura

```
content/
├─ campanha.ts     ★ quem é, onde, cores. O arquivo da campanha
├─ copy.ts           o texto de fábrica — o painel sobrescreve
├─ esquema.ts        descritor dos campos do painel (formulário + validação)
├─ slots.ts          os espaços de imagem, com as exigências de cada um
└─ mapa.ts           costura tudo na ordem da página

data/               municipios · localidades · mapa · grupos.local
                    (gerados por `npm run uf`)
sql/                o banco inteiro, pronto para colar no Supabase
scripts/
├─ gerar-uf.mjs       o território de qualquer UF, do IBGE
├─ gerar-molduras.mjs as molduras com o nome e o número
├─ gerar-sql.mjs      empacota as migrations em um arquivo só
└─ ufs.mjs            as 27 UFs com o código do IBGE

app/
├─ layout.tsx                   fontes, cores da campanha, metadata
├─ page.tsx                     landing page
├─ opengraph-image.tsx          cartão do WhatsApp
├─ sitemap.ts · robots.ts · manifest.ts · llms.txt/route.ts
├─ g/[slug]/route.ts            REDIRECIONADOR — conta o clique e vira o grupo
├─ grupos/ · filtro/ · politica-de-privacidade/
├─ painel/                      o CMS (ver acima)
└─ api/evento · api/trafego/pv  eventos do navegador e PageView pelo servidor

components/
├─ site/       as seções da página, uma por arquivo
├─ grupos/     busca, mapa do estado, lista
├─ filtro/     webview do Instagram, canvas, resultado
├─ animacao/   palco de rolagem e cena da bandeira
├─ trafego/    pixel e GTM (só carregam se o painel preencher)
└─ ui/         Botao · Secao · Imagem · Video · Marca · Revelar …

lib/
├─ config.ts       env, silêncio eleitoral e "o site pode ser indexado?"
├─ conteudo/       leitura, merge, validação, versões e o recorte do cliente
├─ midia/          slots de imagem: leitura e processamento (sharp → WebP)
├─ trafego/        pixel, Conversions API e origem do clique
├─ dados.ts        grupos e municípios, com fallback local ↔ Supabase
├─ geo.ts          busca tolerante, haversine, header de cidade da Vercel
├─ imagem.ts       EXIF, downscale, desenho e exportação do canvas
├─ painel/         sessão, limite de tentativas, destinos de vídeo
└─ supabase/       client · server · admin (server-only)
```

---

## Segurança: o link do grupo

O `grupos.link` é o segredo do projeto. Se vazar, raspam todos os
grupos de uma vez. Três camadas independentes protegem:

1. **RLS** na tabela `grupos`;
2. **privilégio por coluna** — `anon` e `authenticated` não recebem
   `link`. Mesmo com a policy errada, `select link from grupos` dá
   permission denied;
3. **view `grupos_publicos`** sem a coluna, que é o que o site consome.

A leitura do link real acontece só em `app/g/[slug]/route.ts`, no
servidor, com `service_role` isolada em `lib/supabase/admin.ts`, que
tem `import 'server-only'` no topo — se algum componente de cliente
importar por engano, **o build quebra**.

O token da Conversions API segue a mesma lógica e mora em tabela
própria, **sem versionamento**: credencial em histórico é credencial
vazada para sempre. O painel mostra só os quatro últimos caracteres.

---

## A armadilha do Instagram

O tráfego vem da bio do Instagram. Quem clica ali abre o webview
interno do app, onde `<a download>` frequentemente não faz nada. A
pessoa faz o filtro, aperta baixar, não acontece nada, e desiste — sem
reportar.

O que está no código desde o primeiro dia (`lib/navegador.ts`,
`components/filtro/AvisoWebview.tsx`, `components/filtro/Resultado.tsx`):

- detecção do webview por user-agent + faixa "abrir no navegador";
- `navigator.share` com arquivo quando existe — funciona melhor que
  download;
- **imagem grande na tela com "segure para salvar"** como caminho
  principal, porque é o que funciona em qualquer navegador.

**Este é o teste que mais vai falhar. Faça primeiro.**

---

## Vídeo em pé e vídeo deitado

O acervo de uma campanha tem os dois enquadramentos, e o painel guarda
qual é qual em cada espaço. **Não existe um layout que sirva aos
dois.** Um vídeo em pé numa coluna desenhada para 16:9 vira uma tira
estreita com calhas brancas dos lados.

Por isso seis seções têm **dois desenhos**, escolhidos pelo
enquadramento: `Origem`, `Rua`, `Problema`, `Provas`, `ProvaSocial` e
`Trilha`. A regra que vale para todas:

- deitado mantém o desenho original da seção, sem exceção;
- em pé, a coluna do vídeo passa a valer **a largura do vídeo** — nunca
  uma fração da seção — para que as bordas batam com as do vizinho;
- quem sobrar de altura estica (cartão, foto), em vez de deixar branco;
- a trilha vira grade quando são até seis vídeos em pé, e só volta a
  ser barra rolável do sétimo em diante.

---

## Conformidade eleitoral

| Item | Onde |
|---|---|
| Rodapé de identificação | Painel ▸ Identidade ▸ Rodapé |
| CNPJ na moldura | `npm run molduras` com `CAMPANHA_CNPJ` |
| Política de privacidade | `app/politica-de-privacidade`, editável pelo painel |
| Silêncio eleitoral automático | `NEXT_PUBLIC_SILENCIO_ELEITORAL_EM` |
| Menções a processo judicial | Painel ▸ Seções ▸ Prova social — ⛔ só com o jurídico |
| Pixel ligado × texto da privacidade | Painel ▸ Tráfego entrega o parágrafo pronto |

O `robots.ts` bloqueia indexação enquanto a URL for `localhost` ou
`*.vercel.app`. O estado disso aparece em **Painel ▸ Buscas**.

---

## Banco

Supabase. Tabelas: `municipios`, `grupos`, `eventos`,
`administradores`, `conteudo`, `conteudo_versoes`, `midia`,
`midia_slots`, `trafego`. Dois baldes de Storage.

Para levantar um projeto novo: rodar `sql/01-instalacao.sql` e
`sql/02-seed-municipios.sql`, e preencher as três chaves no
`.env.local`. Detalhe em [sql/README.md](./sql/README.md).

Nenhum componente muda: quem consulta o banco é `lib/`.

---

## Deploy

Vercel, a partir do GitHub. As variáveis do `.env.example` vão no
painel da Vercel — em especial `NEXT_PUBLIC_SITE_URL`.

Manter em **URL de preview** até CNPJ, responsável, endereço do comitê
e domínio estarem confirmados.

A sugestão de cidade por IP usa o header `x-vercel-ip-city`, que só
existe em produção na Vercel. Em local ela simplesmente não aparece.
