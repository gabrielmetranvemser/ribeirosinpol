-- ═══════════════════════════════════════════════════════════════
-- 02 · Rondônia (RO) — 52 municípios
--
-- GERADO POR scripts/gerar-uf.mjs. Não editar à mão: rodar
-- `npm run uf -- RO` de novo reescreve este arquivo.
--
-- Idempotente: pode rodar quantas vezes quiser. Rodar depois de
-- a campanha começar ATUALIZA nome e coordenada e não toca em
-- grupo nenhum — os links já cadastrados continuam onde estão.
--
-- ⚠️ Coordenada é o centro geométrico do município, não a sede.
--    Conferir 5 municípios distantes entre si antes de publicar.
-- ═══════════════════════════════════════════════════════════════

insert into public.municipios (slug, nome, latitude, longitude) values
  ('alta-floresta-doeste', 'Alta Floresta D''Oeste', -12.472449, -62.274992),
  ('alto-alegre-dos-parecis', 'Alto Alegre dos Parecis', -12.592371, -61.878909),
  ('alto-paraiso', 'Alto Paraíso', -9.650896, -63.3948),
  ('alvorada-doeste', 'Alvorada D''Oeste', -11.309888, -62.545116),
  ('ariquemes', 'Ariquemes', -9.952527, -62.956006),
  ('buritis', 'Buritis', -10.052764, -63.94046),
  ('cabixi', 'Cabixi', -13.474839, -60.641062),
  ('cacaulandia', 'Cacaulândia', -10.331585, -62.9865),
  ('cacoal', 'Cacoal', -11.301189, -61.325362),
  ('campo-novo-de-rondonia', 'Campo Novo de Rondônia', -10.487024, -63.800134),
  ('candeias-do-jamari', 'Candeias do Jamari', -8.887473, -63.326175),
  ('castanheiras', 'Castanheiras', -11.470312, -61.88063),
  ('cerejeiras', 'Cerejeiras', -13.202918, -61.259708),
  ('chupinguaia', 'Chupinguaia', -12.53726, -60.897885),
  ('colorado-do-oeste', 'Colorado do Oeste', -13.159229, -60.548833),
  ('corumbiara', 'Corumbiara', -12.926786, -61.090334),
  ('costa-marques', 'Costa Marques', -12.146506, -64.058826),
  ('cujubim', 'Cujubim', -9.170317, -62.565849),
  ('espigao-doeste', 'Espigão D''Oeste', -11.351585, -60.784916),
  ('governador-jorge-teixeira', 'Governador Jorge Teixeira', -10.748899, -63.184275),
  ('guajara-mirim', 'Guajará-Mirim', -11.304492, -64.537871),
  ('itapua-do-oeste', 'Itapuã do Oeste', -9.172524, -63.045062),
  ('jaru', 'Jaru', -10.590212, -62.582605),
  ('ji-parana', 'Ji-Paraná', -10.46213, -61.757028),
  ('machadinho-doeste', 'Machadinho D''Oeste', -9.204703, -62.01048),
  ('ministro-andreazza', 'Ministro Andreazza', -11.159817, -61.568563),
  ('mirante-da-serra', 'Mirante da Serra', -11.076651, -62.850701),
  ('monte-negro', 'Monte Negro', -10.212642, -63.372216),
  ('nova-brasilandia-doeste', 'Nova Brasilândia D''Oeste', -11.643381, -62.280149),
  ('nova-mamore', 'Nova Mamoré', -10.381655, -64.629358),
  ('nova-uniao', 'Nova União', -10.888805, -62.532472),
  ('novo-horizonte-do-oeste', 'Novo Horizonte do Oeste', -11.680258, -62.082954),
  ('ouro-preto-do-oeste', 'Ouro Preto do Oeste', -10.609204, -62.171609),
  ('parecis', 'Parecis', -12.262514, -61.415016),
  ('pimenta-bueno', 'Pimenta Bueno', -11.894112, -60.830371),
  ('pimenteiras-do-oeste', 'Pimenteiras do Oeste', -13.173821, -61.545973),
  ('porto-velho', 'Porto Velho', -9.152823, -64.303223),
  ('presidente-medici', 'Presidente Médici', -11.166126, -61.877667),
  ('primavera-de-rondonia', 'Primavera de Rondônia', -11.880046, -61.316354),
  ('rio-crespo', 'Rio Crespo', -9.64515, -62.792138),
  ('rolim-de-moura', 'Rolim de Moura', -11.732814, -61.772533),
  ('santa-luzia-doeste', 'Santa Luzia D''Oeste', -12.026698, -61.700825),
  ('sao-felipe-doeste', 'São Felipe D''Oeste', -11.904401, -61.467976),
  ('sao-francisco-do-guapore', 'São Francisco do Guaporé', -12.367978, -63.122784),
  ('sao-miguel-do-guapore', 'São Miguel do Guaporé', -11.616092, -62.982375),
  ('seringueiras', 'Seringueiras', -11.805575, -63.231508),
  ('teixeiropolis', 'Teixeirópolis', -10.943286, -62.279513),
  ('theobroma', 'Theobroma', -10.121408, -62.342934),
  ('urupa', 'Urupá', -11.103526, -62.4241),
  ('vale-do-anari', 'Vale do Anari', -9.733146, -61.938918),
  ('vale-do-paraiso', 'Vale do Paraíso', -10.383481, -62.093793),
  ('vilhena', 'Vilhena', -12.095637, -60.248779)
on conflict (slug) do update
  set nome = excluded.nome,
      latitude = excluded.latitude,
      longitude = excluded.longitude;

-- Um grupo por município, fixado, aguardando o link da campanha.
-- Limite inicial em 700: clique não é entrada, e 1024 chega com o
-- grupo bem vazio. Calibrar depois da primeira semana comparando
-- cliques com o número real de membros.
insert into public.grupos (municipio_slug, ordem, status, fixado, limite_cliques)
select slug, 1, 'em_breve', true, 700
from public.municipios
on conflict (municipio_slug, ordem) do nothing;
