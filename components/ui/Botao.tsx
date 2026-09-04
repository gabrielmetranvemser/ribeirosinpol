import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/**
 * Botão chanfrado — dois cantos opostos cortados em diagonal.
 *
 * Era cápsula (`rounded-full`) até a identidade desta campanha, que é
 * angular: as artes de rua usam tarja com bico e bloco com canto
 * cortado, e um botão redondo no meio disso lê como peça de outro kit.
 * O corte em si mora em `@utility chanfro` (globals.css), inclusive o
 * conserto do anel de foco, que `clip-path` come.
 *
 * O amarelo é a cor de AÇÃO da campanha — é ele que aponta para o
 * clique que importa. Sempre com texto azul-escuro por cima: amarelo
 * com texto branco não passa em contraste nenhum.
 *
 * Altura mínima de 48px vem daqui e não é sobrescrevível por acidente:
 * é a regra de alvo de toque do plano. O chanfro não a toca: ele tira
 * dois triângulos de ~c²/2 em cantos que ninguém mira.
 */

type Variante = 'acao' | 'azul' | 'verde' | 'contorno' | 'claro' | 'suave' | 'texto'
type Tamanho = 'sm' | 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  // ação principal — amarelo da marca, texto azul-escuro (6.4:1)
  acao:
    'bg-amarelo text-azul-escuro shadow-media hover:bg-[color-mix(in_srgb,var(--color-amarelo)_88%,white)] hover:shadow-alta',
  azul:
    'bg-azul text-white shadow-suave hover:bg-azul-escuro hover:shadow-media',
  verde:
    'bg-verde text-white shadow-suave hover:bg-verde-escuro hover:shadow-media',
  contorno:
    'border border-current/30 bg-transparent hover:border-current/70 hover:bg-current/8',
  claro:
    'bg-white text-azul-escuro border border-linha shadow-suave hover:border-azul/40 hover:text-azul',
  suave:
    'bg-azul-suave text-azul-escuro hover:bg-azul hover:text-white',
  texto:
    'bg-transparent px-0 underline decoration-1 underline-offset-[6px] decoration-current/35 hover:decoration-current',
}

// O corte é proporcional à ALTURA da peça, não fixo: 14px num botão de
// 44px comeria um terço da altura e o botão viraria um losango.
const TAMANHOS: Record<Tamanho, string> = {
  sm: 'min-h-11 px-5 text-[0.9375rem] [--corte:0.5rem]',
  md: 'min-h-12 px-6 text-base [--corte:0.75rem]',
  lg: 'min-h-14 px-8 text-lg [--corte:1rem]',
}

// A variante de TEXTO não é uma caixa: é uma palavra sublinhada. Cortar
// canto de algo sem fundo não desenha nada, e ainda apara o sublinhado
// nas pontas.
const SEM_FORMA = new Set<Variante>(['texto'])

const forma = (variante: Variante) => (SEM_FORMA.has(variante) ? '' : 'chanfro')

// `toque` afunda 3% enquanto o dedo está em cima. É o feedback que
// faltava: hoje a pessoa aperta e nada acontece até a página trocar.
// ⚠️ `transition-all` saiu e a lista entrou no lugar. No caminho sem
//    `corner-shape` a sombra do botão é um `filter: drop-shadow`, e
//    `all` passaria a interpolar o filtro a cada hover — um passe de
//    blur por quadro, na peça que mais recebe ponteiro da página.
const BASE =
  'toque inline-flex items-center justify-center gap-2.5 font-semibold ' +
  'leading-none tracking-[-0.01em] text-center duration-300 ease-out ' +
  'transition-[background-color,border-color,color,box-shadow,filter,opacity] ' +
  'disabled:pointer-events-none disabled:opacity-45'

interface Comuns {
  variante?: Variante
  tamanho?: Tamanho
  children: ReactNode
  className?: string
}

export function BotaoLink({
  href,
  variante = 'acao',
  tamanho = 'md',
  className = '',
  children,
  ...resto
}: Comuns & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={`${BASE} ${forma(variante)} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...resto}
    >
      {children}
    </Link>
  )
}

export function Botao({
  variante = 'acao',
  tamanho = 'md',
  className = '',
  children,
  ...resto
}: Comuns & ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={`${BASE} ${forma(variante)} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...resto}
    >
      {children}
    </button>
  )
}

export function BotaoExterno({
  href,
  variante = 'acao',
  tamanho = 'md',
  className = '',
  children,
  ...resto
}: Comuns & ComponentProps<'a'>) {
  return (
    <a
      href={href}
      className={`${BASE} ${forma(variante)} ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...resto}
    >
      {children}
    </a>
  )
}
