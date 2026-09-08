import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'
import { TextoComDestaque, Texto } from '@/components/ui/TextoComDestaque'
import { Numero } from '@/components/ui/Marca'
import { BotaoLink } from '@/components/ui/Botao'
import { destinoGrupo } from '@/lib/conteudo/secoes'
import { CliqueGrupo } from './CliqueGrupo'
import { PlacasHero } from './PlacasHero'
import { PedidoFixo } from './PedidoFixo'

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
 *      · A FIGURA DE UM LADO, A INFORMAÇÃO DO OUTRO. À esquerda a
 *        foto, com metade da largura; à direita a mensagem e, abaixo
 *        dela, o pedido. Nenhuma metade vazia. (Já foi "figura no
 *        centro, informação dos dois lados" — ver a 5ª tentativa.)
 *      · FUNDO FOTOGRÁFICO, não pintado. Ver PlacasHero.
 *      · UMA CURVA SÓ (o arco) e UM ACENTO SÓ (o amarelo, em três
 *        lugares contados: botão, realce do título e fio do cartão).
 *        O botão amarelo do cabeçalho some enquanto a dobra está na
 *        tela — ver Header — senão eram dois botões iguais a 40px de
 *        distância.
 *
 *    4ª — A FOTO TROCOU E A COMPOSIÇÃO NÃO. A dobra foi desenhada para
 *         um recorte estreito, de braço erguido; entrou um de braços
 *         cruzados, largo, com `max-width: none` na imagem — e o
 *         cotovelo avançou 46px para dentro do parágrafo, por cima do
 *         texto. Junto vieram os sintomas de "amador": foto de 45% da
 *         tela contra título de 52px, mosaico de fotos com borda
 *         cortando atrás da cabeça, recorte sem sombra cortado por uma
 *         barra de vidro, seis amarelos numa tela. A regra que saiu
 *         disso: A FIGURA É CERCADA PELA PRÓPRIA COLUNA (ver o
 *         `max-w-full` + `object-contain` na imagem). Recorte largo
 *         encolhe; nunca invade. Vale para qualquer foto que a campanha
 *         subir, que é a regra do modelo.
 *
 *    5ª — CERCADA NA COLUNA DO MEIO, A FIGURA FICOU PEQUENA. Três
 *         colunas dão ~460px para a foto; um recorte largo cabe ali
 *         com 800px de altura e a cabeça nasce ABAIXO do topo do
 *         título — "menor e mais baixo que a headline". A resposta foi
 *         a que o cliente pediu: DUAS COLUNAS. A figura à esquerda, com
 *         a metade da largura; título, parágrafo e pedido empilhados à
 *         direita. Mais largura para a foto é mais altura para a foto.
 *         A 3ª tentativa também era "figura de um lado só" e foi
 *         reprovada por deixar a outra metade vazia — a diferença é
 *         que agora a outra metade tem a mensagem E o pedido, e o
 *         fundo fotográfico continua atrás da figura (o clarão e o
 *         mosaico foram para 30% da largura, ver globals.css).
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

          {/* ⚠️ DUAS COLUNAS: A FIGURA À ESQUERDA, TUDO O MAIS À DIREITA.
              Eram três, com a figura no meio, e a figura ficou pequena
              (ver a 5ª tentativa no topo). A coluna da foto é a maior
              porque a foto é o assunto; a da direita empilha mensagem e
              pedido, nessa ordem.

              ⚠️ A ORDEM DO DOM É A DO CELULAR: mensagem, pedido, figura.
              Era mensagem, figura, pedido — "a ordem de leitura" — e o
              resultado era uma dobra de 1.200px numa tela de 812: a
              cabeça da foto subia por trás do parágrafo e o número com
              o botão só apareciam depois de rolar. Com o pedido antes
              da foto, número e botão cabem na primeira tela e a foto
              fecha a dobra, fundindo com o fundo (ver `.dobra-pe`). No
              desktop a figura vai para a coluna 1 por `col-start`, e
              não por `order`: posição explícita, sem depender de
              contagem.

              ⚠️ NO CELULAR O PEDIDO NÃO FICA NO FLUXO: é uma barra fixa
              no pé da tela (`PedidoFixo`). A ordem visível vira
              título, texto, foto — e o botão sempre à mão.

              ⚠️ `dobra-grade`, E NÃO `container-lp`. A dobra é a única
              peça da página que sangra: a coluna da foto começa a 3rem
              da borda da tela, e não na margem do contêiner de 75rem —
              com a margem, sobravam 150px vazios de cada lado da figura
              e ela parecia pequena em qualquer tamanho. A coluna do
              texto continua alinhada à direita do contêiner, que é
              onde o cabeçalho e a barra do pé terminam; só a foto
              avança. A conta está em `@utility dobra-grade`. */}
          <div className="dobra-grade grid flex-1 items-end gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12">
            {/* ── Direita (no desktop): a mensagem e o pedido ── */}
            <div className="flex flex-col gap-5 lg:col-start-2 lg:row-start-1 lg:gap-9 lg:self-center lg:pb-12">
            <div className="lado-dobra relative z-20 pb-2 text-center lg:pb-0 lg:text-left">
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

              {/* ⚠️ O PARÁGRAFO É A PARTE QUE COLIDIA COM A FIGURA, e a
                  largura dele é o que decide se a dobra lê como manchete
                  ou como texto corrido. 26rem em 15px dá ~4 linhas para
                  ~150 caracteres. O texto de fábrica tem 260 e sai em
                  seis: encurtá-lo é decisão de campanha (PENDENCIAS.md),
                  e a dobra fica de pé com qualquer tamanho — a figura
                  não invade mais. */}
              <p
                className="anima-hero mx-auto mt-4 max-w-[26rem] text-[0.9375rem] leading-[1.6] text-white/75 lg:mx-0"
                style={{ animationDelay: '440ms' }}
              >
                <Texto tom="capa">{hero.subtitulo}</Texto>
              </p>
            </div>

              <Pedido
                ctas={ctas}
                hero={hero}
                slots={slots}
                paraOsGrupos={paraOsGrupos}
                silencio={silencio}
              />
            </div>

            {/* ── Esquerda (no desktop): a figura ──
                ⚠️ `max-w-full` + `object-contain`, E NÃO `max-w-none`.
                Era `max-w-none`, com a justificativa de que a imagem é
                dimensionada pela altura e o teto de largura a
                "achataria". Não achata: com `object-contain` o que
                encolhe é a CAIXA da imagem, e o desenho se reacomoda
                dentro dela na proporção certa, ancorado no pé. O
                efeito é que um recorte largo (braços cruzados) fica
                menor em vez de sair da coluna e passar por cima do
                parágrafo — que foi exatamente o que aconteceu quando a
                foto trocou. A figura é cercada pela própria coluna, e o
                controle de tamanho do painel continua valendo até esse
                limite. */}
            {/* `max-lg:overflow-hidden`: no celular a figura é cortada
                pelo busto (ver a regra de `.hero-foto` abaixo de 1024px
                em globals.css), e o corte tem de ser na borda desta
                caixa — sem isto o excedente escorreria por baixo da
                barra fixa. */}
            <div
              className="anima-surge relative flex items-end justify-center self-end max-lg:overflow-hidden lg:col-start-1 lg:row-start-1 lg:-mb-[12.5rem]"
              style={{ animationDelay: '260ms' }}
            >
              <div className="relative h-[26rem] w-full sm:h-[32rem] lg:h-[47rem]">
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
                    className="hero-foto pointer-events-none relative z-20 w-auto max-w-full shrink-0 object-contain object-bottom"
                  />
                </div>

                {/* ⚠️ O PÉ DA FIGURA FUNDE COM O FUNDO, e é isto que
                    tirou a cara de "recorte colado". Sem o degradê, a
                    foto terminava numa linha reta em cima da barra do
                    pé, que por sua vez tinha fundo de vidro fosco para
                    esconder as pernas — parecia gente atrás de um
                    balcão. Agora a barra é só um fio, e quem some com
                    as pernas é este degradê, dentro da coluna da
                    figura (não cobre texto nem cartão). A conta do
                    ponto onde ele fica sólido está em `.dobra-pe`. */}
                <div className="dobra-pe" aria-hidden />
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
            das células.

            ⚠️ ELA NÃO TEM MAIS FUNDO PRÓPRIO. Tinha vidro fosco para
            esconder as pernas; o vidro cortava a figura numa linha reta
            e lia como balcão. Agora quem apaga as pernas é o degradê
            `.dobra-pe`, dentro da coluna da figura, e a barra é só um
            fio sobre a cor chapada. */}
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

/**
 * O bloco do número, abaixo da mensagem na coluna da direita.
 *
 * É componente à parte por causa da ORDEM DO DOM: no celular ele vem
 * antes da figura e no desktop divide a coluna com a mensagem. Deixá-lo
 * inline obrigaria a coluna da direita a virar uma parede de 120
 * linhas de JSX. Não é reutilizado em lugar nenhum.
 */
function Pedido({
  ctas,
  hero,
  slots,
  paraOsGrupos,
  silencio,
}: {
  ctas: Awaited<ReturnType<typeof lerConteudo>>['ctas']
  hero: Awaited<ReturnType<typeof lerConteudo>>['hero']
  slots: Awaited<ReturnType<typeof lerSlots>>
  paraOsGrupos: string
  silencio: boolean
}) {
  return (
    <PedidoFixo>
            {/* ── O pedido ──
                ⚠️ O CARTÃO É ESCURO E OS ALGARISMOS AMARELOS, e não o
                contrário. `Numero` pinta os algarismos com amarelo
                cravado quando desenha o SVG, e o PNG que o painel pode
                subir no espaço `marca.numero` — que é o caso desta
                campanha — também é amarelo. Cartão amarelo apagaria os
                dois, sem erro nenhum no console. Já aconteceu aqui. */}
            {/* ⚠️ `z-20`, O MESMO ANDAR DA FIGURA. Quando os dois se
                sobrepunham, quem decidia era a ordem do documento. Hoje
                não se sobrepõem — a figura é cercada pela própria coluna
                — mas a sombra dela vaza 3rem para o lado, e este bloco
                precisa continuar no mesmo andar para a sombra não cair
                por cima do número. */}
            {/* ⚠️ O CARTÃO DEIXOU DE SER CAIXA. Era vidro fosco com borda
                de 14%, flutuando desalinhado do título e com dois botões
                do mesmo peso — a peça que mais fazia a dobra ler como
                template. Virou bloco editorial: um fio amarelo à
                esquerda, o número, UM botão, e o segundo pedido como
                link sublinhado. O fio é o terceiro amarelo contado da
                dobra. No celular o fio sai e o bloco centra (ver
                `.cartao-numero` em globals.css). */}
            {/* ⚠️ DUAS DIAGRAMAÇÕES NO MESMO HTML. No celular é uma LINHA
                (número e link à esquerda, botão à direita) de ~72px,
                porque é barra fixa e cada pixel dela é pixel a menos de
                página. No desktop é uma COLUNA com fio amarelo. O link
                "Colocar o número" aparece duas vezes no HTML, uma para
                cada lado (`lg:hidden` / `hidden lg:block`): é um `<a>`
                a mais no DOM em troca de não depender de `order`. */}
            <div className="lado-dobra relative z-20">
              <div className="cartao-numero mx-auto flex max-w-xl items-center justify-between gap-4 lg:mx-0 lg:block lg:max-w-sm">
                <div className="shrink-0 text-left">
                  <Numero
                    url={slots['marca.numero']?.url ?? null}
                    className="w-20 sm:w-24 lg:w-28"
                  />

                  {hero.numeroLegenda ? (
                    <p className="mt-1.5 hidden text-[0.75rem] leading-snug font-semibold tracking-[0.06em] text-white/80 uppercase sm:block lg:mt-3">
                      {hero.numeroLegenda}
                    </p>
                  ) : null}

                  {/* Link cru, e não `BotaoLink`: na barra de 72px o
                      link precisa de 12px, e o menor tamanho do botão
                      é 15px. Mesmo sublinhado da variante `texto`. */}
                  {!silencio ? (
                    <Link
                      href="/filtro"
                      className="mt-1.5 inline-block text-xs font-semibold whitespace-nowrap text-white/85 underline decoration-1 decoration-white/35 underline-offset-[5px] hover:decoration-white lg:hidden"
                    >
                      {ctas.filtroCurto}
                    </Link>
                  ) : null}
                </div>

                {!silencio ? (
                  <div className="flex shrink-0 flex-col items-stretch gap-4 lg:mt-6 lg:items-start">
                    {/* ⚠️ O BOTÃO É UM DOS TRÊS ÚNICOS AMARELOS DA
                        DOBRA, e essa contagem é a regra do desenho. Cor
                        de ação que aparece em todo lugar deixa de
                        apontar para lugar nenhum — foi o que fez uma
                        versão anterior ler como "cores aleatórias". */}
                    <CliqueGrupo origem="hero" href={paraOsGrupos} className="block lg:self-stretch">
                      <span className="toque flex min-h-12 items-center justify-center gap-2.5 chanfro bg-(--capa-botao) px-5 text-[0.9375rem] font-semibold whitespace-nowrap text-(--capa-botao-texto) transition-[background-color,color,filter] duration-300 hover:bg-[color-mix(in_srgb,var(--capa-botao)_88%,white)] lg:min-h-13 lg:text-base">
                        {ctas.grupoCurto}
                        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </CliqueGrupo>

                    {/* Link, e não segundo botão: dois botões do mesmo
                        tamanho dividem o clique, e o de contorno era o
                        quarto amarelo-ou-branco da tela. */}
                    <span className="hidden lg:block">
                      <BotaoLink
                        href="/filtro"
                        variante="texto"
                        tamanho="sm"
                        className="min-h-0 py-1 text-white/85"
                      >
                        {ctas.filtroCurto}
                      </BotaoLink>
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-white/80 lg:mt-5">{ctas.silencio}</p>
                )}
              </div>
            </div>
    </PedidoFixo>
  )
}
