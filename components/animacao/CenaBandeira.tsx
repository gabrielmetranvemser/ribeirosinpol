import type { ReactNode } from 'react'
import { lerConteudo } from '@/lib/conteudo/ler'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'
import { PalcoMotor } from './PalcoMotor'

/**
 * A cena da bandeira de Rondônia: a tela fica presa e a bandeira vai
 * sendo montada conforme a pessoa rola. TRÊS tempos:
 *
 *   1 · o azul toma a tela                   → texto no azul
 *   2 · o amarelo sobe alto, três quartos    → texto no amarelo
 *   3 · o amarelo assenta na metade, o verde → texto dentro da
 *       sobe e a estrela nasce do meio,        estrela, que cresce
 *       tudo ao mesmo tempo                    até a tela ser só ela
 *
 * Rolar para cima desmonta na mesma proporção.
 *
 * Fica entre Valores e Provas de propósito: a seção de cima termina
 * verde e a de baixo começa azul, então a cena não é um bloco colado
 * no meio da página — é a emenda entre as duas.
 *
 * ⚠️ TRÊS TEMPOS, E NÃO QUATRO. Uma versão anterior dava um tempo a
 *    cada cor, e a cena virava uma sequência de slides: cada forma
 *    esperava a anterior acabar. Fundindo as três formas num tempo só,
 *    a bandeira MONTA em vez de ser desenhada peça por peça — e sobra
 *    rolagem para os dois primeiros textos ficarem legíveis.
 *
 * ⚠️ CADA TEXTO É FILHO DA CAMADA DA PRÓPRIA COR, e essa é a única
 *    coisa que este arquivo precisa acertar. O `clip-path` que pinta a
 *    banda é o mesmo que revela o texto: tirar o texto de dentro da
 *    banda não muda "só a marcação", desliga o efeito inteiro.
 *
 *    O terceiro é a exceção — a banda dele é a ESTRELA, que a essa
 *    altura cresceu dezesseis vezes e é a tela inteira. Por isso o
 *    texto dele é azul-escuro: o fundo é branco.
 *
 * A animação inteira mora em globals.css e pende de uma variável só.
 * Aqui não há estado, não há efeito, não há JavaScript — PalcoMotor é
 * um plano B que na maioria dos navegadores devolve sem registrar nada.
 */
export async function CenaBandeira() {
  const { cena } = await lerConteudo()

  return (
    <section data-palco aria-label={cena.passo1.etiqueta}>
      {/* O trilho fica com 340svh. A altura do trilho É a duração do
          palco, e os três tempos precisam dela: o azul sozinho leva
          um quarto. */}
      <div className="palco-trilho" style={{ '--palco-passos': 4 } as React.CSSProperties}>
        <div className="palco-fixa">
          <PalcoMotor />

          {/* A ORDEM AQUI É A ORDEM DE PINTURA, e é a do desenho oficial
              da bandeira: azul, amarelo, verde, estrela. Sem z-index
              nenhum — quem vem depois pinta por cima, e a estrela ser a
              última é o que mantém as pernas dela brancas. */}
          {/* ⚠️ AS QUATRO CAMADAS FICAM DENTRO DE UM INVÓLUCRO, e ele
              existe por uma razão só: no terceiro tempo a bandeira dá
              zoom, e quem escala é ele. Escalar a estrela sozinha —
              que foi a primeira tentativa — deixava o verde e o
              amarelo parados no tamanho antigo, e o que se via não era
              uma bandeira ampliada: era uma estrela grande colada numa
              bandeira pequena. Dentro do invólucro, todas as
              proporções da bandeira continuam exatas em qualquer
              quadro do zoom. */}
          <div className="cena-bandeira">
            <div className="cena-banda cena-azul">
              <Painel n={1} {...cena.passo1} tom="amarelo" />
            </div>

            <div className="cena-banda cena-amarelo">
              {/* Sobre o amarelo o realce é o verde-escuro: das cinco
                  cores da marca é a única que passa em contraste ali. */}
              <Painel n={2} {...cena.passo2} tom="verde" />
            </div>

            <div aria-hidden className="cena-banda cena-verde" />
            <div aria-hidden className="cena-astro" />
          </div>

          {/* O grão da cena inteira. FORA do invólucro: se escalasse
              junto, cada ponto de ruído viraria uma mancha. */}
          <div aria-hidden className="cena-grao" />

          {/* `grifo` e não uma cor de texto: este é o único painel sobre
              BRANCO, e amarelo em texto sobre branco dá 1,33:1. Como
              faixa por baixo da palavra, o mesmo amarelo é o realce da
              campanha e continua legível. */}
          <Painel n={3} {...cena.passo3} tom="grifo" />
        </div>
      </div>
    </section>
  )
}

/**
 * Uma das três telas. A cor do texto, o recorte e o momento vêm do CSS,
 * pela classe `cena-painel-N` — aqui não há nada que dependa de qual
 * tempo é, exceto o número.
 */
function Painel({
  n,
  etiqueta,
  titulo,
  texto,
  tom,
}: {
  n: 1 | 2 | 3
  etiqueta: string
  titulo: string
  texto: string
  tom: 'amarelo' | 'verde' | 'grifo'
}): ReactNode {
  return (
    <div className={`cena-painel cena-painel-${n}`}>
      <div className="w-full container-lp">
        <div className="cena-texto mx-auto max-w-3xl">
          <p className="etiqueta opacity-80">{etiqueta}</p>

          {/* Grande, e pode ser: com três tempos em vez de quatro,
              nenhum destes textos divide a tela com uma forma crescendo
              ao lado dele. Escala pelos DOIS eixos — max(3.4vw, 4.6svh)
              — porque uma tela larga e baixa e uma estreita e alta
              pedem corpos diferentes, e esta cena é medida em telas. Só
              com vw o corpo encolhia no tablet em pé; só com svh,
              encolhia no monitor deitado. */}
          <h2 className="mt-4 font-[family-name:var(--font-titulo)] text-[clamp(2rem,max(3.4vw,4.6svh),4rem)] leading-[1.05] font-bold tracking-[-0.035em]">
            <TextoComDestaque texto={titulo} tom={tom} />
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[clamp(1.0625rem,2.1svh,1.35rem)] opacity-85">
            {texto}
          </p>
        </div>
      </div>
    </div>
  )
}
