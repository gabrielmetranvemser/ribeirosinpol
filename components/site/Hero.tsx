import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'
import { TextoComDestaque, Texto } from '@/components/ui/TextoComDestaque'
import { Numero } from '@/components/ui/Marca'
import { BotaoLink } from '@/components/ui/Botao'
import { destinoGrupo } from '@/lib/conteudo/secoes'
import { CliqueGrupo } from './CliqueGrupo'
import { PlacasHero } from './PlacasHero'

/**
 * Os esquemas que o CSS conhece. Ver `.capa` em globals.css.
 *
 * ⚠️ ESTA LISTA EXISTE PARA APARAR VALOR ANTIGO, e a lição custou uma
 *    dobra sem fundo nenhum. O esquema "verde e amarelo" já se chamou
 *    `capa`; quando ganhou nome próprio, o valor salvo no banco
 *    continuou sendo `capa` — e `[data-capa='capa']` não casa com regra
 *    alguma. Resultado: nenhum degradê e o título branco sobre branco.
 *
 *    O ponto geral: valor gravado sobrevive a renomeação de código. A
 *    validação do painel só conserta o que passa por ela, e ninguém
 *    reabre uma seção só para salvá-la de novo.
 */
const ESQUEMAS = [
  'azul', 'verde', 'amarelo', 'verde-amarelo', 'azul-verde', 'amarelo-azul', 'bandeira',
]
const ESQUEMA_PADRAO = 'bandeira'

/**
 * Primeira dobra — a figura no centro, informação dos dois lados.
 *
 * ⚠️ ESTA DOBRA FOI REPROVADA TRÊS VEZES. As lições estão no desenho,
 *    e vale ler antes de mexer porque as três tentações voltam.
 *
 *    1ª — DEGRADÊ DIAGONAL, DUAS COLUNAS, herdado do modelo. A página
 *         de outra candidatura da MESMA CIDADE saiu do mesmo tema. Não
 *         era feio; era igual, e igual é problema de campanha.
 *
 *    2ª — PLACAS RETAS COM UMA FAIXA DIAGONAL POR CIMA. "Sensação de
 *         desalinhado, empilhado de qualquer jeito, não tem regra."
 *         Duas famílias de ângulo competindo, coordenadas medidas no
 *         olho e quatro cores em quatro planos.
 *
 *    3ª — DEGRADÊ MONOCROMÁTICO LIMPO, figura à direita. Arrumado, e
 *         "sem graça": fundo chapado não tem profundidade, e retrato
 *         colado num lado só deixa a metade oposta vazia.
 *
 *    O que manda agora — uma regra por defeito corrigido:
 *      · A FIGURA NO CENTRO, com informação dos dois lados. À esquerda
 *        a mensagem; à direita o pedido. Cada lado com uma função só,
 *        e nenhuma metade vazia.
 *      · FUNDO FOTOGRÁFICO, não pintado. Ver PlacasHero.
 *      · UMA CURVA SÓ (o arco) e UM ACENTO SÓ (o amarelo, em três
 *        lugares contados: botão, realce do título e fio da barra).
 *      · QUATRO VELOCIDADES na rolagem — era o pedido explícito de
 *        "interação no scroll", e é o que dá dimensão em vez de cartaz.
 *
 * ⚠️ O CONTRASTE DO TÍTULO É GARANTIDO PELA VINHETA, e não por
 *    medição: o escurecimento é radial e centrado na figura, então as
 *    duas pontas — onde moram o texto e o cartão — são sempre as mais
 *    escuras da dobra. As laterais só se deslocam em Y, e a vinheta
 *    lateral não muda com a altura; então não existe estado da
 *    animação em que uma ponta clareie. Movimento em X quebraria isso.
 *
 * ⚠️ O LOCKUP DEITADO SAIU. Ficava sobre o tronco da figura e, com a
 *    camisa branca desta campanha, os algarismos amarelos caíam em cima
 *    de branco: 1,33:1. A marca com o nome continua no cabeçalho, que
 *    acompanha a rolagem.
 *
 * A regra de sempre continua valendo: menos de 3 segundos até o botão
 * principal ficar clicável, num celular mediano em 4G. Server
 * Component, CSS puro, sem biblioteca de animação e sem JavaScript de
 * paralaxe.
 */
export async function Hero({ silencio = false }: { silencio?: boolean }) {
  const [{ ctas, hero, exibir, aparencia }, slots] = await Promise.all([
    lerConteudo(),
    lerSlots(),
  ])
  const paraOsGrupos = destinoGrupo(exibir)
  const esquema = ESQUEMAS.includes(aparencia.heroCor) ? aparencia.heroCor : ESQUEMA_PADRAO

  return (
    <section data-capa={esquema} className="capa relative isolate">
      {/* ⚠️ LARGURA TOTAL, E NÃO PAINEL RECUADO. Esta dobra já foi uma
          peça com margem sobre chão escuro e ficou errada: moldura na
          primeira dobra rouba área da imagem e cria uma segunda borda
          concorrendo com a do navegador. Sangra até a borda; o
          alinhamento do conteúdo continua vindo do `container-lp`.

          O `overflow-hidden` e o `isolate` moram aqui: é este bloco que
          recorta o arco, a foto e a figura. */}
      <div className="painel-hero flex min-h-[42rem] flex-col lg:min-h-[100svh]">
        <PlacasHero />

        {/* ⚠️ `relative z-10` NO CONTEÚDO. O fundo é absoluto, e
            elemento posicionado pinta acima de conteúdo estático por
            mais que venha antes no HTML. Sem declarar andar aqui, o
            título ficaria ATRÁS do arco. Andares desta dobra:
            fundo (0) · laterais (10) · figura (20) · barra (30). */}
        <div className="relative z-10 flex flex-1 flex-col">
          {/* A faixa que o cabeçalho fixo ocupa. Reserva de espaço, e
              não margem: o cabeçalho é `fixed`, então não empurra nada
              — sem esta reserva a etiqueta nasceria por baixo dele. */}
          <div className="h-20 shrink-0 md:h-24" aria-hidden />

          {/* ⚠️ TRÊS COLUNAS, E A DO MEIO É A MAIOR. A figura é o
              assunto da dobra; texto e cartão a emolduram. No celular a
              grade some e tudo empilha na ordem do DOM — mensagem,
              figura, pedido —, que é a ordem de leitura certa. */}
          <div className="container-lp grid flex-1 items-end gap-6 lg:grid-cols-[0.98fr_1.28fr_0.84fr] lg:items-center lg:gap-8">
            {/* ── Esquerda: a mensagem ── */}
            <div className="lado-dobra relative z-20 order-1 pb-2 text-center lg:pb-14 lg:text-left">
              {/* Três barrinhas em vez da pílula com bolinha. A pílula
                  era forma de sistema de design, não da campanha:
                  aparecia igual em qualquer site. As barras são a
                  bandeira reduzida ao mínimo, e alturas diferentes
                  fazem elas lerem como marca em vez de três traços. */}
              <p className="anima-hero flex items-center justify-center gap-3 lg:justify-start">
                <span className="flex items-end gap-[3px]" aria-hidden>
                  <span className="block h-3.5 w-[3px] rounded-full bg-white/70" />
                  <span className="block h-5 w-[3px] rounded-full bg-(--capa-realce)" />
                  <span className="block h-3.5 w-[3px] rounded-full bg-white" />
                </span>
                <span className="text-[0.6875rem] font-semibold tracking-[0.18em] text-white/70 uppercase">
                  {hero.etiqueta}
                </span>
              </p>

              <h1 className="mt-5 titulo-cartaz text-white">
                {hero.titulo.map((linha, i) => (
                  <span
                    key={i}
                    className="anima-hero block"
                    style={{ animationDelay: `${100 + i * 80}ms` }}
                  >
                    <TextoComDestaque texto={linha} tom="capa" />
                  </span>
                ))}
              </h1>

              <p
                className="anima-hero mx-auto mt-4 max-w-[19.5rem] text-[0.9375rem] leading-relaxed text-white/70 lg:mx-0"
                style={{ animationDelay: '440ms' }}
              >
                <Texto tom="capa">{hero.subtitulo}</Texto>
              </p>
            </div>

            {/* ── Centro: a figura ──
                ⚠️ `max-w-none` É OBRIGATÓRIO. O reset do Tailwind põe
                `max-width: 100%` em toda imagem; como esta é
                dimensionada pela ALTURA, sem isso a largura seria
                espremida de volta para dentro da caixa e a figura
                apareceria achatada. */}
            <div
              className="anima-surge relative order-2 flex items-end justify-center self-end lg:-mb-[12.5rem]"
              style={{ animationDelay: '260ms' }}
            >
              <div className="relative h-[24rem] w-full sm:h-[31rem] lg:h-[47rem]">
                {/* ⚠️ `items-end`, E A RAZÃO É O BRAÇO ERGUIDO.
                    Este recorte tem o punho no alto, então o TOPO DA
                    IMAGEM NÃO É A CABEÇA — é a mão, uns 22% acima
                    dela. Ancorando pelo topo (que é o que esta dobra
                    fazia), quem encosta no teto é o punho e a cabeça
                    desce para o meio do título: a pessoa fica com cara
                    de encolhida, olhando de baixo.

                    Ancorada pelo PÉ, o excedente sai por cima e quem é
                    cortado é o braço — que é justamente a parte que
                    pode vazar. A cabeça sobe para cima da linha do
                    texto, que é onde ela tem que estar.

                    ⚠️ ISTO JÁ FOI `items-end` UMA VEZ E DEU ERRADO, com
                    a cabeça decepada no topo. A diferença é a ALTURA DA
                    DOBRA: naquela versão a seção tinha 46rem e a figura
                    passava dela inteira. Agora a dobra é de tela cheia,
                    e o que sobra para cortar é só o braço. Se alguém
                    reduzir a altura da dobra, confira este
                    enquadramento antes de dizer que terminou.

                    ⚠️ ISTO ERA POSICIONAMENTO ABSOLUTO COM PORCENTAGENS
                    À MÃO, e centralizar virou jogo de adivinhação: cada
                    ajuste de altura mudava a largura da figura, que
                    mudava onde ela ficava. Com flex e `justify-center`
                    o navegador mede e centra sozinho, em qualquer
                    largura, sem número mágico nenhum. */}
                <div className="absolute inset-0 flex items-end justify-center">
                  {/* ⚠️ TAMANHO E DESCIDA VÊM DO PAINEL, por estilo
                      inline. Era `h-[112%]` cravado. Virou controle
                      porque é decisão de campanha e não de código: o
                      recorte muda a cada foto — uns vêm de corpo
                      inteiro, outros da cintura para cima — e o mesmo
                      112% que enquadra bem um deixa o outro pequeno no
                      meio da tela.

                      ⚠️ ESTILO INLINE, E NÃO CLASSE MONTADA. Classe
                         interpolada não funcionaria: o Tailwind varre os
                         arquivos procurando nomes literais e não gera
                         CSS para nome montado em tempo de execução — a
                         altura cairia para o padrão em silêncio, sem
                         erro de build. Já aconteceu neste projeto, na
                         grade do álbum.

                      ⚠️ O `transform` DAQUI CONVIVE COM O PARALAXE
                         PORQUE O PARALAXE USA `scale`. Enquanto os dois
                         disputavam `transform`, este `translateY` ia
                         sendo cancelado conforme a pessoa rolava — o
                         enquadramento ficava certo no topo e desandava
                         na descida. Ver `hero-cresce` em globals.css;
                         não troque `scale` por `transform` lá. */}
                  <Imagem
                    slot="hero.retrato"
                    slots={slots}
                    vazio="silhueta"
                    prioridade
                    sizes="(max-width: 1024px) 80vw, 42vw"
                    estilo={{
                      height: `${aparencia.heroFiguraAltura}%`,
                      transform: `translateY(${aparencia.heroFiguraDescida}%)`,
                    }}
                    className="hero-foto pointer-events-none relative z-20 w-auto max-w-none shrink-0 object-contain object-bottom"
                  />
                </div>
              </div>
            </div>

            {/* ── Direita: o pedido ──
                ⚠️ O CARTÃO É ESCURO E OS ALGARISMOS AMARELOS, e não o
                contrário. `Numero` pinta os algarismos com amarelo
                cravado quando desenha o SVG, e o PNG que o painel pode
                subir no espaço `marca.numero` — que é o caso desta
                campanha — também é amarelo. Cartão amarelo apagaria os
                dois, sem erro nenhum no console. Já aconteceu aqui. */}
            {/* ⚠️ `z-20` PARA EMPATAR COM A FIGURA. A caixa da figura passa
                7px por baixo do cartão (é o retângulo transparente dela,
                não o desenho), e como ela está em `z-20` e o cartão em
                nenhum andar, era a figura que pintava por cima. Empatando
                o andar, quem decide é a ordem do documento — e o cartão
                vem depois. Não use `order` para resolver isto: neste
                projeto `order` já inverteu ordem de pintura uma vez. */}
            <div className="lado-dobra relative z-20 order-3 pb-4 lg:pb-14">
              <div className="cartao-numero chanfro mx-auto max-w-sm px-6 py-6 lg:mx-0">
                <Numero
                  url={slots['marca.numero']?.url ?? null}
                  className="w-24 sm:w-28"
                />

                {hero.numeroLegenda ? (
                  <p className="mt-3 text-[0.75rem] leading-snug font-semibold tracking-[0.06em] text-white/80 uppercase">
                    {hero.numeroLegenda}
                  </p>
                ) : null}

                {!silencio ? (
                  <div className="mt-5 flex flex-col gap-2.5">
                    {/* ⚠️ O BOTÃO É UM DOS TRÊS ÚNICOS AMARELOS DA
                        DOBRA, e essa contagem é a regra do desenho. Cor
                        de ação que aparece em todo lugar deixa de
                        apontar para lugar nenhum — foi o que fez uma
                        versão anterior ler como "cores aleatórias". */}
                    <CliqueGrupo origem="hero" href={paraOsGrupos} className="block">
                      <span className="toque flex min-h-13 items-center justify-center gap-2.5 chanfro bg-(--capa-botao) px-5 text-base font-semibold text-(--capa-botao-texto) transition-[background-color,color,filter] duration-300 hover:bg-[color-mix(in_srgb,var(--capa-botao)_88%,white)]">
                        {ctas.grupoCurto}
                        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </CliqueGrupo>

                    <BotaoLink
                      href="/filtro"
                      variante="contorno"
                      tamanho="md"
                      className="w-full text-white"
                    >
                      {ctas.filtroCurto}
                    </BotaoLink>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-white/80">{ctas.silencio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── A barra do pé ──
            Células separadas por fio, como a faixa de indicadores da
            referência.

            ⚠️ NENHUMA CÉLULA INVENTA DADO. A tentação numa faixa assim
            é preencher com "20 anos de polícia", "52 municípios",
            "9.751 votos" — e número de campanha inventado é problema
            jurídico, não erro de digitação. As células mostram só o que
            existe em `content/copy.ts` e é editável no painel.

            ⚠️ CADA CÉLULA SOME SOZINHA SE O CAMPO ESTIVER VAZIO, que é
            a regra do modelo: o site tem que ficar de pé em qualquer
            estado de preenchimento. Com as duas vazias, a barra inteira
            também some.

            ⚠️ `z-30` E NÃO `z-10`: a figura é `z-20` e é cortada pelo pé
            do painel, então os últimos pixels do corte caem em cima
            desta faixa. Com a barra em 10, as pernas apareciam POR CIMA
            das células. Ela também tem fundo próprio por isso. */}
        {hero.rodapeHero || hero.lema ? (
          <div className="barra-hero relative z-30">
            <div className="container-lp flex flex-col sm:flex-row sm:items-stretch">
              {hero.rodapeHero ? (
                <p className="celula flex flex-1 items-center gap-2.5 py-4 text-sm text-white/75 sm:pr-6">
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-(--capa-realce)" fill="currentColor" aria-hidden>
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                  </svg>
                  {hero.rodapeHero}
                </p>
              ) : null}

              {hero.lema ? (
                <p className="celula flex items-center py-4 text-[0.6875rem] font-semibold tracking-[0.22em] text-white/60 uppercase sm:pl-6">
                  {hero.lema}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
