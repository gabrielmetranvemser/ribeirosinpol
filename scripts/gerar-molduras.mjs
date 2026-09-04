/**
 * Gera as molduras do gerador de foto, em public/molduras.
 *
 *   npm run molduras
 *   CAMPANHA_CNPJ="CNPJ 00.000.000/0001-00" npm run molduras
 *
 * Roda à mão; o resultado é versionado.
 *
 * ⚠️ POR QUE UM SCRIPT, E NÃO UM SVG ESCRITO NA UNHA
 *    A moldura é desenhada num `<canvas>` na hora de exportar a foto,
 *    e um `<svg>` usado como fonte de imagem NÃO carrega referência
 *    externa nenhuma: nem fonte, nem imagem, nem CSS. Tudo precisa
 *    estar dentro do arquivo. Escrever isso à mão para cada campanha
 *    não se revisa.
 *
 * ⚠️ POR QUE TEXTO EM ARIAL, E NÃO A ARTE DA CAMPANHA
 *    Pela mesma razão: `@font-face` não carrega dentro de um SVG usado
 *    como imagem. Só as fontes do sistema desenham — e Arial/Helvetica
 *    é a única que existe nos três (iOS, Android, Windows).
 *
 *    Por isso esta moldura é a REDE DE SEGURANÇA, não a arte final. A
 *    arte final é um PNG feito pelo designer da campanha e enviado
 *    pelo painel, nos espaços `moldura.story` e `moldura.perfil` — lá
 *    ela pode ter a fonte, a textura e o brilho que quiser, porque
 *    chega pronta como imagem.
 *
 * ⚠️ EXIGÊNCIA LEGAL: o CNPJ precisa estar legível em qualquer arte
 *    que substitua estas — a imagem gerada é propaganda eleitoral.
 *    Sem CNPJ, este script carimba um aviso visível na moldura. É
 *    deliberado: é melhor a campanha ver o aviso agora do que
 *    descobrir depois que dez mil pessoas postaram peça irregular.
 *
 * ⚠️ "EU APOIO" não é enfeite: faz a peça ler como apoiador, não como
 *    post oficial. É a única mitigação real contra alguém colar a
 *    marca da campanha numa foto ofensiva.
 */

import { readFile, writeFile } from 'node:fs/promises'

// ── de onde vêm os dados ───────────────────────────────────────
// Lê content/campanha.ts com expressão regular em vez de importar:
// o script roda em Node puro, sem passar pelo bundler, e não tem como
// carregar TypeScript. O custo é este: mexer no formato do arquivo de
// campanha (aspas, indentação) quebra a leitura aqui.
const fonte = await readFile(new URL('../content/campanha.ts', import.meta.url), 'utf8')

const ler = (chave, padrao = '') =>
  fonte.match(new RegExp(`^\\s*${chave}:\\s*'([^']*)'`, 'm'))?.[1] ?? padrao

const NOME = ler('nome', 'CANDIDATO').toUpperCase()
const NUMERO = ler('numero', '00000')
const COR_ACAO = ler('acao', '#fbd83f')
const COR_NOITE = ler('noite', '#013a67')

const CNPJ = process.env.CAMPANHA_CNPJ?.trim() || ''
const RODAPE = CNPJ || '⚠ SEM CNPJ — NÃO PUBLICAR ESTA MOLDURA'

const FONTE = 'Helvetica Neue, Helvetica, Arial, sans-serif'

const cabecalho = (titulo) => `  <title>${titulo} — ${NOME} ${NUMERO}</title>

  <!--
    REDE DE SEGURANÇA. A arte final entra pelo painel, em Imagens, e
    passa a valer sem deploy. Esta fica para o caso de não entrar.

    Nada aqui avisa que é provisória, e é de propósito: carimbar
    "moldura de exemplo" dentro da imagem EXPORTADA faria quem gerasse
    uma foto postar isso no story. O único aviso carimbado é o de CNPJ
    faltando, porque esse é problema legal e não estético.

    Gerado por scripts/gerar-molduras.mjs — não editar à mão.
  -->`

/** O véu que separa a foto do texto, nas duas molduras. */
const veu = (paradas) => `  <defs>
    <linearGradient id="veu" x1="0" y1="0" x2="0" y2="1">
${paradas}
    </linearGradient>
  </defs>`

function story() {
  const L = 1080
  const A = 1920

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}" role="img" aria-label="Moldura de story">
${cabecalho('Moldura de story')}

${veu(
  `      <stop offset="0%"   stop-color="${COR_NOITE}" stop-opacity="0"/>\n` +
    `      <stop offset="42%"  stop-color="${COR_NOITE}" stop-opacity="0.82"/>\n` +
    `      <stop offset="100%" stop-color="${COR_NOITE}" stop-opacity="0.97"/>`,
)}

  <!-- O véu sobe em degradê em vez de cortar reto: borda dura no meio
       de uma foto lê como tarja, e ninguém posta uma tarja. -->
  <rect x="0" y="1080" width="${L}" height="840" fill="url(#veu)"/>

  <text x="88" y="1476" font-family="${FONTE}" font-size="34" font-weight="700" letter-spacing="10" fill="${COR_ACAO}">EU APOIO</text>
  <text x="88" y="1580" font-family="${FONTE}" font-size="76" font-weight="700" letter-spacing="-2" fill="#ffffff">${NOME}</text>
  <text x="88" y="1740" font-family="${FONTE}" font-size="150" font-weight="700" letter-spacing="-6" fill="${COR_ACAO}">${NUMERO}</text>
  <text x="88" y="1852" font-family="${FONTE}" font-size="22" fill="#ffffff" fill-opacity="0.55">${RODAPE}</text>

  <rect x="0" y="1900" width="${L}" height="20" fill="${COR_ACAO}"/>
</svg>
`
}

function perfil() {
  const L = 1080

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}" viewBox="0 0 ${L} ${L}" role="img" aria-label="Moldura de perfil">
${cabecalho('Moldura de perfil')}

  <!--
    Tudo centrado e dentro do círculo inscrito. O destino principal
    deste formato é foto de perfil do WhatsApp, que corta em círculo:
    conteúdo encostado nas pontas some no corte, e junto com ele iria o
    CNPJ, que é exigência legal. O ponto mais baixo usado aqui é a
    linha do CNPJ, e nela o círculo ainda tem 388px de largura.
  -->

${veu(
  `      <stop offset="0%"   stop-color="${COR_NOITE}" stop-opacity="0"/>\n` +
    `      <stop offset="45%"  stop-color="${COR_NOITE}" stop-opacity="0.84"/>\n` +
    `      <stop offset="100%" stop-color="${COR_NOITE}" stop-opacity="0.97"/>`,
)}

  <rect x="0" y="500" width="${L}" height="580" fill="url(#veu)"/>

  <text x="540" y="786" text-anchor="middle" font-family="${FONTE}" font-size="26" font-weight="700" letter-spacing="8" fill="${COR_ACAO}">EU APOIO</text>
  <text x="540" y="866" text-anchor="middle" font-family="${FONTE}" font-size="58" font-weight="700" letter-spacing="-1" fill="#ffffff">${NOME}</text>
  <text x="540" y="988" text-anchor="middle" font-family="${FONTE}" font-size="112" font-weight="700" letter-spacing="-4" fill="${COR_ACAO}">${NUMERO}</text>
  <text x="540" y="1046" text-anchor="middle" font-family="${FONTE}" font-size="18" fill="#ffffff" fill-opacity="0.55">${RODAPE}</text>
</svg>
`
}

for (const [nome, gerar] of [
  ['story-apoio', story],
  ['perfil-apoio', perfil],
]) {
  const svg = gerar()
  await writeFile(new URL(`../public/molduras/${nome}.svg`, import.meta.url), svg)
  console.log(`  ✓ ${nome}.svg · ${(svg.length / 1024).toFixed(1)} kB`)
}

console.log(`\n  ${NOME} · ${NUMERO}`)
if (!CNPJ) {
  console.log(
    `\n  ⚠ SEM CNPJ. A moldura saiu com o aviso carimbado.\n` +
      `    Rode de novo assim quando o CNPJ da campanha existir:\n\n` +
      `    CAMPANHA_CNPJ="CNPJ 00.000.000/0001-00" npm run molduras\n`,
  )
} else {
  console.log(`  ${CNPJ}\n`)
}
