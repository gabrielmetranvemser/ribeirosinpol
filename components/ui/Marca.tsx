'use client'

import Image from 'next/image'
import { useConteudo } from '@/lib/conteudo/contexto'

/**
 * A marca da campanha.
 *
 * O `Image` do Next entra onde a arte é raster, com `sizes` certo:
 * os originais têm até 32.508px de largura e o público está em 4G.
 *
 * ⚠️ É Client Component por necessidade, não por escolha: o `Header`
 *    (que é cliente) o importa, então na prática ele já era cliente.
 *    Como o texto alternativo vem do conteúdo editável, precisa do hook.
 */

/**
 * O símbolo: a bandeira da marca.
 *
 * Vem embutido em vetor, e não como PNG, porque o PNG que existia era
 * um recorte do logotipo com o desenho ENCOSTANDO nas bordas do
 * arquivo — no cabeçalho a bandeira aparecia fatiada em cima e
 * embaixo. Recortar mais largo do original não salva: no logotipo o
 * o símbolo costuma ser um recorte do logotipo, e recorte de logotipo
 * quase sempre encosta nas bordas do arquivo — no cabeçalho a arte
 * aparece fatiada em cima e embaixo.
 *
 * O desenho abaixo é uma losango sobre retângulo, na estrutura da
 * bandeira, PINTADO COM AS CORES DA CAMPANHA (as três variáveis de
 * `content/campanha.ts`). Ele custa zero requisição, nunca corta e
 * acompanha a paleta sozinho. A arte de verdade entra pelo painel, no
 * espaço `marca.simbolo`, sem mexer em código.
 */
export function Simbolo({
  className = '',
  url = null,
  prioridade = false,
}: {
  className?: string
  /**
   * Imagem enviada pelo painel (espaço `marca.simbolo`). Quando existe,
   * ela manda; quando não, cai no vetor embutido abaixo.
   *
   * ⚠️ O vetor não é um espaço vazio esperando arte: ele é a arte que
   *    funciona enquanto a oficial não chega — e, como segue as cores
   *    da campanha, ele nunca fica "de outra pessoa".
   */
  url?: string | null
  prioridade?: boolean
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={512}
        height={379}
        priority={prioridade}
        sizes="64px"
        className={className}
        aria-hidden
      />
    )
  }

  return (
    <svg viewBox="0 0 1352 1000" className={className} role="img" aria-hidden focusable="false">
      <defs>
        <clipPath id="simbolo-caixa">
          <rect width="1352" height="1000" rx="235" ry="235" />
        </clipPath>
      </defs>
      <g clipPath="url(#simbolo-caixa)">
        <rect width="1352" height="1000" fill="var(--color-verde)" />
        <path d="M676 52 1300 500 676 948 52 500Z" fill="var(--color-amarelo)" />
        <circle cx="676" cy="500" r="292" fill="var(--color-azul)" />
        {/* A faixa da marca. Ela DESCE da esquerda para a direita, com
            uma subida leve no primeiro terço — o traçado saiu de medir
            o arquivo original coluna por coluna, e não de olhar: o
            centro da faixa vai de 51% da altura em x=5%, sobe até
            46,6% em x=35% e cai para 62,5% em x=90%, com espessura
            constante de 18,8%. Desenhada de memória, ela saiu
            espelhada. */}
        <path
          d="M-40 416 C 180 400, 330 372, 473 372 C 700 372, 900 470, 1392 584 L 1392 772 C 900 658, 700 560, 473 560 C 330 560, 180 588, -40 604 Z"
          fill="#ffffff"
        />
      </g>
    </svg>
  )
}

/**
 * ═══════════════════════════════════════════════════════════════
 * O LOCKUP — nome e número, desenhados em código.
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️ POR QUE SVG COM TEXTO, E NÃO UM PNG DA ARTE OFICIAL.
 *
 *    Este projeto é um modelo: ele precisa ficar de pé no minuto zero,
 *    quando a campanha ainda não tem arte — e a arte de campanha
 *    costuma chegar depois do site. Um `<img>` apontando para um PNG
 *    que não existe é um ícone quebrado na primeira dobra.
 *
 *    O SVG resolve isso e mais uma coisa: ele escala EXATAMENTE como
 *    a imagem que vai substituí-lo. As classes de tamanho nos pontos
 *    de uso (`w-56`, `w-[5.5rem]`) continuam valendo sem ajuste no dia
 *    em que a arte chegar.
 *
 *    `textLength` + `lengthAdjust` obrigam o nome a ocupar a caixa
 *    inteira, independentemente de ter 6 ou 26 letras. É o que um
 *    logotipo faz, e é o que impede "Maria" de sair minúscula ao lado
 *    de um número gigante.
 *
 * ⚠️ QUANDO A ARTE CHEGAR, ela entra pelo painel (Identidade ▸
 *    Imagens), nos espaços `marca.logotipo` e `marca.lockup`. Basta
 *    passar a `url` — nenhuma dessas chamadas muda de forma.
 *
 * ⚠️ NOME BRANCO: estas três peças só existem sobre fundo escuro. É
 *    onde elas são usadas (primeira dobra e rodapé). Sobre claro o
 *    nome some e sobra o número solto.
 */

/** Versão larga, branca. Só sobre fundo escuro. */
export function LogoHorizontal({
  className = '',
  url = null,
}: {
  className?: string
  /** Imagem do painel (espaço `marca.logotipo`). Manda quando existe. */
  url?: string | null
}) {
  const { candidato } = useConteudo()

  if (url) {
    return (
      <Image
        src={url}
        alt={`${candidato.nome} — ${candidato.cargo}`}
        width={900}
        height={145}
        sizes="(max-width: 768px) 80vw, 420px"
        className={className}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 900 145"
      className={className}
      role="img"
      aria-label={`${candidato.nome} — ${candidato.cargo}`}
    >
      <text
        x="0"
        y="86"
        textLength="900"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-titulo)"
        fontSize="86"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="-2"
        fill="currentColor"
      >
        {candidato.nome.toUpperCase()}
      </text>
      <text
        x="0"
        y="128"
        textLength="900"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-titulo)"
        fontSize="30"
        fontWeight="600"
        letterSpacing="6"
        fill="currentColor"
        opacity="0.72"
      >
        {candidato.cargo.toUpperCase()}
      </text>
    </svg>
  )
}

/**
 * A MARCA COM O NÚMERO — o bloco vertical.
 *
 * O nome fica acima dos algarismos, do jeito que a arte de capa de
 * campanha usa. É a peça da primeira dobra no celular.
 */
export function MarcaNumero({
  className = '',
  prioridade = false,
  url = null,
}: {
  className?: string
  prioridade?: boolean
  /** Imagem do painel (espaço `marca.lockup`). */
  url?: string | null
}) {
  const { candidato } = useConteudo()

  if (url) {
    return (
      <Image
        src={url}
        alt={`${candidato.nome} — ${candidato.numero}`}
        width={700}
        height={500}
        priority={prioridade}
        sizes="(max-width: 1024px) 45vw, 300px"
        className={className}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 700 500"
      className={className}
      role="img"
      aria-label={`${candidato.nome} — ${candidato.numero}`}
    >
      <text
        x="350"
        y="150"
        textAnchor="middle"
        textLength="660"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-titulo)"
        fontSize="128"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="-4"
        fill="#ffffff"
      >
        {candidato.nome.toUpperCase()}
      </text>
      <text
        x="350"
        y="430"
        textAnchor="middle"
        textLength="660"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-titulo)"
        fontSize="270"
        fontWeight="800"
        letterSpacing="-10"
        fill="var(--color-amarelo)"
      >
        {candidato.numero}
      </text>
    </svg>
  )
}

/**
 * A MESMA MARCA, DEITADA — nome à esquerda, número à direita.
 *
 * Existe porque a empilhada não cabia em toda parte: ela é quase
 * quadrada e, posta embaixo de uma coluna de texto, lê como um cartão
 * colado no fim da página. Deitada, o lockup é 6:1 — uma faixa, e
 * faixa atravessa. É a forma certa para sobrepor uma imagem larga.
 */
export function MarcaNumeroHorizontal({
  className = '',
  prioridade = false,
  url = null,
}: {
  className?: string
  prioridade?: boolean
  /** Imagem do painel (espaço `marca.lockupDeitado`). */
  url?: string | null
}) {
  const { candidato } = useConteudo()

  if (url) {
    return (
      <Image
        src={url}
        alt={`${candidato.nome} — ${candidato.numero}`}
        width={1400}
        height={227}
        priority={prioridade}
        sizes="(max-width: 1024px) 80vw, 520px"
        className={className}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 1400 227"
      className={className}
      role="img"
      aria-label={`${candidato.nome} — ${candidato.numero}`}
    >
      {/* 62% para o nome, 34% para o número, 4% de respiro no meio.
          A divisão é fixa e não proporcional ao tamanho do texto: com
          `textLength` os dois preenchem o que receberem, e uma divisão
          que mudasse por nome faria o número dançar de tamanho entre
          uma campanha e outra. */}
      <text
        x="0"
        y="168"
        textLength="868"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-titulo)"
        fontSize="168"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="-6"
        fill="#ffffff"
      >
        {candidato.nome.toUpperCase()}
      </text>
      <text
        x="924"
        y="176"
        textLength="476"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-titulo)"
        fontSize="184"
        fontWeight="800"
        letterSpacing="-8"
        fill="var(--color-amarelo)"
      >
        {candidato.numero}
      </text>
    </svg>
  )
}

/** O número sozinho, na cor de ação. */
export function Numero({
  className = '',
  prioridade = false,
  url = null,
}: {
  className?: string
  prioridade?: boolean
  url?: string | null
}) {
  const { candidato } = useConteudo()

  if (url) {
    return (
      <Image
        src={url}
        alt={`Número ${candidato.numero}`}
        width={700}
        height={188}
        priority={prioridade}
        sizes="(max-width: 768px) 60vw, 380px"
        className={className}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 700 188"
      className={className}
      role="img"
      aria-label={`Número ${candidato.numero}`}
    >
      <text
        x="350"
        y="160"
        textAnchor="middle"
        textLength="700"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="var(--font-titulo)"
        fontSize="188"
        fontWeight="800"
        letterSpacing="-8"
        fill="var(--color-amarelo)"
      >
        {candidato.numero}
      </text>
    </svg>
  )
}
