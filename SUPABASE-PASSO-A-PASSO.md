# Ligar o Supabase do Ribeiro

Roteiro de uma sentada. **Uns 15 minutos**, e no fim o painel grava e
os grupos têm link.

O que muda quando isto terminar:

| | Hoje (sem banco) | Depois |
|---|---|---|
| A página | funciona inteira | igual |
| O painel `/painel` | abre só em leitura | **grava, sem deploy** |
| Os 52 grupos | todos "em breve" | **com link, editável** |
| As imagens (marca, retrato) | placeholder desenhado | **as de verdade** |
| Métricas e funil | não registram | registram |

---

## 1 · Criar o projeto

Em [supabase.com](https://supabase.com) ▸ **New project**.

| Campo | O que pôr |
|---|---|
| Name | `ribeiro-sinpol` |
| Database Password | gere e **guarde num gerenciador de senhas** |
| Region | **East US (North Virginia)** — `us-east-1` |
| Plan | **Free** basta. Ele aguenta uma campanha inteira |

> **Region:** a latência daqui até Rondônia é parecida entre as
> regiões dos EUA, e a `us-east-1` é a mais barata quando/se a
> campanha precisar subir de plano. Não mude para uma região europeia.

Espera uns 2 minutos até o projeto ficar verde.

---

## 2 · Rodar os dois SQLs

**SQL Editor** ▸ **New query** ▸ colar ▸ **Run**. Um de cada vez, nesta
ordem. Os dois são idempotentes: se der erro no meio, pode rodar de
novo sem medo.

### 2.1 — `sql/01-instalacao.sql`

Tabelas, views, RLS, funções e os dois baldes de Storage. É o arquivo
grande (1.240 linhas). Cole **inteiro**.

> ✅ **O fuso já está certo.** As views de métrica vinham agrupando o
> dia em `America/Sao_Paulo`, e Rondônia é **UTC−4**, não UTC−3. Já
> troquei para `America/Porto_Velho`. Se não estivesse trocado, o
> relatório do dia viraria uma hora errada e ninguém perceberia,
> porque o número continua *parecendo* certo.

### 2.2 — `sql/02-seed-municipios.sql`

Os **52 municípios de Rondônia**, com um grupo "em breve" para cada.
Já vem gerado da malha oficial do IBGE — não precisa rodar
`npm run uf`.

Ao terminar, confira que voltou `52`:

```sql
select count(*) from public.municipios;
```

---

## 3 · Colar as três chaves

**Project Settings ▸ API**. São três valores, e cada um vai numa linha
já vazia do `.env.local`:

| No Supabase | No `.env.local` |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

```bash
open -a TextEdit "/Users/filipelourenco/Downloads/Ribeiro Sinpol Página/.env.local"
```

> ⛔ **A `service_role` NUNCA leva o prefixo `NEXT_PUBLIC_`.** Ela
> ignora todas as regras de RLS — quem tem essa chave manda no banco
> inteiro. Ela é lida num arquivo só (`lib/supabase/admin.ts`), que
> tem `import 'server-only'` no topo: se algum componente de cliente
> importar por engano, **o build quebra em vez de vazar a chave**.
> Essa quebra é a proteção funcionando, não um bug.

---

## 4 · Trocar a senha do painel

Na mesma edição, troque:

```
PAINEL_SENHA="trocar-esta-senha"
```

Não deixe a de fábrica. Quem entra no painel **edita o CNPJ que sai no
rodapé de todas as páginas** — é dado com consequência jurídica.

O `PAINEL_SESSION_SECRET` já está gerado e não precisa ser tocado.

---

## 5 · Reiniciar o dev

**Obrigatório.** O `.env.local` só é lido na inicialização — editar com
o servidor de pé não tem efeito nenhum, e o sintoma é enganoso: o
painel continua em modo leitura como se as chaves estivessem erradas.

```bash
npm run dev
```

---

## 6 · Conferir que pegou

1. Abra `/painel` e entre com a senha nova.
2. Se a tela abre e **grava**, o banco está ligado.
3. Vá em **Grupos**: os 52 municípios de Rondônia têm que estar
   listados, todos como "em breve".

---

## 7 · O que fazer em seguida, pelo painel

Sem deploy nenhum, a partir daqui.

### Identidade ▸ Imagens — a marca já chegou, está em `MARCA/`

| Slot | Arquivo |
|---|---|
| `marca.logotipo` | `HORIZONTALBRANCORIBEIRO2026.png` |
| `marca.lockup` | `VERTICALCOLORIDORIBEIRO2026.png` |
| `marca.lockupDeitado` | `HORIZONTALCOLORIDORIBEIRO2026.png` |

> ⚠️ **O "RIBEIRO" desses PNGs é texto branco.** Eles só aparecem
> sobre fundo escuro — no claro, some. Confira o lockup nos dois
> fundos antes de aprovar.

Ainda faltam: `hero.retrato` (PNG recortado, sem fundo, de corpo
inteiro), `marca.favicon` e `marca.simbolo`. A estrela colorida do
`BOLA` serve de símbolo se for recortada.

### Grupos

Os links de WhatsApp entram **um por município**, aqui. Nunca em
arquivo: link de grupo em arquivo se versiona, vaza, e raspam os 52 de
uma vez.

### Identidade ▸ Rodapé

O CNPJ `68.519.615/0001-62` já está preenchido (lido da arte oficial).
Falta **conferir contra o registro de candidatura**, e preencher nome
na urna, coligação e endereço do comitê. Ver `PENDENCIAS.md`.

---

## 8 · No dia de publicar

```bash
# apaga os eventos dos SEUS próprios testes do funil
```

Rodar `sql/09-zerar-metricas.sql` no SQL Editor. Se não rodar, o funil
da campanha começa contando os seus cliques de teste como se fossem
eleitores.

E, na Vercel, recadastrar **todas** as variáveis do `.env.local` —
principalmente `NEXT_PUBLIC_SITE_URL`, que é o que decide se o site
pode ser indexado. Enquanto for `localhost` ou `*.vercel.app`, o
`robots.ts` bloqueia a indexação sozinho, de propósito: uma cópia de
trabalho indexada concorre com a oficial na busca pelo nome dele.
