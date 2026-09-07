-- ═══════════════════════════════════════════════════════════════
-- A SEÇÃO SE CHAMA `candidato`, E A TRAVA DIZIA `candidata`
--
-- ⚠️ ISTO IMPEDIA SALVAR UMA SEÇÃO INTEIRA DO PAINEL. A chave usada
--    pelo código é `candidato` (ver `content/copy.ts` e a lista de
--    seções de `content/esquema.ts`), mas todas as versões desta trava
--    listavam `candidata` — resto de a primeira campanha montada neste
--    modelo ter sido de uma mulher.
--
--    O sintoma: abrir Painel ▸ Identidade ▸ "Quem é <nome>", editar,
--    salvar, e receber `violates check constraint
--    conteudo_secao_conhecida`. Nada no código dava pista, porque o
--    código está certo — quem estava errado era a lista no banco.
--
-- ⚠️ É O MESMO ERRO QUE A MIGRAÇÃO DE `trilha` E `aparencia` JÁ
--    DOCUMENTOU, pela terceira vez. O padrão merece registro: chave
--    nova (ou renomeada) em `content/` que não entra nesta lista não
--    dá erro em desenvolvimento — ela só falha ao SALVAR, e só onde o
--    Supabase está ligado. Quem acrescentar chave em `PADRAO` tem de
--    vir aqui no mesmo commit.
--
-- ⚠️ A ORDEM DOS PASSOS NÃO É ARBITRÁRIA, e foi ela que quase custou o
--    histórico de edições. `conteudo_versoes.secao` aponta para
--    `conteudo.secao` com `on delete cascade` e SEM `on update
--    cascade`: renomear a linha-mãe direto violaria a chave
--    estrangeira, porque as versões continuariam apontando para
--    `candidata`. Por isso a FK é corrigida ANTES do rename — e fica
--    corrigida para a próxima vez, que é o ganho de verdade aqui.
--
--    A alternativa que eu descartei era apagar a linha antiga. Seria
--    silencioso e levaria junto todo o histórico de versões dela, pelo
--    `on delete cascade`. Renomear preserva as duas coisas.
--
-- Segura de rodar mais de uma vez, e segura em banco que ainda não
-- tem a trava.
-- ═══════════════════════════════════════════════════════════════

-- 1. A trava sai temporariamente: enquanto ela listar só `candidata`,
--    nenhum passo abaixo consegue gravar o nome certo.
alter table public.conteudo drop constraint if exists conteudo_secao_conhecida;

-- 2. A chave estrangeira do histórico passa a acompanhar renomeação.
--    `conteudo_versoes_secao_fkey` é o nome que o Postgres dá por
--    padrão a uma FK declarada em linha (`<tabela>_<coluna>_fkey`), e
--    é assim que ela nasceu em `20260820150000_conteudo.sql`.
alter table public.conteudo_versoes
  drop constraint if exists conteudo_versoes_secao_fkey;

alter table public.conteudo_versoes
  add constraint conteudo_versoes_secao_fkey
  foreign key (secao) references public.conteudo(secao)
  on delete cascade on update cascade;

-- 3. O rename. Com a FK acima, o histórico vem junto sozinho.
--    Sem linha `candidata` gravada, é um no-op.
update public.conteudo set secao = 'candidato' where secao = 'candidata';

-- 4. A trava volta, agora com o nome que o código realmente usa.
alter table public.conteudo add constraint conteudo_secao_conhecida check (secao in (
  'candidato','aparencia','meta','paginas','navegacao','ctas',
  'hero','origem','album','rua','problema','valores','faixa','cena',
  'provas','social','trilha','futuro','grupos','filtro','compartilhar',
  'ctaFinal','rodape','privacidade','exibir'
));
