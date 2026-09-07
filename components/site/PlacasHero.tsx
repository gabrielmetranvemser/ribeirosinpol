import { FundoVivo } from './FundoVivo'

/**
 * As camadas de fundo da primeira dobra: a galeria, o clarão de cor e
 * a vinheta.
 *
 * ⚠️ A GALERIA APARECE SÓ ATRÁS DA FIGURA. Quem faz isso é uma máscara
 *    radial em `globals.css`, e não um elemento aqui.
 *
 * ⚠️ AQUI JÁ TEVE UMA ESTRELA GIGANTE DESFOCADA e duas camadas de
 *    `backdrop-filter` borrando o fundo fora dela. As duas foram
 *    reprovadas, e vale saber por quê antes de tentar de novo:
 *
 *    · A ESTRELA lia como adesivo colado atrás do candidato, não como
 *      clarão. Aumentar o desfoque não resolveu — só a deixou maior e
 *      mais cinzenta.
 *    · O DESFOQUE DE FUNDO INTEIRO ficava sujo. Borrar uma colagem de
 *      sessenta fotos some com o assunto de cada uma e sobra textura
 *      suja, não atmosfera.
 *
 *    A saída foi parar de borrar o que sobra e não ter o que sobra.
 *
 * ⚠️ AQUI TAMBÉM JÁ TEVE A SILHUETA DO ESTADO, gerada da malha do
 *    IBGE, e foi reprovada: contorno de Rondônia atrás de um retrato lê
 *    como mancha, não como lugar.
 */
export function PlacasHero() {
  return (
    <div className="placas" aria-hidden>
      <div className="dobra-galeria">
        <FundoVivo />
      </div>

      <div className="dobra-brilho" />
      <div className="dobra-vinheta" />
    </div>
  )
}
