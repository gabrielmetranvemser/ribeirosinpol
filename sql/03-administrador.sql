-- ═══════════════════════════════════════════════════════════════════════
--  03 · ADMINISTRADOR DO PAINEL   (opcional — só no dia da migração)
--
--  ⚠️ NÃO RODE ISTO NA INSTALAÇÃO NORMAL.
--
--  Hoje o painel entra por SENHA ÚNICA, guardada em `PAINEL_SENHA` no
--  .env.local. É simples de propósito: o painel é usado por duas ou
--  três pessoas da campanha e precisa estar no ar hoje. A tabela
--  `administradores` já existe desde a instalação, vazia, esperando.
--
--  Este arquivo é o passo do dia em que a campanha trocar a senha
--  única pelo Supabase Auth — quando o painel passar a ter cinco
--  pessoas e "quem alterou isto?" virar pergunta de verdade.
--
--  COMO USAR
--    1. Supabase ▸ Authentication ▸ Users ▸ Add user
--       (e-mail e senha da pessoa; marque "Auto Confirm User")
--    2. copie o UUID que aparece na lista
--    3. rode o insert abaixo com esse UUID
--    4. troque a checagem de sessão em lib/painel/sessao.ts pelo
--       cliente do Supabase — o resto do painel não muda, porque toda
--       escrita já passa por Server Action com sessão conferida.
--
--  A função `private.eh_admin()` já consulta esta tabela: as policies
--  de RLS passam a valer para a pessoa assim que a linha existir.
-- ═══════════════════════════════════════════════════════════════════════

insert into public.administradores (user_id, nome) values
  ('00000000-0000-0000-0000-000000000000', 'Nome de quem administra')
on conflict (user_id) do update set nome = excluded.nome;

-- Conferir:
-- select a.nome, u.email from public.administradores a
--   join auth.users u on u.id = a.user_id;
