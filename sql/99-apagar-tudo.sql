-- ═══════════════════════════════════════════════════════════════════════
--  99 · APAGAR TUDO   ⛔ DESTRUTIVO E IRREVERSÍVEL
--
--  Derruba TODAS as tabelas, views e funções criadas por este projeto,
--  incluindo os LINKS DOS GRUPOS, o conteúdo editado no painel e o
--  histórico de versões. Não há desfazer.
--
--  Existe por um motivo só: reinstalar do zero num projeto Supabase
--  que já foi usado por outra campanha. Se é isso que você quer, o
--  caminho mais seguro ainda é criar um projeto Supabase novo — sai
--  de graça e não corre o risco de derrubar o banco errado.
--
--  ANTES DE RODAR, EXPORTE OS LINKS:
--    Painel ▸ Grupos ▸ Exportar CSV
--    (ou: select municipio_slug, ordem, link from public.grupos;)
--
--  Para rodar, apague a linha do `raise exception` abaixo. Ela está
--  aqui para impedir a execução por engano de quem colou o arquivo
--  inteiro sem ler — que é exatamente como este tipo de acidente
--  acontece.
-- ═══════════════════════════════════════════════════════════════════════

do $$ begin
  raise exception 'Leia o cabeçalho de sql/99-apagar-tudo.sql e apague esta linha para confirmar.';
end $$;

drop view if exists public.metricas_funil_dia        cascade;
drop view if exists public.metricas_por_municipio    cascade;
drop view if exists public.metricas_por_origem       cascade;
drop view if exists public.metricas_por_utm          cascade;
drop view if exists public.metricas_por_dispositivo  cascade;
drop view if exists public.municipios_publicos       cascade;
drop view if exists public.grupos_publicos           cascade;
drop view if exists public.painel_grupos             cascade;

drop table if exists public.conteudo_versoes cascade;
drop table if exists public.conteudo         cascade;
drop table if exists public.midia_slots      cascade;
drop table if exists public.midia            cascade;
drop table if exists public.trafego          cascade;
drop table if exists public.eventos          cascade;
drop table if exists public.grupos           cascade;
drop table if exists public.municipios       cascade;
drop table if exists public.administradores  cascade;

drop function if exists public.contar_clique(uuid)              cascade;
drop function if exists public.tocar_atualizado_em()            cascade;
drop function if exists public.tocar_versao_conteudo()          cascade;
drop function if exists public.registrar_versao_conteudo()      cascade;
drop function if exists public.eh_admin()                       cascade;
drop function if exists private.eh_admin()                      cascade;
drop schema   if exists private                                 cascade;

-- Os arquivos enviados pelo painel ficam no Storage e NÃO saem daqui.
-- Apagar os baldes é decisão à parte:
--   delete from storage.objects where bucket_id in ('midia','molduras');
--   delete from storage.buckets where id in ('midia','molduras');
