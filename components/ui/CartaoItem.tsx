import type { ReactNode } from 'react'
import { Texto } from './TextoComDestaque'

/**
 * O cartão de item — a peça que se repete nas listas de bandeiras,
 * desafios e compromissos.
 *
 * ⚠️ ISTO ERA TRÊS CARTÕES ESCRITOS À MÃO, e a diferença entre eles não
 *    era intenção, era descuido acumulado. `Valores` usava
 *    `chanfro-lg` com `shadow-suave` e crachá de 48px em `chanfro-lg`;
 *    `Problema` usava a utilidade `cartao` com `shadow-media` no hover
 *    e crachá de 44px em `chanfro-sm`; `Futuro` usava borda com
 *    `shadow-suave` e crachá de 48px em `chanfro-sm`. Três seções
 *    seguidas mostrando quase a mesma peça com três medidas diferentes
 *    é o que faz uma página parecer montada, não desenhada.
 *
 * ⚠️ O CRACHÁ QUADRADO SAIU. Quadrado colorido com número dentro é
 *    forma de sistema de design genérico — aparece igual em qualquer
 *    site, e era um dos traços que este projeto dividia com a página de
 *    outra candidatura saída do mesmo modelo. No lugar entrou o número
 *    grande na fonte de título, que é tipografia e não caixinha: ele
 *    ancora o cartão sem competir com o próprio conteúdo.
 *
 * ⚠️ A SOMBRA E O SALTO NO HOVER SAÍRAM, pela mesma razão que saíram do
 *    botão e do cartão base: elevação é a linguagem que a primeira
 *    dobra abandonou. A resposta ao ponteiro agora é por COR — a borda
 *    acende. Num celular, que é de onde vem quase todo o tráfego desta
 *    campanha, hover não existe e o salto nunca foi visto por ninguém.
 *
 * ⚠️ AMARELO NÃO ENTRA AQUI. Estes cartões são brancos, e amarelo sobre
 *    branco dá 1,33:1 — a regra mais antiga do projeto. O acento destes
 *    cartões é o azul ou o verde escuro, conforme a seção.
 */
export function CartaoItem({
  marca,
  titulo,
  texto,
  tom = 'azul',
  atraso = 0,
  className = '',
}: {
  /** Número da lista ou ícone. Vazio = cartão sem marcador. */
  marca?: ReactNode
  titulo: string
  texto: string
  /** Cor do marcador e da borda acesa. Segue a superfície da seção. */
  tom?: 'azul' | 'verde'
  /** Escalonamento da revelação, em ms. */
  atraso?: number
  className?: string
}) {
  const cor = tom === 'verde' ? 'text-verde-escuro' : 'text-azul-escuro'
  const borda = tom === 'verde' ? 'hover:border-verde/45' : 'hover:border-azul/45'

  return (
    <li
      data-revelar
      style={{ ['--atraso' as string]: `${atraso}ms` }}
      className={`flex h-full flex-col chanfro-lg border border-linha bg-white p-7 transition-colors duration-300 md:p-8 ${borda} ${className}`}
    >
      {marca ? (
        <span className={`voz-marca text-[2rem] leading-none ${cor}`} aria-hidden>
          {marca}
        </span>
      ) : null}

      {/* `mt-auto` não: o texto não é empurrado para o pé do cartão. Numa
          grade em que os cartões têm alturas de texto diferentes, texto
          colado embaixo desalinha a leitura de todos eles — o que se
          quer alinhado é o TOPO, que é por onde o olho entra. */}
      <h3 className={`text-xl ${marca ? 'mt-5' : ''} text-tinta md:text-2xl`}>
        <Texto>{titulo}</Texto>
      </h3>
      <p className="mt-3 text-base text-grafite">
        <Texto>{texto}</Texto>
      </p>
    </li>
  )
}
