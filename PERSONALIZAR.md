# Personalizar para uma campanha

Este projeto é um modelo. Ele nasce com o nome "Nome do Candidato", o
número "00000" e o texto de fábrica em todas as seções. Este arquivo é
o roteiro para ele virar a página de uma pessoa real.

**Tempo:** 40 minutos até o site de pé com a cara certa. Um dia até
publicável, e o que separa os dois é dado de campanha, não código.

> **Para o Claude:** existe a skill `/personalizar-campanha`, que
> executa este roteiro conversando. Ela pergunta o que falta em vez de
> preencher por conta. Se estiver seguindo à mão, siga na ordem — cada
> passo assume o anterior.

---

## Antes de começar: o que você precisa ter em mãos

Isto é o briefing mínimo. O que não tiver ainda, deixe em branco e
anote em `PENDENCIAS.md` — o site funciona incompleto de propósito.

| | Dado | Onde entra | Sem ele |
|---|---|---|---|
| 1 | Nome, como é conhecido | `content/campanha.ts` | ⛔ trava tudo |
| 2 | Número da urna | `content/campanha.ts` | ⛔ trava tudo |
| 3 | Cargo e partido | `content/campanha.ts` | ⛔ trava tudo |
| 4 | Estado (UF) ou cidade | `content/campanha.ts` | ⛔ trava tudo |
| 5 | As cores da campanha | `content/campanha.ts` | usa a paleta padrão |
| 6 | História em primeira pessoa | `content/copy.ts` | fica o texto de fábrica |
| 7 | Bandeiras e compromissos | `content/copy.ts` | fica o texto de fábrica |
| 8 | O que já foi feito (com fonte) | `content/copy.ts` | desligar a seção |
| 9 | Foto recortada em PNG | painel ▸ Imagens | desenha uma silhueta |
| 10 | **CNPJ da campanha** | painel ▸ Identidade | ⛔ **não publica** |
| 11 | Nome na urna, coligação, comitê | painel ▸ Identidade | ⛔ **não publica** |
| 12 | Links dos grupos de WhatsApp | painel ▸ Grupos | grupos ficam "em breve" |
| 13 | Data e hora do silêncio eleitoral | `.env.local` | CTA não sai do ar sozinho |

Os itens 10 e 11 são exigência da lei eleitoral. Os demais são
qualidade. **Nenhum deles se inventa.**

---

## Passo 1 · Instalar e ver de pé

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre em `http://localhost:3000`. Sem Supabase o site funciona inteiro,
lendo de `data/` e de `content/copy.ts` — o painel abre em modo de
leitura. **Nada quebra sem banco.** Confirme que a página abre antes
de mexer em qualquer coisa: é o seu ponto de retorno.

---

## Passo 2 · A identidade

Abra **`content/campanha.ts`**. É o único arquivo obrigatório, e ele é
curto. Preencha de cima para baixo:

- **quem é** — nome, primeiro nome, nome na urna, número, cargo,
  gênero (`'f'` ou `'m'`), partido;
- **onde** — `escopo`, `uf`, `estado`, `ufCodigoIbge`, `cidadeBase`;
- **canais** — Instagram, WhatsApp. Vazio esconde o link, e é melhor
  esconder do que deixar um link quebrado no ar;
- **eleição** — ano e data da votação;
- **cores** — cinco hex, explicados no passo 4;
- **slug** — identificador curto, sem acento. Batiza o cookie do
  painel e o nome dos arquivos que o eleitor baixa.

O campo `genero` não é enfeite: ele decide "candidato/candidata" e
outras concordâncias em cerca de vinte frases do texto de fábrica.

---

## Passo 3 · O território

```bash
npm run uf -- SP        # a sigla da UF da campanha
```

Baixa a malha oficial do IBGE e escreve quatro arquivos de uma vez:

```
data/municipios.json         a lista, com slug e coordenada
data/mapa.json               os contornos, prontos para o <svg>
data/grupos.local.json       um grupo "em breve" por município
sql/02-seed-municipios.sql   o mesmo, para rodar no Supabase
```

Funciona para as 27 UFs. Sem argumento, ele usa a UF escrita em
`content/campanha.ts`.

**Confira cinco municípios distantes entre si** antes de publicar. A
coordenada é o centro geométrico do município, não a praça da matriz —
em municípios muito alongados a diferença chega a dezenas de
quilômetros. Para corrigir um caso específico, escreva a coordenada
certa em `data/coordenadas.json` e rode de novo.

### Campanha municipal (vereador, prefeito)

Ponha `escopo: 'municipal'` em `content/campanha.ts` e ajuste
`regiao` para bairro:

```ts
regiao: {
  singular: 'bairro',
  plural: 'bairros',
  artigoSingular: 'o',
  rotuloBusca: 'bairro',
},
```

O mapa some sozinho — não existe malha oficial de bairro no IBGE — e a
busca passa a procurar bairro. `data/municipios.json` passa a ser
escrito à mão, com os bairros e suas coordenadas (mesmo formato: slug,
nome, latitude, longitude). Um grupo por bairro continua sendo a
mecânica certa: o que muda é o nome da coisa.

---

## Passo 4 · As cores

Cinco hex em `content/campanha.ts`, em `cores`. Eles são injetados
como variáveis CSS em `app/layout.tsx` e vencem os padrões de
`app/globals.css` — **o CSS não precisa ser tocado**.

⚠️ **Os nomes são papéis, não cores.** No CSS elas se chamam `azul`,
`verde` e `amarelo` porque a primeira campanha era azul, verde e
amarela. O que valem é:

| Papel | Onde aparece |
|---|---|
| `primaria` / `primariaEscura` | primeira dobra, chamada final, rodapé |
| `secundaria` / `secundariaEscura` | valores e compromissos |
| `acao` | **só** botões e detalhes — nunca superfície grande |
| `acaoTexto` | o texto que fica em cima da cor de ação |
| `noite` | o fim do gradiente da primeira dobra |

Uma campanha vermelha põe vermelho em `primaria` e a página fica
vermelha. Os nomes ficam estranhos no CSS e nada mais acontece.

**A regra que não se negocia:** a cor de ação nunca é cor de texto
sobre fundo claro. Ela é o que aponta o botão. Amarelo sobre branco dá
1,4:1 de contraste — ilegível. Se a cor de ação da campanha for
escura, inverta `acaoTexto` para branco.

Depois de trocar as cores, olhe a primeira dobra e o rodapé. São os
dois lugares onde uma paleta errada aparece de imediato.

---

## Passo 5 · Os textos

**`content/copy.ts`.** Todo bloco marcado com `// ✍️ ESCREVER` está com
texto genérico — ele existe para o site ficar de pé e mostrar a forma,
não para ir ao ar.

Duas maneiras de editar, e as duas valem:

- **no arquivo**, agora, para o grosso da campanha;
- **no painel** (`/painel`), depois, sem deploy — é como a campanha vai
  trabalhar no dia a dia.

O que está no banco vence o que está no arquivo. `content/copy.ts` é o
estado inicial; apagar a linha de uma seção no banco faz ela voltar
para cá.

### A ordem que rende mais

1. **Hero** — a única seção que todo visitante vê;
2. **Origem** — quatro parágrafos em primeira pessoa, com lugar,
   ofício e a virada. É o que faz a página não ser um santinho;
3. **Problema** — quatro dores que o eleitor *vive*, com dado local.
   Estatística nacional não convence ninguém;
4. **Futuro** — seis compromissos escritos de um jeito que dê para
   cobrar em quatro anos. "Lutar por saúde" não é compromisso;
5. **Provas** — só com o que estiver em registro público. É a seção
   que separa candidato sério de vendedor de promessa, e ela só
   funciona se o leitor puder conferir sozinho;
6. o resto.

### Regras de escrita deste projeto

- **primeira pessoa.** "Eu fiz", não "ele fez";
- **`[[colchetes duplos]]`** realçam um trecho na cor de ação. Um por
  título;
- **corpo de texto nunca abaixo de 18px** e alvo de toque nunca abaixo
  de 48px. O público é de 35 a 64 anos lendo no celular;
- **número sem fonte não entra.** Se não dá para conferir, tire.

### Seções que você pode desligar

`exibir`, no fim de `content/copy.ts`, tem um interruptor por seção.
Sem mandato anterior, desligue `provas` — uma seção de provas com
promessa dentro é pior do que não ter seção de provas.

`social` **nasce desligada**: são prints de comentários de terceiros e
menções a processo judicial. Os primeiros exigem autorização de uso de
imagem; os segundos exigem o jurídico assinando embaixo.

---

## Passo 6 · A marca e as imagens

**Enquanto não há arte, o site desenha a marca sozinho**: o nome e o
número na fonte de título, e um símbolo na estrutura da bandeira
pintado com as cores da campanha. Não é um espaço vazio esperando
arte — é a arte que funciona, e ela nunca fica com cara de outra
pessoa.

Quando a arte chegar, ela entra **pelo painel**, em Identidade ▸
Imagens, sem deploy:

| Espaço | O que é |
|---|---|
| `marca.simbolo` | o ícone ao lado do nome, no topo |
| `marca.favicon` | o ícone da aba, quadrado |
| `marca.logotipo` | a marca em faixa, branca, para o rodapé |
| `marca.lockup` | nome + número empilhados (celular) |
| `marca.lockupDeitado` | nome + número em faixa (desktop) |
| `marca.cartaoLink` | a imagem do link no WhatsApp, 1200×630 |
| `hero.retrato` | a foto principal, PNG recortado sem fundo |
| `hero.apoio` | a segunda figura — o padrinho político. Opcional |

Os arquivos que ficam em `/public` e não passam pelo painel:

- **`public/fundo-1..5.webp`** — as cinco fotos de rua que correm
  atrás das figuras na primeira dobra. O modelo vem com placeholders
  cinza. Troque por fotos reais, em preto e branco, já convertidas
  para cinza no arquivo (filtro em runtime custa repaint a cada
  quadro);
- **`app/icon.svg`** — o ícone padrão da aba. Tem as cores fixas
  dentro dele, porque o navegador serve esse arquivo isolado e ele não
  enxerga o CSS da página. Ou troque os três hex, ou envie o ícone
  pelo painel — o do painel vence.

### As molduras do gerador de foto

```bash
CAMPANHA_CNPJ="CNPJ 00.000.000/0001-00" npm run molduras
```

Gera as duas molduras (story e perfil) com o nome, o número e as cores
da campanha. **Sem o CNPJ, a moldura sai com um aviso carimbado** —
propaganda eleitoral sem CNPJ é peça irregular, e é melhor a campanha
ver o aviso agora do que descobrir depois que dez mil pessoas
postaram.

A arte final da moldura entra pelo painel (`moldura.story`,
`moldura.perfil`), onde pode ter a fonte e a textura que quiser. A
gerada aqui é a rede de segurança: ela usa Arial porque `@font-face`
não carrega dentro de um SVG usado como imagem.

---

## Passo 7 · O banco

Sem isto o site funciona, mas o painel não grava e os grupos não têm
link. Ver **[sql/README.md](./sql/README.md)** para o detalhe.

1. criar um projeto no [supabase.com](https://supabase.com) (o plano
   gratuito aguenta uma campanha inteira);
2. **SQL Editor** ▸ colar e rodar `sql/01-instalacao.sql`;
3. colar e rodar `sql/02-seed-municipios.sql` (o que o passo 3 gerou);
4. copiar as três chaves de **Project Settings ▸ API** para o
   `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

⚠️ A `SUPABASE_SERVICE_ROLE_KEY` **nunca** leva o prefixo
`NEXT_PUBLIC_`. Ela é lida em um arquivo só (`lib/supabase/admin.ts`),
que tem `import 'server-only'` no topo: se algum componente de cliente
importar por engano, o build quebra em vez de vazar.

⚠️ **Confira o fuso** antes de rodar o `01`. As views de métrica
agrupam o dia em `America/Sao_Paulo` — campanha no Acre, em Rondônia,
no Amazonas ou em Mato Grosso precisa trocar. Procure por `FUSO DA
CAMPANHA` no arquivo.

Reinicie o `npm run dev` depois de mexer no `.env.local`.

---

## Passo 8 · O painel

`http://localhost:3000/painel`, senha em `PAINEL_SENHA`.

Gere as duas variáveis antes de publicar:

```bash
openssl rand -hex 32     # PAINEL_SESSION_SECRET
```

`PAINEL_SENHA` é a senha que a campanha vai usar. Não deixe a de
fábrica: o painel edita o CNPJ que sai no rodapé.

Oito telas: Início, Seções, Vídeos, Identidade, Grupos, Métricas,
Tráfego, Buscas. A tela **Início** lista quais seções ainda estão no
texto de fábrica — é o seu checklist de publicação, e ele se atualiza
sozinho.

Os links dos grupos entram em **Grupos**, um por município. Eles nunca
ficam em arquivo: o link é o segredo do projeto, e arquivo se
versiona.

---

## Passo 9 · Conformidade eleitoral

Antes de apontar um domínio para o site:

- [ ] **CNPJ da campanha** no rodapé (painel ▸ Identidade ▸ Rodapé)
- [ ] **nome na urna, cargo, partido, coligação, comitê** — os mesmos
      do registro de candidatura
- [ ] **CNPJ na moldura** — rodar `npm run molduras` com o CNPJ
- [ ] **silêncio eleitoral** em `.env.local`:

```
NEXT_PUBLIC_SILENCIO_ELEITORAL_EM="2026-10-03T03:00:00.000Z"
```

  É em **UTC**. Meia-noite em Brasília é `T03:00:00Z`; em Rondônia,
  no Acre e no Amazonas, some mais uma ou duas horas. A partir desse
  instante os CTAs saem do ar sozinhos — não depende de alguém
  lembrar num domingo de manhã.

- [ ] **política de privacidade** conferida. O texto de fábrica
      descreve o que este código faz, e é verdadeiro **enquanto o
      pixel estiver desligado**
- [ ] **pixel × privacidade** — ligar o pixel da Meta torna falso o
      item 4 da política. A tela Painel ▸ Tráfego entrega o parágrafo
      substituto pronto para colar
- [ ] **menção a processo judicial** — só com o jurídico assinando

O `robots.ts` bloqueia indexação enquanto a URL for `localhost` ou
`*.vercel.app`. É proposital: uma cópia de trabalho indexada concorre
com a oficial na busca pelo nome do candidato. O estado disso aparece
em **Painel ▸ Buscas**.

---

## Passo 10 · Publicar

Vercel, a partir do GitHub. As variáveis do `.env.example` vão no
painel da Vercel — em especial `NEXT_PUBLIC_SITE_URL`, que é o que
decide se o site pode ser indexado.

**Mantenha em URL de preview** até CNPJ, responsável, endereço do
comitê e domínio estarem confirmados.

A sugestão de cidade por IP usa o header `x-vercel-ip-city`, que só
existe em produção na Vercel. Em local ela simplesmente não aparece.

---

## O teste que mais vai falhar

**Abrir o site DENTRO do Instagram, no iPhone e no Android, e fazer o
filtro até salvar a foto.**

O tráfego vem da bio do Instagram, e quem clica ali abre o webview
interno do app, onde `<a download>` frequentemente não faz nada. A
pessoa faz o filtro, aperta baixar, não acontece nada, e desiste — sem
reportar. O código trata isso desde o primeiro dia (detecção de
webview, `navigator.share` com arquivo, e imagem grande na tela com
"segure para salvar" como caminho principal), mas é o que quebra
primeiro em aparelho novo.

Faça esse teste antes dos outros.

---

## Checklist final

```bash
npm run typecheck
npm run build
```

- [ ] `/g/<algum-municipio>` no celular cai no grupo certo
- [ ] trocar o link no painel e reabrir a mesma URL: vai pro novo
      destino sem republicar
- [ ] município sem grupo: mensagem tratada, nunca erro
- [ ] **o filtro dentro do Instagram, nos dois sistemas**
- [ ] foto vertical de iPhone entra na orientação certa
- [ ] colar o link no WhatsApp: cartão com imagem e título
- [ ] editar um texto no painel e ver a home mudar sem republicar
- [ ] cronometrar num celular antigo em 4G — teto de 3s até o botão
      principal ficar clicável
- [ ] conferir 5 municípios distantes entre si no mapa
- [ ] a tela Início do painel não lista mais nenhuma seção no texto
      de fábrica
- [ ] rodar `sql/09-zerar-metricas.sql` para apagar o seu próprio
      teste do funil

---

## O que NÃO fazer

- **não mexa em `lib/`, `app/painel/`, `app/g/` ou `app/api/`** para
  personalizar. Se pareceu necessário, quase sempre a coisa devia ter
  ido para `content/`;
- **não invente número, CNPJ, lei ou coligação.** Deixe vazio e
  registre em `PENDENCIAS.md`;
- **não coloque link de grupo em arquivo.** Ele vaza e raspam todos os
  grupos de uma vez;
- **não publique com texto de fábrica.** A tela Início do painel
  existe para dizer exatamente quais seções ainda estão assim;
- **não ligue o pixel sem trocar o texto da privacidade.** É a única
  parte deste site que tem consequência fora dele.
