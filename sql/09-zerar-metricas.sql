-- ═══════════════════════════════════════════════════════════════════════
--  09 · ZERAR AS MÉTRICAS   (destrutivo, mas seguro)
--
--  Apaga os eventos e zera o contador de cliques dos grupos.
--
--  PARA QUE SERVE: você testou a página inteira antes de publicar —
--  clicou nos botões, entrou nos grupos, gerou fotos — e agora o
--  painel mostra um funil que é o seu próprio teste. Rodar isto no dia
--  em que a campanha vai ao ar deixa os números limpos.
--
--  ⚠️ NÃO TOCA em grupos, links, conteúdo, imagens nem configuração de
--     tráfego. Só apaga MEDIÇÃO. Ainda assim é irreversível: eventos
--     apagados não voltam.
-- ═══════════════════════════════════════════════════════════════════════

truncate table public.eventos;

update public.grupos set cliques = 0;

-- Conferir:
-- select count(*) as eventos from public.eventos;
-- select sum(cliques) as cliques from public.grupos;
