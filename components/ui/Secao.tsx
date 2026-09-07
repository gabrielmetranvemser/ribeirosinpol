import type { ReactNode } from 'react'
import { TextoComDestaque } from './TextoComDestaque'

interface Props {
  id?: string
  children: ReactNode
  /**
   * Só cor cheia ou branco. Nada de pastel: fundo lavado tira a força
   * da paleta e deixa a página com cara de apresentação corporativa.
   */
  fundo?: 'branco' | 'areia' | 'azul-profundo' | 'verde' | 'amarelo'
  className?: string
  /** Espaçamento vertical. 'solto' para as seções principais. */
  espaco?: 'normal' | 'solto'
}

const FUNDOS = {
  branco: 'bg-white text-tinta',
  areia: 'bg-areia text-tinta',
  // superfícies cheias: um matiz só, do claro ao escuro
  'azul-profundo': 'fundo-azul-profundo text-white',
  verde: 'fundo-verde text-white',
  // amarelo é chapado — gradiente em amarelo suja para ocre
  amarelo: 'bg-amarelo text-azul-escuro',
} as const

export function Secao({
  id,
  children,
  fundo = 'branco',
  className = '',
  espaco = 'normal',
}: Props) {
  return (
    <section
      id={id}
      className={`relative ${FUNDOS[fundo]} ${
        espaco === 'solto' ? 'py-20 md:py-32' : 'py-16 md:py-24'
      } ${className}`}
    >
      <div className="container-lp">{children}</div>
    </section>
  )
}

/**
 * A estrela da bandeira de Rondônia, reduzida a marcador.
 *
 * ⚠️ É A MESMA FORMA DO CLARÃO DA PRIMEIRA DOBRA, e é isso que faz o
 *    resto da página parecer a continuação dela em vez de outro site.
 *    Na dobra ela tem 60rem e vive desfocada atrás do candidato; aqui
 *    tem 9px e abre cada seção. Mesma forma em duas escalas é o que
 *    transforma um desenho em sistema.
 *
 * Desenhada à mão e não importada de `Marca.tsx`: aquele arquivo é
 * `'use client'` por causa do `useConteudo`, e puxar um componente de
 * cliente para dentro de um cabeçalho de servidor criaria uma fronteira
 * de hidratação para um enfeite de 9 pixels.
 */
function Estrela({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <path d="M50 3 61.17 34.63 94.7 35.48 68.07 55.87 77.63 88.02 50 69 22.37 88.02 31.93 55.87 5.3 35.48 38.83 34.63Z" />
    </svg>
  )
}

interface CabecalhoProps {
  etiqueta?: string
  titulo: ReactNode
  intro?: string
  tom?: 'claro' | 'escuro'
  /**
   * Como pintar o trecho entre [[colchetes]] no título.
   * Padrão: amarelo sobre fundo escuro, azul sobre claro.
   * 'grifo' é o traço amarelo sob a palavra — o design usa nas seções
   * em que o título é uma afirmação curta.
   */
  destaque?: 'auto' | 'grifo'
  /** Centraliza o bloco. Usado no CTA final e em seções de abertura. */
  centro?: boolean
  className?: string
}

/**
 * O cabeçalho de seção — o ritmo que abre doze das treze seções.
 *
 * ⚠️ ISTO ERA UMA COLUNA SÓ: traço, etiqueta, título e introdução
 *    empilhados dentro de `max-w-3xl`. Não era feio — era a assinatura
 *    que este site dividia com a página de outra candidatura da MESMA
 *    CIDADE, saída do mesmo modelo. Doze seções repetindo a mesma
 *    abertura é o que mais entrega dois sites como irmãos, muito mais
 *    que a primeira dobra: a dobra a pessoa vê uma vez, o cabeçalho de
 *    seção ela vê doze.
 *
 *    O que mudou, e por quê:
 *
 *    · FIO DE LARGURA TOTAL abrindo a seção. Divide a página em
 *      capítulos e dá ao olho onde recomeçar — o antigo traço de 2rem
 *      ao lado da etiqueta era decoração, não estrutura.
 *    · A ESTRELA no lugar do traço. É a mesma forma do clarão da
 *      primeira dobra, em 9px em vez de 60rem. Forma repetida em duas
 *      escalas é o que vira sistema.
 *    · TÍTULO E INTRODUÇÃO LADO A LADO, e não um embaixo do outro. É a
 *      mudança que mais se sente: partir a abertura em duas colunas
 *      muda o ritmo de leitura da página inteira, e não custa nem um
 *      caractere de copy.
 *
 * ⚠️ A COPY NÃO MUDOU. Nenhum texto, nenhum campo do painel, nenhuma
 *    ordem de seção. Este arquivo só reorganiza o que já vinha pronto —
 *    é a razão de a mudança caber num lugar só.
 */
export function CabecalhoSecao({
  etiqueta,
  titulo,
  intro,
  tom = 'claro',
  destaque = 'auto',
  centro = false,
  className = '',
}: CabecalhoProps) {
  const escuro = tom === 'escuro'

  const bloco = (
    <h2
      data-revelar="titulo"
      style={{ ['--atraso' as string]: '70ms' }}
      className="titulo-secao max-w-[20ch] text-balance"
    >
      {typeof titulo === 'string' ? (
        <TextoComDestaque
          texto={titulo}
          porPalavra
          tom={destaque === 'grifo' ? 'grifo' : escuro ? 'amarelo' : 'azul'}
        />
      ) : (
        titulo
      )}
    </h2>
  )

  const textoIntro = intro ? (
    <p
      data-revelar
      style={{ ['--atraso' as string]: '140ms' }}
      className={`text-lg ${escuro ? 'text-white/75' : 'text-grafite'}`}
    >
      {/* O `intro` de TODA seção passa por aqui. Sem o interpretador,
          negrito aplicado numa introdução aparecia como `**assim**` na
          página — foi o defeito relatado. */}
      {typeof intro === 'string' ? (
        <TextoComDestaque texto={intro} tom={escuro ? 'amarelo' : 'azul'} />
      ) : (
        intro
      )}
    </p>
  ) : null

  return (
    /* ⚠️ `@container` E VARIANTES DE CONTÊINER, NÃO DE TELA. A grade de
       duas colunas abaixo reage à largura DESTE cabeçalho, e não à da
       janela — e a diferença não é purismo, é um defeito que existiu.

       `Origem` põe o cabeçalho dentro de uma coluna que já é metade da
       tela. Com `md:` (que olha a janela) a grade partia aquela metade
       de novo, o título caía para 281px e uma frase de sessenta
       caracteres virava um bloco de cinco linhas, alto e fino. Largura
       dentro de largura: cada componente enxergando só a si mesmo.

       Com contêiner, o cabeçalho pergunta "quanto espaço EU tenho" e
       decide sozinho. Em seção de largura inteira (1136px) ele parte;
       dentro de uma coluna estreita ele empilha. Nenhuma seção precisa
       avisar nada. */
    <header className={`@container ${className}`}>
      {/* ⚠️ O FIO SANGRA ATÉ A BORDA DA CALHA, e não é detalhe: é ele
          que faz a seção começar. Um fio que para junto com o texto lê
          como sublinhado do título; um fio que atravessa lê como
          divisão de capítulo. */}
      {/* ⚠️ O NÚMERO DO CAPÍTULO SAI DE UM CONTADOR CSS, e é por isso
          que ele não é uma prop. Metade das seções desta página pode
          ser desligada no painel, e numeração passada por parâmetro
          significaria: ou o coordenador renumera à mão a cada
          interruptor, ou a página mostra "01, 03, 07". O contador
          conta o que EXISTE no documento — desligar uma seção
          renumera as outras sozinho.

          Ele fica na ponta direita do fio, e não junto da etiqueta: ali
          vira número de página de revista, que é o que ele é. Junto da
          etiqueta ele brigaria com a estrela por um espaço de 9px. */}
      <div className="fio-capitulo relative" aria-hidden>
        <div
          data-revelar
          className={`fio-secao h-px w-full ${escuro ? 'bg-white/18' : 'bg-linha'}`}
        />
      </div>

      {etiqueta ? (
        <p
          data-revelar
          style={{ ['--atraso' as string]: '40ms' }}
          className={`etiqueta mt-6 text-[0.8125rem] tracking-[0.16em] ${
            centro ? 'justify-center' : ''
          } ${escuro ? 'text-white/75' : 'text-azul'}`}
        >
          {/* A estrela é amarela sobre escuro e azul sobre claro — a
              mesma regra de sempre: amarelo nunca é cor de leitura
              sobre fundo claro, mas em 9px de forma cheia ele é
              detalhe, não texto. */}
          <Estrela className={`size-[0.6875rem] ${escuro ? 'text-amarelo' : 'text-azul'}`} />
          {etiqueta}
        </p>
      ) : null}

      {/* ⚠️ ALINHADO NA MARGEM, TÍTULO E INTRODUÇÃO NA MESMA
          VERTICAL. Duas estruturas foram tentadas antes desta e as
          duas foram reprovadas na tela — ficam registradas porque as
          duas parecem boas ideias no papel:

          1ª — DUAS COLUNAS, título à esquerda e introdução à direita.
               Alturas independentes com texto de tamanho livre vindo
               do painel: a introdução de "O esporte" tem 92px, a de
               "Polícia Civil" tem 214px, contra um título de 44px.
               Sobravam 170px de fundo vazio ao lado do título, e
               nenhuma proporção de coluna conserta — o que equilibra
               uma seção desequilibra a seguinte.

          2ª — PILHA COM RECUO, introdução começando a 44% da largura.
               A intenção era uma leitura em diagonal; o resultado foi
               "escada quebrada". Dois blocos alinhados em verticais
               diferentes não leem como diagonal, leem como
               desalinhamento — o olho procura UMA margem, e havia
               duas.

          A terceira é a que não quebra: uma margem só, os dois blocos
          começando nela, medida de leitura controlada em cada um. Não
          é ousada, e é justamente por isso que aguenta título de uma
          linha, de três, com introdução curta ou longa, dentro de
          coluna larga ou estreita.

          A diferença em relação ao ritmo antigo não mora mais aqui —
          mora no fio de largura total, na estrela, na tipografia e nas
          superfícies. Cabeçalho é estrutura: quando ele tenta ser o
          elemento de personalidade, ele quebra.

          ⚠️ AS DUAS MEDIDAS SÃO DIFERENTES DE PROPÓSITO. Título em
          20ch dá duas ou três linhas e mantém a manchete compacta;
          introdução em 54ch é a medida de leitura confortável para
          corpo de 18px. Igualar as duas faria o título virar uma linha
          só e longa, que é manchete nenhuma. */}
      <div className="mt-6 @2xl:mt-8">
        {bloco}
        {textoIntro ? <div className="mt-5 max-w-[54ch]">{textoIntro}</div> : null}
      </div>
    </header>
  )
}
