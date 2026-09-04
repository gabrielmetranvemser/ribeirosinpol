# Os SQLs

Tudo que o banco precisa, na ordem de rodar. Cole no **Supabase ▸ SQL
Editor ▸ New query ▸ Run**, um arquivo de cada vez.

| # | Arquivo | Quando | O que faz |
|---|---|---|---|
| 1 | `01-instalacao.sql` | uma vez, sempre | tabelas, views, RLS, funções e os dois baldes de Storage |
| 2 | `02-seed-municipios.sql` | uma vez, e de novo se trocar de estado | o território: os municípios e um grupo "em breve" para cada |
| 3 | `03-administrador.sql` | opcional | só no dia de trocar a senha única pelo Supabase Auth |
| 9 | `09-zerar-metricas.sql` | no dia da publicação | apaga os eventos do seu próprio teste |
| 99 | `99-apagar-tudo.sql` | quase nunca | ⛔ derruba tudo, inclusive os links dos grupos |

Os dois primeiros são o que faz o site sair do modo local. Os outros
são para o dia em que forem necessários.

---

## O caminho completo, do zero

```bash
npm run uf -- RO       # 1. gera o território (troque a UF)
```

Depois, no SQL Editor do Supabase:

1. `01-instalacao.sql`
2. `02-seed-municipios.sql`

E no `.env.local` do projeto:

```
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

As três chaves ficam em **Supabase ▸ Project Settings ▸ API**.

A partir daí o painel grava, o site lê do banco, e o
`data/grupos.local.json` deixa de ser usado.

---

## Antes de rodar, duas conferências

**O fuso.** As views de métrica agrupam o dia em `America/Sao_Paulo`.
Campanha no Acre, em Rondônia, no Amazonas ou em Mato Grosso precisa
trocar — procure por `FUSO DA CAMPANHA` em `01-instalacao.sql`. Com o
fuso errado o relatório do dia vira em hora errada e ninguém percebe,
porque o número continua parecendo certo.

**As coordenadas.** O `02-seed-municipios.sql` é gerado a partir da
malha do IBGE, e a coordenada de cada município é o **centro
geométrico**, não a praça da matriz. Para "qual cidade está mais perto
de mim" isso resolve quase sempre; em municípios muito alongados o
centro pode cair a dezenas de quilômetros da sede. Conferir cinco
municípios distantes entre si antes de publicar — erro aqui é
silencioso: ninguém reclama, a pessoa só não entra no grupo.

Para corrigir um caso específico, escreva a coordenada certa em
`data/coordenadas.json` e rode `npm run uf` de novo.

---

## É seguro rodar de novo?

`01`, `02` e `03`: sim. São idempotentes — `create if not exists`,
`create or replace`, `on conflict do update`. Rodar `01` num banco em
uso é como aplicam-se as atualizações do projeto.

Rodar `02` depois da campanha começar atualiza nome e coordenada e
**não toca em grupo nenhum**: os links já cadastrados continuam onde
estão.

`09` e `99` apagam dados. Estão numerados no fim de propósito.

---

## Por que a segurança está espalhada em três lugares

O `grupos.link` é o segredo do projeto: se vazar, raspam todos os
grupos de uma vez. A instalação protege ele em três camadas
independentes, e as três estão em `01-instalacao.sql`:

1. **RLS** na tabela `grupos`;
2. **privilégio por coluna** — `anon` e `authenticated` não recebem
   `link`. Mesmo com a policy errada, `select link from grupos` dá
   permission denied;
3. **view `grupos_publicos`** sem a coluna, que é o que o site consome.

Não remova nenhuma delas "para simplificar". A razão de serem três é
que uma sempre falha.

A leitura do link real acontece só em `app/g/[slug]/route.ts`, no
servidor, com a `service_role` isolada em `lib/supabase/admin.ts` — que
tem `import 'server-only'` no topo: se algum componente de cliente
importar por engano, **o build quebra**.

---

## Manutenção

`01-instalacao.sql` é **gerado**. A fonte são as migrations em
`supabase/migrations/`, uma mudança por arquivo, com data no nome.
Depois de editar uma migration:

```bash
npm run sql
```

Editar `01-instalacao.sql` à mão funciona até a próxima vez que alguém
rodar esse comando.
