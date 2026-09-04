import Image from 'next/image'

/**
 * O SLIDER DE FOTOS ATRÁS DAS FIGURAS.
 *
 * Três fitas de fotos de rua, em preto e branco, correndo devagar por
 * trás das figuras — em sentidos alternados e velocidades diferentes.
 * Não é decoração: a dobra sem elas mostra duas pessoas posadas em
 * estúdio sobre um gradiente, e a página inteira argumenta o contrário
 * disso — que ela veio da rua e continua nela. As fotos dizem isso
 * antes de o visitante ler a primeira linha.
 *
 * ⚠️ ISTO JÁ FOI UM CROSSFADE E ESTAVA ERRADO DE DUAS MANEIRAS.
 *
 *    A primeira: uma foto por vez, ocupando a área inteira, aparecendo
 *    e sumindo. Numa camada a 42% de opacidade e em soft-light, a
 *    troca não lê como troca — lê como PISCA. O olho registra a
 *    mudança de luminância do fundo sem entender o que mudou.
 *
 *    A segunda, pior: em tela cheia cada foto virava uma textura
 *    abstrata. Não dava para identificar que aquilo era gente na rua,
 *    que é a única coisa que essas fotos precisavam comunicar.
 *
 *    Fita resolve as duas. O movimento é contínuo e lateral, então não
 *    pisca; e cada foto é um cartão pequeno, então ela tem BORDA — e
 *    é a borda que faz o olho ler "foto" em vez de "textura".
 *
 * ⚠️ TRÊS LINHAS, ORDENS DIFERENTES, SENTIDOS ALTERNADOS. Uma linha
 *    só lê como faixa de site. Três correndo em sentidos contrários
 *    leem como acervo — muita coisa acontecendo, o que é a mensagem.
 *    As ordens são embaralhadas à mão e FIXAS: sortear no servidor
 *    daria um resultado no HTML e outro na hidratação.
 *
 * ⚠️ SEM JAVASCRIPT, e é a mesma mecânica da faixa amarela da página
 *    (ver .faixa-trilha em globals.css): a lista se repete e a animação
 *    desloca exatamente o comprimento de UMA repetição. Quando ela
 *    termina, a repetição seguinte está no lugar exato onde a primeira
 *    começou — o laço é contínuo e o corte é invisível. O navegador
 *    para sozinho quando a aba perde o foco.
 *
 * ⚠️ TRÊS REPETIÇÕES, E NÃO DUAS. Este é um detalhe que só aparece em
 *    tela grande, e some se ninguém pensar nele. Com duas passadas, o
 *    deslocamento é de metade da fita — e a metade que fica visível
 *    mede cinco cartões, cerca de 1.100px. Num monitor onde a área
 *    revelada pela máscara passe disso, o fim da fita entra em cena e
 *    aparece VAZIO até o laço reiniciar. Com três passadas o
 *    deslocamento é de um terço, e a reserva visível dobra para mais de
 *    2.200px — largura que nenhuma tela real alcança depois da máscara.
 *
 *    São cinco arquivos, então repetir custa nós no DOM e nenhuma
 *    requisição a mais: o navegador serve as três passadas do mesmo
 *    cache.
 *
 * ⚠️ AS FOTOS SÃO CINZA NO ARQUIVO, não em `filter: grayscale()`.
 *    São trinta cartões em movimento contínuo; filtro de cor em runtime
 *    custa repaint a cada quadro. Assado no webp, o resultado é
 *    idêntico e o custo é zero — e os arquivos caíram de 20 MB para
 *    760 kB no caminho.
 */

/**
 * Três ordens embaralhadas à mão. Fixas — ver o comentário sobre
 * hidratação. Cada uma começa por uma foto diferente, senão as três
 * linhas mostrariam a mesma imagem na mesma coluna e o olho leria
 * repetição em vez de acervo.
 */
/**
 * A PROPORÇÃO DE CADA FOTO, na ordem dos arquivos.
 *
 * ⚠️ É O QUE FAZ O MURAL SER MASONRY E NÃO UMA GRADE. A altura da
 *    fita é fixa; a largura de cada ladrilho sai daqui. Foto deitada
 *    vira um ladrilho largo, foto em pé vira um estreito, e as três
 *    fitas — que têm ordens diferentes — nunca alinham as emendas.
 *    É o que dá o desenho de tijolo:
 *
 *      [ ] [.    ] [. ] [.   ] [ ]
 *      [.    ] [. ] [ ] [.     ]
 *
 *    O caminho preguiçoso seria forçar todas ao mesmo quadro com
 *    `object-cover`. Aí a foto deitada de sessenta pessoas em fileira
 *    perde as duas pontas e vira um pedaço de parede — que é
 *    exatamente o problema que este arquivo já registrou uma vez, no
 *    comentário sobre foto em tela cheia virar textura.
 *
 * ⚠️ OS NÚMEROS SÃO MEDIDOS, não estimados: saem do sharp na geração
 *    dos arquivos. Trocar uma foto de fundo exige medir a nova e
 *    atualizar aqui, senão o ladrilho estica ou espreme a imagem.
 */
const PROPORCOES = [1.334, 0.75, 1.502, 0.75, 1.334, 0.75, 1.502, 0.8, 1.334, 0.666]

/**
 * Três ordens embaralhadas à mão. Fixas — ver o comentário sobre
 * hidratação. Cada uma começa por uma foto diferente, e as três
 * intercalam deitadas com em pé para que nenhuma fita fique só com
 * ladrilho largo (o que a faria correr mais rápido que as outras aos
 * olhos) nem só com estreito.
 */
const LINHA_UM = [1, 4, 3, 6, 9, 2, 7, 10, 5, 8]
const LINHA_DOIS = [5, 2, 9, 8, 3, 10, 1, 6, 7, 4]
const LINHA_TRES = [7, 10, 1, 4, 5, 8, 3, 2, 9, 6]

function Fita({
  ordem,
  duracao,
  reverso = false,
}: {
  ordem: number[]
  duracao: string
  reverso?: boolean
}) {
  return (
    <div
      className="fundo-vivo-fita"
      style={{
        ['--fita-duracao' as string]: duracao,
        animationDirection: reverso ? 'reverse' : undefined,
      }}
    >
      {/* Três passadas da mesma lista. A partir da segunda é o que
          torna o laço contínuo; a terceira é a reserva que impede a
          fita de aparecer vazia em tela larga. `aria-hidden` na seção
          inteira, então repetir não repete nada para quem usa leitor
          de tela. */}
      {[0, 1, 2].map((passada) =>
        ordem.map((n) => (
          <div
            key={`${passada}-${n}`}
            className="fundo-vivo-quadro"
            // A largura do ladrilho sai da proporção da foto: a altura
            // da fita é fixa, então `aspect-ratio` resolve a largura
            // sozinho. Ver PROPORCOES, acima.
            style={{ ['--ar' as string]: PROPORCOES[n - 1] }}
          >
            <Image
              src={`/fundo-${n}.webp`}
              alt=""
              fill
              // O ladrilho mais largo tem 1,5× a altura da fita
              // (16rem no desktop), ou seja ~24rem. `24rem` é o teto
              // real, e pedir `18vw` fazia o navegador buscar variante
              // maior que a necessária em tela larga.
              sizes="(max-width: 1024px) 14rem, 24rem"
              // Só a primeira passada da primeira linha entra no
              // carregamento inicial; o resto é o mesmo arquivo, já em
              // cache do navegador.
              loading="lazy"
              className="object-cover object-center"
            />
          </div>
        )),
      )}
    </div>
  )
}

export function FundoVivo() {
  return (
    <div
      aria-hidden
      // `mask-image` é o que prende as fitas ao lado das figuras.
      // No desktop elas nascem transparentes à esquerda e só ganham
      // corpo depois da metade da tela — a coluna de texto fica sobre
      // gradiente limpo, que é o único jeito de um parágrafo de 260
      // caracteres continuar legível. No celular a máscara vira
      // vertical pelo mesmo motivo: lá o texto está em cima, não à
      // esquerda.
      className="fundo-vivo pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Três velocidades diferentes e sentidos alternados. Iguais, as
          fitas andariam em bloco e as três viriam a ser uma faixa
          grossa só. Os números não são redondos de propósito: 88, 124
          e 103 não entram em fase entre si tão cedo, então o padrão
          nunca se repete de forma visível. */}
      <Fita ordem={LINHA_UM} duracao="88s" />
      <Fita ordem={LINHA_DOIS} duracao="124s" reverso />
      <Fita ordem={LINHA_TRES} duracao="103s" />
    </div>
  )
}
