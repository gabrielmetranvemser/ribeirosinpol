/**
 * GERADOR DE ESTADO — troca o território da campanha inteira.
 *
 *   npm run uf            → usa a UF escrita em content/campanha.ts
 *   npm run uf -- SP      → força São Paulo
 *
 * Escreve quatro arquivos, e é o passo 1 de PERSONALIZAR.md:
 *
 *   data/municipios.json        os municípios, com slug e coordenada
 *   data/mapa.json              os contornos, prontos para o <svg>
 *   data/grupos.local.json      um grupo 'em breve' por município
 *   sql/02-seed-municipios.sql  o mesmo, para rodar no Supabase
 *
 * ⚠️ RODA À MÃO, e o resultado é versionado. Não é build step: a
 *    malha do IBGE muda a cada década, não a cada deploy, e uma
 *    chamada de rede dentro do build é um jeito de o deploy quebrar
 *    por causa de um servidor de terceiro fora do ar.
 *
 * O QUE ACONTECE AQUI
 *  1. baixa a lista de municípios e a malha da UF (qualidade mínima)
 *  2. gera o slug de cada nome — é a URL de /g/<slug>
 *  3. projeta lat/lon num plano, corrigindo a longitude pelo cosseno
 *     da latitude — sem isso o estado sai esticado na horizontal
 *  4. simplifica com Douglas-Peucker e arredonda para uma casa
 *  5. escreve os paths e o centroide de cada município
 *
 * ⚠️ A COORDENADA É O CENTRO GEOMÉTRICO DO MUNICÍPIO, não a praça da
 *    matriz. Para "qual cidade está mais perto de mim" isso resolve em
 *    99% dos casos; em municípios muito alongados o centro pode cair a
 *    dezenas de quilômetros da sede. Quem quiser precisão põe as
 *    coordenadas certas em `data/coordenadas.json` (ver o exemplo no
 *    arquivo) e roda de novo — elas vencem o centroide.
 *
 * ⚠️ A simplificação é POR POLÍGONO, não topológica. Dois vizinhos
 *    dividem a mesma fronteira e cada um a simplifica por conta, então
 *    sobram frestas de fração de pixel entre eles. É por isso que o
 *    componente desenha cada município com traço branco: a fresta cai
 *    dentro do traço e vira a separação que o mapa teria de qualquer
 *    jeito. Resolver de verdade exigiria topojson, que custa uma
 *    dependência e um passo de build para um problema que não aparece.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { UFS, normalizar, slugificar } from './ufs.mjs'

// ── qual UF ────────────────────────────────────────────────────
const argumento = process.argv[2]?.trim().toUpperCase()

/** Lê a UF de content/campanha.ts sem precisar compilar TypeScript. */
async function ufDoProjeto() {
  const fonte = await readFile(new URL('../content/campanha.ts', import.meta.url), 'utf8')
  return fonte.match(/^\s*uf:\s*'([A-Z]{2})'/m)?.[1]
}

const SIGLA = argumento || (await ufDoProjeto())

if (!SIGLA || !UFS[SIGLA]) {
  console.error(
    `\n  UF inválida: ${SIGLA ?? '(nenhuma)'}\n\n` +
      `  Use:  npm run uf -- SP\n` +
      `  Ou escreva a sigla em content/campanha.ts (campo \`uf\`).\n\n` +
      `  Válidas: ${Object.keys(UFS).join(' ')}\n`,
  )
  process.exit(1)
}

const UF = UFS[SIGLA]

const MALHA =
  `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${UF.codigo}` +
  '?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio'
const LISTA = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${UF.codigo}/municipios`

// ── geometria ──────────────────────────────────────────────────

/** Douglas-Peucker. Tolerância em unidades do viewBox. */
function simplificar(pontos, tolerancia) {
  if (pontos.length <= 2) return pontos

  let maior = 0
  let indice = 0
  const [ax, ay] = pontos[0]
  const [bx, by] = pontos[pontos.length - 1]
  const dx = bx - ax
  const dy = by - ay
  const norma = dx * dx + dy * dy

  for (let i = 1; i < pontos.length - 1; i++) {
    const [px, py] = pontos[i]
    let t = norma === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / norma
    t = Math.max(0, Math.min(1, t))
    const qx = ax + t * dx
    const qy = ay + t * dy
    const d = Math.hypot(px - qx, py - qy)
    if (d > maior) {
      maior = d
      indice = i
    }
  }

  if (maior <= tolerancia) return [pontos[0], pontos[pontos.length - 1]]

  return [
    ...simplificar(pontos.slice(0, indice + 1), tolerancia).slice(0, -1),
    ...simplificar(pontos.slice(indice), tolerancia),
  ]
}

/** Centroide e área de um anel fechado, pela fórmula do polígono. */
function centroideDeArea(pontos) {
  let a2 = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pontos.length; i++) {
    const [x1, y1] = pontos[i]
    const [x2, y2] = pontos[(i + 1) % pontos.length]
    const cruz = x1 * y2 - x2 * y1
    a2 += cruz
    cx += (x1 + x2) * cruz
    cy += (y1 + y2) * cruz
  }
  if (a2 === 0) {
    const m = pontos.reduce((s, [x, y]) => [s[0] + x, s[1] + y], [0, 0])
    return { x: m[0] / pontos.length, y: m[1] / pontos.length, area: 0 }
  }
  return { x: cx / (3 * a2), y: cy / (3 * a2), area: Math.abs(a2 / 2) }
}

const LARGURA = 1000
const TOLERANCIA = 0.9

/** Escapa aspas simples para dentro de string SQL. */
const sql = (t) => t.replace(/'/g, "''")

async function principal() {
  console.log(`\n  ${UF.nome} (${SIGLA}) — baixando do IBGE…`)

  const [malha, lista, sobrescritas] = await Promise.all([
    fetch(MALHA).then((r) => r.json()),
    fetch(LISTA).then((r) => r.json()),
    readFile(new URL('../data/coordenadas.json', import.meta.url), 'utf8')
      .then(JSON.parse)
      .catch(() => ({})),
  ])

  const nomePorCodigo = new Map(lista.map((m) => [String(m.id), m.nome]))

  // ── extremos e anéis, em grau ────────────────────────────────
  let latMin = Infinity, latMax = -Infinity, lonMin = Infinity, lonMax = -Infinity
  const aneisPorCodigo = new Map()

  for (const f of malha.features) {
    const codigo = String(f.properties.codarea)
    const geo = f.geometry
    const poligonos = geo.type === 'Polygon' ? [geo.coordinates] : geo.coordinates
    const aneis = []
    for (const poligono of poligonos) {
      for (const anel of poligono) {
        aneis.push(anel)
        for (const [lon, lat] of anel) {
          if (lat < latMin) latMin = lat
          if (lat > latMax) latMax = lat
          if (lon < lonMin) lonMin = lon
          if (lon > lonMax) lonMax = lon
        }
      }
    }
    aneisPorCodigo.set(codigo, aneis)
  }

  const latMedia = ((latMin + latMax) / 2) * (Math.PI / 180)
  const k = Math.cos(latMedia)
  const escala = LARGURA / ((lonMax - lonMin) * k)
  const ALTURA = Math.round((latMax - latMin) * escala)

  const projetar = ([lon, lat]) => [(lon - lonMin) * k * escala, (latMax - lat) * escala]

  // ── municípios ───────────────────────────────────────────────
  const municipios = [] // para o site: slug, nome, lat, lon
  const desenhos = [] // para o mapa: slug, d, centroide
  const semNome = []

  for (const [codigo, aneis] of aneisPorCodigo) {
    const nome = nomePorCodigo.get(codigo)
    if (!nome) {
      semNome.push(codigo)
      continue
    }
    const slug = slugificar(nome)

    let d = ''
    let maiorArea = 0
    let centroide = [0, 0]
    let maiorAreaGrau = 0
    let centroGrau = [0, 0]

    for (const anel of aneis) {
      // Em GRAU: a coordenada que o site usa para "qual cidade está
      // mais perto de mim". Calculada no anel cheio, antes de
      // simplificar — simplificar move o centro de área.
      const cg = centroideDeArea(anel)
      if (cg.area > maiorAreaGrau) {
        maiorAreaGrau = cg.area
        centroGrau = [cg.y, cg.x] // [lat, lon]
      }

      // Em PIXEL: o desenho.
      const pontos = simplificar(anel.map(projetar), TOLERANCIA)
      if (pontos.length < 3) continue
      d += pontos
        .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
        .join('')
      d += 'Z'

      // Centroide de área do maior anel. Serve para duas coisas: a
      // ordem de pintura da versão em relevo e o ponto de ancorar
      // rótulo. Média simples dos vértices não serve — puxa para onde
      // a fronteira tem mais detalhe, e sai fora do município em
      // formatos alongados.
      const c = centroideDeArea(pontos)
      if (c.area > maiorArea) {
        maiorArea = c.area
        centroide = [Number(c.x.toFixed(1)), Number(c.y.toFixed(1))]
      }
    }

    const manual = sobrescritas[slug]
    municipios.push({
      slug,
      nome,
      latitude: Number((manual?.latitude ?? centroGrau[0]).toFixed(6)),
      longitude: Number((manual?.longitude ?? centroGrau[1]).toFixed(6)),
    })
    if (d) desenhos.push({ slug, d, centroide })
  }

  if (semNome.length) {
    throw new Error(`códigos sem nome na lista do IBGE: ${semNome.join(', ')}`)
  }
  if (desenhos.length !== municipios.length) {
    throw new Error(`${desenhos.length} desenhos para ${municipios.length} municípios`)
  }

  municipios.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  // ORDEM DE PINTURA, de trás para a frente. No relevo cada município
  // é uma laje com parede lateral, e a laje da frente precisa cobrir a
  // parede da de trás. Em SVG isso é ordem no documento — não existe
  // z-index. Ordenar por slug deixaria paredes atravessando lajes.
  desenhos.sort((a, b) => a.centroide[1] - b.centroide[1])

  // ── escreve ──────────────────────────────────────────────────
  const raiz = (p) => new URL(`../${p}`, import.meta.url)

  await writeFile(raiz('data/municipios.json'), JSON.stringify(municipios, null, 2) + '\n')

  await writeFile(
    raiz('data/mapa.json'),
    JSON.stringify({
      fonte: `IBGE — malha municipal de ${UF.nome}, qualidade mínima`,
      gerado_por: 'scripts/gerar-uf.mjs',
      uf: SIGLA,
      viewBox: `0 0 ${LARGURA} ${ALTURA}`,
      municipios: desenhos,
    }),
  )

  // Um grupo por município, para o modo local (sem Supabase) mostrar a
  // página inteira funcionando. Sem link: link de grupo não se
  // versiona em arquivo — ver o comentário de segurança no README.
  await writeFile(
    raiz('data/grupos.local.json'),
    JSON.stringify(
      municipios.map((m, i) => ({
        id: `local-${String(i + 1).padStart(3, '0')}`,
        municipio_slug: m.slug,
        ordem: 1,
        link: '',
        status: 'em_breve',
        fixado: true,
        limite_cliques: 700,
        cliques: 0,
      })),
      null,
      2,
    ) + '\n',
  )

  const linhas = municipios
    .map((m) => `  ('${sql(m.slug)}', '${sql(m.nome)}', ${m.latitude}, ${m.longitude})`)
    .join(',\n')

  await writeFile(
    raiz('sql/02-seed-municipios.sql'),
    `-- ═══════════════════════════════════════════════════════════════\n` +
      `-- 02 · ${UF.nome} (${SIGLA}) — ${municipios.length} municípios\n` +
      `--\n` +
      `-- GERADO POR scripts/gerar-uf.mjs. Não editar à mão: rodar\n` +
      `-- \`npm run uf -- ${SIGLA}\` de novo reescreve este arquivo.\n` +
      `--\n` +
      `-- Idempotente: pode rodar quantas vezes quiser. Rodar depois de\n` +
      `-- a campanha começar ATUALIZA nome e coordenada e não toca em\n` +
      `-- grupo nenhum — os links já cadastrados continuam onde estão.\n` +
      `--\n` +
      `-- ⚠️ Coordenada é o centro geométrico do município, não a sede.\n` +
      `--    Conferir 5 municípios distantes entre si antes de publicar.\n` +
      `-- ═══════════════════════════════════════════════════════════════\n\n` +
      `insert into public.municipios (slug, nome, latitude, longitude) values\n${linhas}\n` +
      `on conflict (slug) do update\n` +
      `  set nome = excluded.nome,\n` +
      `      latitude = excluded.latitude,\n` +
      `      longitude = excluded.longitude;\n\n` +
      `-- Um grupo por município, fixado, aguardando o link da campanha.\n` +
      `-- Limite inicial em 700: clique não é entrada, e 1024 chega com o\n` +
      `-- grupo bem vazio. Calibrar depois da primeira semana comparando\n` +
      `-- cliques com o número real de membros.\n` +
      `insert into public.grupos (municipio_slug, ordem, status, fixado, limite_cliques)\n` +
      `select slug, 1, 'em_breve', true, 700\n` +
      `from public.municipios\n` +
      `on conflict (municipio_slug, ordem) do nothing;\n`,
  )

  const kb = (JSON.stringify(desenhos).length / 1024).toFixed(1)
  console.log(
    `\n  ✓ ${municipios.length} municípios · mapa ${kb} kB · viewBox 0 0 ${LARGURA} ${ALTURA}\n\n` +
      `    data/municipios.json\n` +
      `    data/mapa.json\n` +
      `    data/grupos.local.json\n` +
      `    sql/02-seed-municipios.sql\n\n` +
      `  Falta: conferir \`uf\`, \`estado\` e \`ufCodigoIbge\` em content/campanha.ts,\n` +
      `  e rodar sql/02-seed-municipios.sql no Supabase.\n`,
  )
}

principal().catch((e) => {
  console.error('\n  ✗', e.message, '\n')
  process.exit(1)
})
