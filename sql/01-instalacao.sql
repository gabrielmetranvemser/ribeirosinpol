-- ═══════════════════════════════════════════════════════════════════════
--  01 · INSTALAÇÃO COMPLETA
--
--  Modelo universal de LP de campanha — banco inteiro, num arquivo só.
--
--  ONDE RODAR
--    Supabase ▸ SQL Editor ▸ New query ▸ colar tudo ▸ Run.
--    (ou: psql "$DATABASE_URL" -f sql/01-instalacao.sql)
--
--  DEPOIS DESTE, RODE NA ORDEM
--    sql/02-seed-municipios.sql   o território (gerado por `npm run uf`)
--    sql/03-administrador.sql     opcional, só quando migrar para o
--                                 Supabase Auth
--
--  É IDEMPOTENTE. Rodar de novo não duplica nada e não apaga nada:
--  tudo é `create if not exists`, `create or replace` ou `on conflict
--  do nothing`. Pode rodar num banco já em uso para aplicar mudanças.
--
--  O QUE ELE CRIA
--    municipios · grupos · eventos · administradores
--    conteudo · conteudo_versoes        (o CMS do painel)
--    midia · midia_slots                (as imagens)
--    trafego                            (pixel e Conversions API)
--    + as views de métrica, as policies de RLS e a função contar_clique
--
--  ⚠️ A COISA MAIS IMPORTANTE DESTE ARQUIVO é a seção de SEGURANÇA:
--     ela é o que impede o link dos grupos de vazar para o navegador.
--     São três camadas independentes (RLS, privilégio por coluna e
--     view sem a coluna). Não remova nenhuma "para simplificar" — a
--     razão de serem três é que uma sempre falha.
--
--  ⚠️ FUSO HORÁRIO. As views de métrica agrupam o dia em
--     'America/Sao_Paulo'. Se a campanha for no Acre, em Rondônia, no
--     Amazonas ou em Mato Grosso, troque o fuso ANTES de rodar —
--     procure por "FUSO DA CAMPANHA" neste arquivo. Com o fuso errado
--     o relatório do dia vira em hora errada e ninguém percebe.
--
--  Gerado a partir de supabase/migrations/. Para editar, edite lá e
--  rode `npm run sql` para reconstruir este arquivo.
-- ═══════════════════════════════════════════════════════════════════════



-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260819120000_esquema.sql                                       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0001 · ESQUEMA
-- Modelo universal de LP de campanha
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────────────
-- municipios · o território da campanha. Estável, quase só leitura.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.municipios (
  slug       text primary key,
  nome       text not null,
  latitude   numeric(9,6) not null,
  longitude  numeric(9,6) not null,
  criado_em  timestamptz not null default now(),

  constraint municipios_slug_formato check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint municipios_lat_valida  check (latitude between -90 and 90),
  constraint municipios_lon_valida  check (longitude between -180 and 180)
);

comment on table public.municipios is
  'Os municípios (ou bairros) da campanha. Semeados por sql/02-seed-municipios.sql, gerado por scripts/gerar-uf.mjs. Coordenadas usadas para achar a sede mais próxima no aparelho da pessoa.';

-- ───────────────────────────────────────────────────────────────
-- grupos · vários por município, numerados por ordem.
-- O campo `link` é o segredo do projeto: se vazar, raspam os 52.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.grupos (
  id             uuid primary key default gen_random_uuid(),
  municipio_slug text not null references public.municipios(slug) on delete cascade,
  ordem          smallint not null default 1,
  link           text,
  status         text not null default 'em_breve',
  fixado         boolean not null default false,
  limite_cliques integer,
  cliques        integer not null default 0,
  observacao     text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),

  constraint grupos_status_valido
    check (status in ('aberto','em_breve','cheio','desativado')),
  constraint grupos_ordem_positiva
    check (ordem >= 1),
  constraint grupos_cliques_nao_negativo
    check (cliques >= 0),
  constraint grupos_limite_positivo
    check (limite_cliques is null or limite_cliques > 0),
  -- Um grupo só pode ficar 'aberto' se tiver link de WhatsApp de verdade.
  -- Isto é o que impede o redirecionador de mandar a pessoa para lugar nenhum.
  constraint grupos_aberto_exige_link
    check (status <> 'aberto' or link ~ '^https://chat\.whatsapp\.com/[A-Za-z0-9]+'),

  unique (municipio_slug, ordem)
);

comment on column public.grupos.link is
  'NUNCA exposto ao navegador. Lido só no servidor, em /g/[slug], com service_role.';
comment on column public.grupos.limite_cliques is
  'Clique não é entrada. Começar em ~700 e calibrar comparando com membros reais.';

-- Só um fixado por município.
create unique index if not exists grupos_um_fixado_por_municipio
  on public.grupos (municipio_slug)
  where fixado;

-- FK indexada: acelera o join e o ON DELETE CASCADE.
create index if not exists grupos_municipio_ordem
  on public.grupos (municipio_slug, ordem);

-- ───────────────────────────────────────────────────────────────
-- eventos · o funil inteiro numa tabela só.
-- Genérica de propósito: tipo novo não pede migration nova.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.eventos (
  id             bigint generated always as identity primary key,
  tipo           text not null,
  municipio_slug text,
  grupo_id       uuid,
  origem         text,
  utm            text,
  sessao         text,
  dispositivo    text,
  criado_em      timestamptz not null default now(),

  constraint eventos_tipo_valido check (tipo in (
    'pagina_vista','rolou_50','rolou_90',
    'buscou_cidade','usou_localizacao',
    'clicou_grupo','entrou_grupo_indisponivel',
    'abriu_filtro','subiu_foto','gerou_filtro',
    'baixou_filtro','compartilhou_filtro',
    'compartilhou_pagina','clicou_instagram'
  )),
  constraint eventos_dispositivo_valido
    check (dispositivo is null or dispositivo in ('celular','desktop'))
);

comment on table public.eventos is
  'Sem nome, sem telefone, sem IP. `sessao` é aleatório e some quando a aba fecha.';

-- Sem FK em grupo_id de propósito: evento é histórico e precisa
-- sobreviver ao grupo ser apagado no painel.

create index if not exists eventos_tipo_data
  on public.eventos (tipo, criado_em desc);

create index if not exists eventos_municipio_data
  on public.eventos (municipio_slug, criado_em desc)
  where municipio_slug is not null;

-- Índice parcial: o painel pergunta "qual botão trabalha" só sobre cliques.
create index if not exists eventos_clique_origem
  on public.eventos (origem, criado_em desc)
  where tipo = 'clicou_grupo';

create index if not exists eventos_data
  on public.eventos (criado_em desc);

-- ───────────────────────────────────────────────────────────────
-- administradores · quem pode entrar no painel.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.administradores (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  nome      text,
  criado_em timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────────
-- atualizado_em automático
-- ───────────────────────────────────────────────────────────────
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists grupos_atualizado_em on public.grupos;
create trigger grupos_atualizado_em
  before update on public.grupos
  for each row execute function public.tocar_atualizado_em();


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260819120100_seguranca.sql                                     ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0002 · SEGURANÇA
--
-- Regra central do projeto: o navegador NUNCA enxerga `grupos.link`.
-- Defesa em três camadas, porque uma só sempre falha:
--   1. RLS na tabela
--   2. privilégio POR COLUNA (revoke em `link`)
--   3. view pública sem a coluna
-- Mesmo que alguém erre a policy, o grant de coluna segura.
-- ═══════════════════════════════════════════════════════════════

alter table public.municipios     enable row level security;
alter table public.grupos         enable row level security;
alter table public.eventos        enable row level security;
alter table public.administradores enable row level security;

-- ───────────────────────────────────────────────────────────────
-- Helper: quem é admin. security definer para não bater na RLS
-- da própria tabela de administradores e virar recursão.
-- ───────────────────────────────────────────────────────────────
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.eh_admin() from public;
grant execute on function public.eh_admin() to authenticated;

-- ───────────────────────────────────────────────────────────────
-- municipios · leitura livre, escrita só de admin.
-- ───────────────────────────────────────────────────────────────
drop policy if exists municipios_leitura_publica on public.municipios;
create policy municipios_leitura_publica
  on public.municipios for select
  to anon, authenticated
  using (true);

drop policy if exists municipios_escrita_admin on public.municipios;
create policy municipios_escrita_admin
  on public.municipios for all
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

-- ───────────────────────────────────────────────────────────────
-- grupos
-- ───────────────────────────────────────────────────────────────

-- Camada 2: privilégio POR COLUNA.
-- Nem `anon` nem `authenticated` recebem `link`. Nenhum dos dois precisa:
-- o site público lê a view, e o painel lê pelo servidor com service_role.
-- Consequência prática: mesmo com a policy errada, `select link from grupos`
-- devolve "permission denied for column link". É a trava que não depende
-- de ninguém ter escrito a policy certa.
revoke all on table public.grupos from anon, authenticated;
grant select (municipio_slug, ordem, status, fixado)
  on table public.grupos to anon, authenticated;

-- Camada 1: RLS. A linha aparece, mas só nas colunas concedidas acima.
drop policy if exists grupos_leitura_publica on public.grupos;
create policy grupos_leitura_publica
  on public.grupos for select
  to anon, authenticated
  using (status <> 'desativado');

-- Escrita pelo PostgREST só de admin. Na prática o painel escreve pelo
-- servidor com service_role; esta policy é a rede embaixo do trapézio.
drop policy if exists grupos_escrita_admin on public.grupos;
create policy grupos_escrita_admin
  on public.grupos for all
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

-- Camada 3: a view que o site consome.
-- security_invoker = on faz a RLS acima valer para quem consulta.
drop view if exists public.grupos_publicos;
create view public.grupos_publicos
  with (security_invoker = on)
  as select municipio_slug, ordem, status, fixado
     from public.grupos
     where status <> 'desativado';

comment on view public.grupos_publicos is
  'O que o navegador pode ver. Sem `link`, sem `cliques`, sem `observacao`.';

grant select on public.grupos_publicos to anon, authenticated;

-- Status público por município, já resolvido. Poupa o cliente de
-- reimplementar a regra do fixado.
drop view if exists public.municipios_publicos;
create view public.municipios_publicos
  with (security_invoker = on)
  as select
       m.slug,
       m.nome,
       m.latitude,
       m.longitude,
       coalesce(
         (select case
            when bool_or(g.status = 'aberto') then 'aberto'
            when bool_or(g.status = 'cheio')  then 'cheio'
            else 'em_breve'
          end
          from public.grupos g
          where g.municipio_slug = m.slug and g.status <> 'desativado'),
         'em_breve'
       ) as status
     from public.municipios m;

grant select on public.municipios_publicos to anon, authenticated;

-- ───────────────────────────────────────────────────────────────
-- eventos · ninguém lê, ninguém escreve pelo PostgREST.
-- A gravação passa por /api/evento no servidor, com service_role.
-- A leitura é do painel, com service_role.
-- Sem policy = sem acesso para anon e authenticated. É o que queremos.
-- ───────────────────────────────────────────────────────────────
revoke all on table public.eventos from anon, authenticated;

drop policy if exists eventos_leitura_admin on public.eventos;
create policy eventos_leitura_admin
  on public.eventos for select
  to authenticated
  using ((select public.eh_admin()));

grant select on table public.eventos to authenticated;

-- ───────────────────────────────────────────────────────────────
-- administradores · cada admin enxerga a própria linha.
-- Incluir alguém é operação manual, no SQL editor. De propósito.
-- ───────────────────────────────────────────────────────────────
revoke all on table public.administradores from anon, authenticated;

drop policy if exists administradores_le_a_si on public.administradores;
create policy administradores_le_a_si
  on public.administradores for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on table public.administradores to authenticated;


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260819120200_metricas.sql                                      ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0003 · MÉTRICAS
--
-- Views de leitura para o painel. Todas consumidas pelo servidor
-- com service_role. Nenhuma exposta ao anon.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- Funil por dia. Uma linha por dia, uma coluna por etapa.
-- É a tela que responde "o problema é a copy, o botão ou o grupo?".
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_funil_dia as
select
  -- ⚠️ FUSO DA CAMPANHA: agrupa o dia em Rondônia (UTC−4), não em
  --    Brasília. Ver o cabeçalho deste arquivo.
  --
  -- ⚠️ A VÍRGULA VOLTOU PARA DEPOIS DE `dia`, e este era um erro de
  --    sintaxe de verdade: ela estava no fim da linha do comentário, e
  --    `--` engole tudo até a quebra de linha. O select virava
  --    `as dia count(*) ...` e o arquivo inteiro parava aqui, na
  --    linha 370, com "syntax error at or near count". Como a instalação
  --    roda em `ON_ERROR_STOP`, nada depois desta view era criado.
  (criado_em at time zone 'America/Porto_Velho')::date as dia,
  count(*) filter (where tipo = 'pagina_vista')          as viram_pagina,
  count(*) filter (where tipo = 'rolou_50')              as rolaram_metade,
  count(*) filter (where tipo = 'rolou_90')              as rolaram_fim,
  count(*) filter (where tipo = 'buscou_cidade')         as buscaram_cidade,
  count(*) filter (where tipo = 'usou_localizacao')      as usaram_gps,
  count(*) filter (where tipo = 'clicou_grupo')          as clicaram_grupo,
  count(*) filter (where tipo = 'abriu_filtro')          as abriram_filtro,
  count(*) filter (where tipo = 'gerou_filtro')          as geraram_filtro,
  count(*) filter (where tipo in ('baixou_filtro','compartilhou_filtro')) as salvaram_filtro,
  count(*) filter (where tipo = 'compartilhou_pagina')   as compartilharam_pagina,
  count(distinct sessao)                                  as sessoes
from public.eventos
group by 1
order by 1 desc;

-- ───────────────────────────────────────────────────────────────
-- Cliques em grupo por município. Ordenado. Diz onde a campanha pegou.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_municipio as
select
  m.slug,
  m.nome,
  count(e.id) filter (where e.tipo = 'clicou_grupo')               as cliques,
  count(distinct e.sessao) filter (where e.tipo = 'clicou_grupo')  as pessoas,
  count(e.id) filter (where e.tipo = 'entrou_grupo_indisponivel')  as bateram_na_porta_fechada,
  max(e.criado_em) filter (where e.tipo = 'clicou_grupo')          as ultimo_clique
from public.municipios m
left join public.eventos e on e.municipio_slug = m.slug
group by m.slug, m.nome
order by cliques desc, m.nome;

-- ───────────────────────────────────────────────────────────────
-- Qual botão trabalha e qual é enfeite.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_origem as
select
  coalesce(origem, 'sem_origem') as origem,
  count(*)                        as cliques,
  count(distinct sessao)          as pessoas
from public.eventos
where tipo = 'clicou_grupo'
group by 1
order by cliques desc;

-- ───────────────────────────────────────────────────────────────
-- Tráfego pago: visita por UTM.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_utm as
select
  coalesce(utm, 'organico')  as utm,
  count(*)                    as visitas,
  count(distinct sessao)      as pessoas,
  count(*) filter (where tipo = 'clicou_grupo') as cliques_grupo
from public.eventos
group by 1
order by visitas desc;

-- ───────────────────────────────────────────────────────────────
-- Celular vs desktop.
-- ───────────────────────────────────────────────────────────────
create or replace view public.metricas_por_dispositivo as
select
  coalesce(dispositivo, 'desconhecido') as dispositivo,
  count(distinct sessao)                 as pessoas,
  count(*) filter (where tipo = 'clicou_grupo')  as cliques_grupo,
  count(*) filter (where tipo = 'gerou_filtro')  as filtros_gerados
from public.eventos
group by 1
order by pessoas desc;

-- ───────────────────────────────────────────────────────────────
-- Painel de grupos: linha por município já com o que a tela mostra.
-- ───────────────────────────────────────────────────────────────
create or replace view public.painel_grupos as
select
  m.slug           as municipio_slug,
  m.nome           as municipio,
  g.id,
  g.ordem,
  g.link,
  g.status,
  g.fixado,
  g.limite_cliques,
  g.cliques,
  g.observacao,
  g.atualizado_em,
  case
    when g.limite_cliques is null then null
    else round((g.cliques::numeric / g.limite_cliques) * 100, 1)
  end as pct_do_limite
from public.municipios m
left join public.grupos g on g.municipio_slug = m.slug
order by m.nome, g.ordem;

-- Nenhuma destas views é para o navegador.
revoke all on public.metricas_funil_dia,
              public.metricas_por_municipio,
              public.metricas_por_origem,
              public.metricas_por_utm,
              public.metricas_por_dispositivo,
              public.painel_grupos
  from anon, authenticated;


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820030000_evento_cta.sql                                    ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0005 · SEPARA "CLICOU NO CTA" DE "ENTROU NO GRUPO"
--
-- Os botões do hero, topo, flutuante e CTA final não levam a
-- grupo nenhum: eles rolam a tela até a lista. Gravar isso como
-- `clicou_grupo` fazia o painel dizer que o hero converte quando
-- ele só rolou a página — e era justamente a pergunta que o
-- painel existe para responder.
--
-- Agora:
--   clicou_cta    → apertou um botão que leva à lista
--   clicou_grupo  → saiu de fato para o WhatsApp (só o servidor grava)
-- ═══════════════════════════════════════════════════════════════

alter table public.eventos drop constraint if exists eventos_tipo_valido;

alter table public.eventos add constraint eventos_tipo_valido check (tipo in (
  'pagina_vista','rolou_50','rolou_90',
  'buscou_cidade','usou_localizacao',
  'clicou_cta','clicou_grupo','entrou_grupo_indisponivel',
  'abriu_filtro','subiu_foto','gerou_filtro',
  'baixou_filtro','compartilhou_filtro',
  'compartilhou_pagina','clicou_instagram'
));

-- Índice parcial para a tela "qual botão trabalha".
create index if not exists eventos_cta_origem
  on public.eventos (origem, criado_em desc)
  where tipo = 'clicou_cta';

-- ───────────────────────────────────────────────────────────────
-- O funil ganha a etapa intermediária.
--
-- `create or replace view` não renomeia nem reordena coluna — a view
-- precisa cair e nascer de novo. São views de leitura, sem dado
-- próprio: derrubar não perde nada.
-- ───────────────────────────────────────────────────────────────
drop view if exists public.metricas_funil_dia;
create view public.metricas_funil_dia as
select
  -- ⚠️ FUSO DA CAMPANHA: agrupa o dia em Rondônia (UTC−4), não em
  --    Brasília. Ver o cabeçalho deste arquivo.
  --
  -- ⚠️ A VÍRGULA VOLTOU PARA DEPOIS DE `dia`, e este era um erro de
  --    sintaxe de verdade: ela estava no fim da linha do comentário, e
  --    `--` engole tudo até a quebra de linha. O select virava
  --    `as dia count(*) ...` e o arquivo inteiro parava aqui, na
  --    linha 370, com "syntax error at or near count". Como a instalação
  --    roda em `ON_ERROR_STOP`, nada depois desta view era criado.
  (criado_em at time zone 'America/Porto_Velho')::date as dia,
  count(*) filter (where tipo = 'pagina_vista')          as viram_pagina,
  count(*) filter (where tipo = 'rolou_50')              as rolaram_metade,
  count(*) filter (where tipo = 'rolou_90')              as rolaram_fim,
  count(*) filter (where tipo = 'buscou_cidade')         as buscaram_cidade,
  count(*) filter (where tipo = 'usou_localizacao')      as usaram_gps,
  count(*) filter (where tipo = 'clicou_cta')            as clicaram_cta,
  count(*) filter (where tipo = 'clicou_grupo')          as clicaram_grupo,
  count(*) filter (where tipo = 'abriu_filtro')          as abriram_filtro,
  count(*) filter (where tipo = 'gerou_filtro')          as geraram_filtro,
  count(*) filter (where tipo in ('baixou_filtro','compartilhou_filtro')) as salvaram_filtro,
  count(*) filter (where tipo = 'compartilhou_pagina')   as compartilharam_pagina,
  count(distinct sessao)                                  as sessoes
from public.eventos
group by 1
order by 1 desc;

-- ───────────────────────────────────────────────────────────────
-- "Qual botão trabalha" passa a comparar as duas pontas:
-- quantos apertaram o botão × quantos realmente entraram.
-- ───────────────────────────────────────────────────────────────
drop view if exists public.metricas_por_origem;
create view public.metricas_por_origem as
select
  coalesce(origem, 'sem_origem')                    as origem,
  count(*) filter (where tipo = 'clicou_cta')       as cliques_no_botao,
  count(*) filter (where tipo = 'clicou_grupo')     as entradas_em_grupo,
  count(distinct sessao) filter (where tipo = 'clicou_grupo') as pessoas
from public.eventos
where tipo in ('clicou_cta','clicou_grupo')
group by 1
order by entradas_em_grupo desc, cliques_no_botao desc;

revoke all on public.metricas_funil_dia, public.metricas_por_origem
  from anon, authenticated;


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820033000_eh_admin_privado.sql                              ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0006 · TIRA eh_admin() DA API PÚBLICA
--
-- O linter do Supabase apontou: qualquer pessoa podia chamar
-- `/rest/v1/rpc/eh_admin` sem estar logada. O impacto era pequeno
-- (a função só devolve true/false sobre quem está chamando), mas é
-- uma função SECURITY DEFINER pendurada na API aberta, e isso não
-- precisa existir.
--
-- Revogar o EXECUTE não serve: as policies de RLS chamam a função
-- e são avaliadas com as permissões de quem consulta — tirar o
-- EXECUTE quebraria o acesso do próprio admin.
--
-- A saída certa é mudar de endereço: schema `private`, que o
-- PostgREST não expõe. As policies continuam chamando normalmente.
-- ═══════════════════════════════════════════════════════════════

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.eh_admin() from public, anon;
grant execute on function private.eh_admin() to authenticated, service_role;

-- ───────────────────────────────────────────────────────────────
-- Reaponta as policies para o novo endereço.
-- ───────────────────────────────────────────────────────────────
drop policy if exists municipios_escrita_admin on public.municipios;
create policy municipios_escrita_admin
  on public.municipios for all
  to authenticated
  using ((select private.eh_admin()))
  with check ((select private.eh_admin()));

drop policy if exists grupos_escrita_admin on public.grupos;
create policy grupos_escrita_admin
  on public.grupos for all
  to authenticated
  using ((select private.eh_admin()))
  with check ((select private.eh_admin()));

drop policy if exists eventos_leitura_admin on public.eventos;
create policy eventos_leitura_admin
  on public.eventos for select
  to authenticated
  using ((select private.eh_admin()));

-- Agora sim dá para derrubar a versão exposta.
drop function if exists public.eh_admin();


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820034000_policies_sem_sobreposicao.sql                     ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0007 · TIRA A SOBREPOSIÇÃO DE POLICIES
--
-- As policies de admin foram criadas com `for all`, que inclui
-- SELECT. Como já existe a policy de leitura pública valendo para
-- `authenticated`, o Postgres avaliava DUAS policies permissivas em
-- todo SELECT — e a de admin chama eh_admin(), que bate na tabela
-- de administradores.
--
-- O admin não precisa de policy para ler: a de leitura pública já
-- resolve. A de admin passa a cobrir só escrita.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists municipios_escrita_admin on public.municipios;

create policy municipios_insere_admin on public.municipios
  for insert to authenticated with check ((select private.eh_admin()));
create policy municipios_atualiza_admin on public.municipios
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));
create policy municipios_apaga_admin on public.municipios
  for delete to authenticated using ((select private.eh_admin()));

drop policy if exists grupos_escrita_admin on public.grupos;

create policy grupos_insere_admin on public.grupos
  for insert to authenticated with check ((select private.eh_admin()));
create policy grupos_atualiza_admin on public.grupos
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));
create policy grupos_apaga_admin on public.grupos
  for delete to authenticated using ((select private.eh_admin()));


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820120000_clique_atomico.sql                                ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0008 · CONTAGEM DE CLIQUE ATÔMICA
--
-- `registrarCliqueNoGrupo` fazia ler-modificar-escrever em JS:
--
--     const cliques = grupo.cliques + 1
--     update grupos set cliques = <cliques>
--
-- Dois cliques simultâneos leem o mesmo valor e gravam o mesmo
-- número — conta um. Numa carreata com 300 pessoas escaneando o
-- mesmo QR, o limite de 700 demora demais a ser atingido e o grupo
-- estoura de gente antes de virar.
--
-- Esta função faz o incremento e a virada dentro de UMA transação,
-- com a linha travada. Também resolve a virada do fixado, que hoje
-- são dois UPDATEs soltos em que o erro do primeiro é ignorado.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.contar_clique(p_grupo_id uuid)
returns table (cliques integer, status text, virou boolean)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  g            public.grupos%rowtype;
  v_estourou   boolean := false;
  v_proximo_id uuid;
begin
  -- Trava a linha até o fim da transação. É isto que torna a conta correta.
  select * into g from public.grupos where id = p_grupo_id for update;
  if not found then
    return;
  end if;

  update public.grupos
     set cliques = public.grupos.cliques + 1
   where id = p_grupo_id
   returning * into g;

  v_estourou := g.limite_cliques is not null and g.cliques >= g.limite_cliques;

  if v_estourou and g.status = 'aberto' then
    update public.grupos set status = 'cheio' where id = p_grupo_id
      returning * into g;

    -- Se o que estourou era o fixado, o próximo aberto assume sozinho.
    if g.fixado then
      select id into v_proximo_id
        from public.grupos
       where municipio_slug = g.municipio_slug
         and status = 'aberto'
         and ordem > g.ordem
       order by ordem
       limit 1;

      if v_proximo_id is not null then
        update public.grupos set fixado = false where id = p_grupo_id;
        update public.grupos set fixado = true  where id = v_proximo_id;
      end if;
    end if;
  end if;

  return query select g.cliques, g.status, v_estourou;
end $$;

comment on function public.contar_clique(uuid) is
  'Incrementa o clique e aplica a virada por limite, atomicamente. Só service_role.';

-- Só o servidor chama, com service_role. Ninguém mais.
revoke all on function public.contar_clique(uuid) from public, anon, authenticated;


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820130000_clique_atomico_fix.sql                            ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0009 · CORRIGE contar_clique
--
-- A versão anterior declarava os parâmetros de saída como `cliques`
-- e `status` — os mesmos nomes das colunas de `grupos`. No corpo,
-- `g.status` ficava ambíguo entre a coluna do registro e o parâmetro
-- de saída, e o Postgres recusava com
--     column reference "status" is ambiguous
-- abortando a transação inteira: o clique não era contado.
--
-- Sintoma no teste: 12 cliques simultâneos, 4 contados.
--
-- Correção: prefixo `r_` nos parâmetros de saída. Nenhum nome de
-- saída pode repetir nome de coluna dentro de uma função plpgsql.
-- ═══════════════════════════════════════════════════════════════

drop function if exists public.contar_clique(uuid);

create function public.contar_clique(p_grupo_id uuid)
returns table (r_cliques integer, r_status text, r_virou boolean)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  g            public.grupos%rowtype;
  v_estourou   boolean := false;
  v_proximo_id uuid;
begin
  -- Trava a linha até o fim da transação. É isto que torna a conta correta.
  select * into g from public.grupos where id = p_grupo_id for update;
  if not found then
    return;
  end if;

  update public.grupos
     set cliques = public.grupos.cliques + 1
   where id = p_grupo_id
   returning * into g;

  v_estourou := g.limite_cliques is not null and g.cliques >= g.limite_cliques;

  if v_estourou and g.status = 'aberto' then
    update public.grupos set status = 'cheio' where id = p_grupo_id
      returning * into g;

    -- Se o que estourou era o fixado, o próximo aberto assume sozinho.
    if g.fixado then
      select id into v_proximo_id
        from public.grupos
       where municipio_slug = g.municipio_slug
         and status = 'aberto'
         and ordem > g.ordem
       order by ordem
       limit 1;

      if v_proximo_id is not null then
        update public.grupos set fixado = false where id = p_grupo_id;
        update public.grupos set fixado = true  where id = v_proximo_id;
      end if;
    end if;
  end if;

  r_cliques := g.cliques;
  r_status  := g.status;
  r_virou   := v_estourou;
  return next;
end $$;

comment on function public.contar_clique(uuid) is
  'Incrementa o clique e aplica a virada por limite, atomicamente. Só service_role.';

revoke all on function public.contar_clique(uuid) from public, anon, authenticated;


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820150000_conteudo.sql                                      ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0010 · CONTEÚDO EDITÁVEL
--
-- `content/copy.ts` continua sendo a VERDADE PADRÃO. Esta tabela
-- guarda só o que foi editado — override esparso, nunca cópia.
--
-- Banco vazio = site idêntico ao de hoje. Isso é requisito, não
-- consequência: NADA aqui é semeado por migration. Semear congelaria
-- a copy no dia do deploy, e toda melhoria posterior em copy.ts
-- deixaria de aparecer, em silêncio.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.conteudo (
  secao          text primary key,
  dados          jsonb not null default '{}'::jsonb,
  versao         integer not null default 1,
  atualizado_por text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),

  -- Conjunto fechado, espelhando as chaves de content/copy.ts.
  -- Impede que uma ação forjada crie seção fantasma. Seção nova
  -- custa uma linha de migration, o que é raro e é o certo.
  --
  -- ⚠️ 'ctaFinal' está em camelCase porque é VALOR de texto, não
  --    identificador — o Postgres não faz folding aqui. Não
  --    "conserte" para cta_final: quebra o mapeamento direto com a
  --    chave do TypeScript.
  constraint conteudo_secao_conhecida check (secao in (
    'candidata','meta','navegacao','ctas','hero','origem','problema',
    'valores','provas','futuro','grupos','filtro','compartilhar',
    'ctaFinal','rodape','privacidade'
  )),
  constraint conteudo_dados_objeto  check (jsonb_typeof(dados) = 'object'),
  -- Teto por seção. Barra payload absurdo vindo de ação forjada.
  constraint conteudo_dados_tamanho check (pg_column_size(dados) < 262144)
);

comment on table public.conteudo is
  'Override esparso sobre content/copy.ts. Linha ausente = seção 100% padrão.';

-- ───────────────────────────────────────────────────────────────
-- Histórico. Append-only, nunca destrutivo.
--
-- Guarda a imagem NOVA (não a antiga) porque a lista do painel
-- precisa mostrar "o que este salvamento produziu". Desfazer é
-- escrever a versão N de volta, o que gera a versão N+1.
-- ───────────────────────────────────────────────────────────────
create table if not exists public.conteudo_versoes (
  id        bigint generated always as identity primary key,
  secao     text not null references public.conteudo(secao) on delete cascade,
  versao    integer not null,
  dados     jsonb not null,
  autor     text,
  criado_em timestamptz not null default now(),
  unique (secao, versao)
);

create index if not exists conteudo_versoes_secao_data
  on public.conteudo_versoes (secao, criado_em desc);

-- ───────────────────────────────────────────────────────────────
-- ⚠️ SÃO DOIS GATILHOS, e não dá para juntar:
--    `new.versao` só pode ser alterado em BEFORE; a linha só existe
--    para ser copiada em AFTER. Tentar fazer os dois num só custa
--    meia tarde até a ficha cair.
-- ───────────────────────────────────────────────────────────────
create or replace function public.tocar_versao_conteudo()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.versao := old.versao + 1;
  new.atualizado_em := now();
  return new;
end $$;

drop trigger if exists conteudo_bump_versao on public.conteudo;
create trigger conteudo_bump_versao
  before update on public.conteudo
  for each row when (old.dados is distinct from new.dados)
  execute function public.tocar_versao_conteudo();

create or replace function public.registrar_versao_conteudo()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.conteudo_versoes (secao, versao, dados, autor)
  values (new.secao, new.versao, new.dados, new.atualizado_por);
  return null;
end $$;

drop trigger if exists conteudo_versiona_insert on public.conteudo;
create trigger conteudo_versiona_insert
  after insert on public.conteudo
  for each row execute function public.registrar_versao_conteudo();

-- A condição evita versão-lixo quando alguém aperta Salvar duas
-- vezes sem ter mudado nada.
drop trigger if exists conteudo_versiona_update on public.conteudo;
create trigger conteudo_versiona_update
  after update on public.conteudo
  for each row when (old.dados is distinct from new.dados)
  execute function public.registrar_versao_conteudo();

-- ═══════════════════════════════════════════════════════════════
-- SEGURANÇA
--
-- Diferente de `municipios` (leitura pública) DE PROPÓSITO: nada no
-- navegador consulta conteúdo direto. O servidor lê com service_role
-- e entrega já renderizado. Mesmo modelo de `eventos`.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo         enable row level security;
alter table public.conteudo_versoes enable row level security;

revoke all on table public.conteudo         from anon, authenticated;
revoke all on table public.conteudo_versoes from anon, authenticated;

-- Rede embaixo do trapézio para quando o painel migrar de senha
-- única para Supabase Auth.
drop policy if exists conteudo_le_admin on public.conteudo;
create policy conteudo_le_admin on public.conteudo
  for select to authenticated using ((select private.eh_admin()));

drop policy if exists conteudo_insere_admin on public.conteudo;
create policy conteudo_insere_admin on public.conteudo
  for insert to authenticated with check ((select private.eh_admin()));

drop policy if exists conteudo_atualiza_admin on public.conteudo;
create policy conteudo_atualiza_admin on public.conteudo
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- Sem policy de DELETE: "voltar ao original" é update … set dados = '{}',
-- não delete. Preserva o histórico.

drop policy if exists conteudo_versoes_le_admin on public.conteudo_versoes;
create policy conteudo_versoes_le_admin on public.conteudo_versoes
  for select to authenticated using ((select private.eh_admin()));

grant select, insert, update on table public.conteudo         to authenticated;
grant select                 on table public.conteudo_versoes to authenticated;


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820160000_conteudo_paginas.sql                              ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0011 · SEÇÃO `paginas`
--
-- A metadata de /filtro, /grupos e /politica-de-privacidade estava
-- hardcoded em cada `export const metadata`: mudar o título da aba
-- ou o texto do cartão do WhatsApp exigia deploy.
--
-- Seção nova custa uma linha de migration de propósito — o conjunto
-- fechado é o que impede uma ação forjada de criar seção fantasma.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','meta','paginas','navegacao','ctas','hero','origem','problema',
  'valores','provas','futuro','grupos','filtro','compartilhar',
  'ctaFinal','rodape','privacidade'
));


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820180000_midia.sql                                         ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0012 · MÍDIA
--
-- Um SLOT é um lugar da página que aceita imagem, com chave estável
-- (`hero.retrato`, `provas.entrega.1`). Os slots vivem em CÓDIGO
-- (content/slots.ts), não aqui: um slot só existe se algum componente
-- o renderiza. Adicionar slot é mudança de layout. Trocar a imagem do
-- slot é ação do admin. O banco guarda a LIGAÇÃO.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.midia (
  id        uuid primary key default gen_random_uuid(),
  balde     text not null default 'midia',
  caminho   text not null,
  largura   integer not null,
  altura    integer not null,
  bytes     integer not null,
  tem_alpha boolean not null default false,
  blur      text,
  -- sha256 do ORIGINAL: reenviar o mesmo arquivo é no-op.
  hash      text not null,
  texto_alt text,
  criado_em timestamptz not null default now(),

  unique (balde, caminho),
  unique (balde, hash),
  constraint midia_dimensoes  check (largura > 0 and altura > 0),
  -- O blur viaja no HTML a cada render. Se crescer, vira peso morto.
  constraint midia_blur_curto check (blur is null or length(blur) < 4096)
);

comment on column public.midia.hash is
  'Do arquivo ORIGINAL. O caminho no Storage é derivado dele, então trocar a imagem nunca invalida o cache da antiga.';

-- Duas tabelas e não uma: a mesma imagem pode servir vários slots,
-- desfazer é RELIGAR o slot à mídia anterior (o arquivo precisa
-- sobreviver à ligação), e apagar ligação não pode apagar arquivo.
create table if not exists public.midia_slots (
  slot           text primary key,
  midia_id       uuid not null references public.midia(id) on delete restrict,
  texto_alt      text,
  atualizado_em  timestamptz not null default now(),
  atualizado_por text
);

alter table public.midia       enable row level security;
alter table public.midia_slots enable row level security;

revoke all on table public.midia, public.midia_slots from anon, authenticated;

drop policy if exists midia_le_admin on public.midia;
create policy midia_le_admin on public.midia
  for select to authenticated using ((select private.eh_admin()));

drop policy if exists midia_slots_le_admin on public.midia_slots;
create policy midia_slots_le_admin on public.midia_slots
  for select to authenticated using ((select private.eh_admin()));

grant select on table public.midia, public.midia_slots to authenticated;

-- ───────────────────────────────────────────────────────────────
-- Baldes
--
-- Dois, e a razão não é organização: é fronteira de validação.
-- `molduras` guarda imagens COMPOSTAS na foto da pessoa — dimensão
-- exata obrigatória, alpha obrigatório, CNPJ da campanha exigido por
-- lei. Upload errado ali quebra uma funcionalidade para todo mundo,
-- não estraga uma foto.
--
-- Públicos porque são material de campanha público. Balde privado
-- forçaria URL assinada que expira, quebrando o cache do next/image
-- e o robô de prévia do WhatsApp.
-- ───────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('midia',    'midia',    true, 10485760, array['image/webp','image/png','image/jpeg']),
  ('molduras', 'molduras', true,  5242880, array['image/webp','image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Escrita: NENHUMA policy. Sem policy = sem acesso para anon e
-- authenticated. Toda escrita passa pelo servidor com service_role,
-- igual a `eventos`. É intencional.
--
-- ⚠️ Leitura: com public = true o Storage serve /object/public/… SEM
--    consultar RLS. A policy abaixo só vale para a API autenticada.
--    Não confunda com proteção.
drop policy if exists midia_leitura_publica on storage.objects;
create policy midia_leitura_publica on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('midia', 'molduras'));


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260820200000_secoes_album_rua_social.sql                       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0013 · SEÇÕES `album`, `rua`, `social`, `exibir` — e o conserto de `faixa` e `cena`
--
-- Seção nova custa uma linha de migration de propósito: o conjunto
-- fechado é o que impede uma ação forjada de criar seção fantasma.
--
-- Três seções entram com a estrutura de fotos:
--
--   album   o acervo de família — oito fotos de papel
--   rua     a prova visual da manchete ("eu fui pra rua")
--   social  prova social: comentários, ataques e processos vencidos
--   exibir  os interruptores de visibilidade de cada seção
--
-- ⚠️ E DUAS QUE JÁ DEVIAM ESTAR AQUI. `faixa` e `cena` existem em
--    content/copy.ts e em content/esquema.ts desde que foram criadas,
--    então o painel sempre ofereceu as duas para edição — mas nunca
--    entraram nesta lista. Quem tentasse salvar qualquer uma das duas
--    levava violação de constraint, com a mensagem crua do Postgres.
--    Ninguém tinha editado ainda; por isso passou.
--
-- A lista abaixo é o espelho de PADRAO em content/copy.ts. As duas
-- precisam andar juntas: acrescentar seção no arquivo sem acrescentar
-- aqui produz exatamente o defeito de `faixa` e `cena`.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','futuro','grupos','filtro','compartilhar','ctaFinal',
  'rodape','privacidade','exibir'
));


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260821210000_secoes_trilha_aparencia.sql                       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0014 · SEÇÕES NOVAS: trilha e aparência
--
-- ⚠️ A LISTA DE SEÇÕES VIVE EM DOIS LUGARES, e este é o segundo. O
--    primeiro é `content/copy.ts`, que é a verdade; aqui a trava só
--    confere que ninguém grave uma seção inventada por ação forjada.
--
--    O custo de ter duas listas apareceu na prática: `trilha` e
--    `aparencia` nasceram no código e o painel recusou o salvamento
--    com "violates check constraint conteudo_secao_conhecida" — uma
--    mensagem de Postgres na cara de quem só queria arrastar um
--    controle de textura.
--
--    Mantive a trava mesmo assim. Ela é a última linha entre um
--    payload adulterado e uma linha órfã no banco, e o preço de
--    esquecê-la é uma migração — não um vazamento.
-- ═══════════════════════════════════════════════════════════════

alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidata','aparencia','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','trilha','futuro','grupos','filtro','compartilhar',
  'ctaFinal','rodape','privacidade','exibir'
));


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ 20260822120000_trafego.sql                                       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 0015 · TRÁFEGO — Meta Pixel, Conversions API e GTM
--
-- ⚠️ POR QUE UMA TABELA PRÓPRIA, E NÃO MAIS UMA SEÇÃO EM `conteudo`.
--
--    Porque aqui mora um SEGREDO. O token da Conversions API dá a
--    quem o tiver o direito de escrever eventos no pixel da campanha,
--    e `conteudo` é versionado: cada salvamento copia a linha inteira
--    para `conteudo_versoes`, para sempre. O token entraria no
--    histórico em texto puro e continuaria lá depois de trocado —
--    justamente o que não se faz com credencial.
--
--    Aqui não há gatilho de versão. Trocar o token apaga o anterior,
--    que é o comportamento certo para uma credencial.
--
-- ⚠️ UMA LINHA SÓ, e a trava é o tipo da chave primária: `id` é
--    boolean com `check (id)`, então o único valor aceito é `true`.
--    É a forma mais barata de dizer "singleton" em Postgres — sem
--    isso, um upsert errado criaria uma segunda configuração de
--    tráfego e o site passaria a escolher uma delas por sorte.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.trafego (
  id                       boolean primary key default true check (id),

  -- Público: desce para o navegador dentro do script do pixel.
  meta_pixel_id            text,
  -- Público: o container do Tag Manager.
  gtm_id                   text,
  -- Público: vira <meta name="facebook-domain-verification">.
  meta_dominio             text,

  -- ⚠️ SEGREDO. Nunca atravessa a fronteira servidor→navegador.
  --    Só `lib/trafego/ler.ts` o lê, e só para falar com a Graph API.
  meta_capi_token          text,
  -- Código de teste do Gerenciador de Eventos. Com ele preenchido os
  -- eventos aparecem em "Eventos de teste" e NÃO contam como
  -- conversão — por isso ele precisa ser esvaziado depois do teste.
  meta_capi_teste          text,
  -- A versão da Graph API. Editável de propósito: a Meta aposenta
  -- versão a cada ~2 anos, e quando a atual morrer o conserto não
  -- pode depender de um deploy.
  meta_api_versao          text not null default 'v21.0',
  -- Interruptor geral do envio pelo servidor.
  capi_ativa               boolean not null default true,

  atualizado_por           text,
  atualizado_em            timestamptz not null default now()
);

comment on table public.trafego is
  'Configuração de rastreamento. Uma linha só. Contém credencial: nunca exponha ao navegador.';

-- ───────────────────────────────────────────────────────────────
-- SEGURANÇA — mesmo modelo de `conteudo`: nada no navegador consulta
-- esta tabela. O servidor lê com service_role.
-- ───────────────────────────────────────────────────────────────

alter table public.trafego enable row level security;

revoke all on table public.trafego from anon, authenticated;

drop policy if exists trafego_le_admin on public.trafego;
create policy trafego_le_admin on public.trafego
  for select to authenticated using ((select private.eh_admin()));

drop policy if exists trafego_insere_admin on public.trafego;
create policy trafego_insere_admin on public.trafego
  for insert to authenticated with check ((select private.eh_admin()));

drop policy if exists trafego_atualiza_admin on public.trafego;
create policy trafego_atualiza_admin on public.trafego
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

grant select, insert, update on table public.trafego to authenticated;
