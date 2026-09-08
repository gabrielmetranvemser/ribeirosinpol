'use client'

import { useEffect, useState } from 'react'

/**
 * No celular, o bloco do número vira uma barra FIXA no pé da tela
 * enquanto a primeira dobra está visível. No desktop este invólucro
 * não faz nada: o CSS (`.pedido-fixo` em globals.css) só existe abaixo
 * de 1024px.
 *
 * ⚠️ 560px É O MESMO LIMIAR DO `BotaoFlutuante`, e não é coincidência:
 *    é uma passagem de bastão. Até 560px de rolagem quem está fixo é
 *    esta barra (número + botão amarelo); dali em diante ela sai e
 *    entra o flutuante verde de WhatsApp, que já existia. Se um dos dois
 *    mudar o número, os dois aparecem juntos por um trecho — ou nenhum.
 *
 * ⚠️ O CONTEÚDO CONTINUA VINDO DO SERVIDOR. Este componente só liga e
 *    desliga uma classe; o número, a legenda e os botões são filhos
 *    renderizados pelo `Hero`, que é Server Component. Assim a barra
 *    já nasce no HTML e o botão principal é clicável antes de o
 *    JavaScript chegar — a regra dos 3 segundos em 4G.
 */
export function PedidoFixo({ children }: { children: React.ReactNode }) {
  const [passou, setPassou] = useState(false)

  useEffect(() => {
    const aoRolar = () => setPassou(window.scrollY > 560)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  return (
    <div className={`pedido-fixo${passou ? ' pedido-fixo-passou' : ''}`}>{children}</div>
  )
}
