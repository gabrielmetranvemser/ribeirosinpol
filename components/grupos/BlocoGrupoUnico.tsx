import Link from 'next/link'
import { campanha } from '@/content/campanha'
import { Imagem } from '@/components/ui/Imagem'
import type { ImagemDoSlot } from '@/lib/midia/ler'
import type { StatusGrupo } from '@/lib/tipos'

/**
 * A CAMPANHA COM UM GRUPO SÓ.
 *
 * Substitui o buscador de cidade, o mapa e a lista dos 52 municípios
 * quando `campanha.grupoUnico` está ligado. É a mesma peça na home e
 * em `/grupos`, e a razão de ser um componente e não um trecho
 * duplicado é essa: as duas telas precisam dizer exatamente a mesma
 * coisa, e o dia em que divergirem ninguém vai perceber.
 *
 * ⚠️ O BOTÃO APONTA PARA `/g/<slug>`, NUNCA PARA O LINK DO WHATSAPP.
 *    Passar pelo redirecionador é o que mantém três coisas que o link
 *    direto perderia: o clique é contado, o silêncio eleitoral é
 *    respeitado mesmo para quem chegou por QR impresso, e a campanha
 *    troca o destino no painel sem republicar o site. Um `href` com o
 *    `chat.whatsapp.com` dentro do HTML também é um convite a raspar —
 *    o link é o único segredo que esta página tem.
 *
 * ⚠️ SEM LINK, NÃO HÁ BOTÃO. Enquanto o grupo estiver "em breve" a
 *    peça mostra o aviso no lugar do botão. Um botão que promete o
 *    grupo e devolve a pessoa para a mesma página gasta o clique mais
 *    caro da campanha — o de quem já decidiu entrar.
 *
 * ⚠️ RECEBE TRÊS STRINGS, E NÃO O OBJETO `grupos` INTEIRO.
 *    A primeira versão recebia `copy` completo, e isso mandava para o
 *    cliente, em toda visita, os ~20 rótulos do buscador, do mapa e da
 *    lista — "Digite o nome da sua cidade", "Todos os municípios",
 *    "Usar minha localização" — dentro do payload do React. Não
 *    apareciam na tela, mas viajavam no HTML e apareciam em quem
 *    procurasse pelo texto da página, dizendo o contrário do que a
 *    página faz.
 */
export function BlocoGrupoUnico({
  intro,
  avisoEmBreve,
  rotuloBotao,
  status,
  slots,
  origem,
}: {
  /**
   * Opcional, e o motivo é que as duas telas montam o cabeçalho de
   * jeitos diferentes: na home a seção não passa `intro` ao
   * `CabecalhoSecao`, então ela sai daqui; em `/grupos` o cabeçalho da
   * página já a exibe, e repeti-la aqui punha o mesmo parágrafo duas
   * vezes na mesma tela — que foi exatamente o que aconteceu.
   */
  intro?: string
  avisoEmBreve: string
  rotuloBotao: string
  status: StatusGrupo
  slots: Record<string, ImagemDoSlot>
  /** De onde veio o clique, para a métrica separar hero de página. */
  origem: string
}) {
  const aberto = status === 'aberto'

  return (
    <div className="mt-12">
      {slots['grupos.imagem'] ? (
        <figure data-revelar className="mb-10 overflow-hidden chanfro-lg">
          <Imagem
            slot="grupos.imagem"
            slots={slots}
            sizes="(max-width: 768px) 100vw, 72rem"
            className="h-auto w-full"
          />
        </figure>
      ) : null}

      <div
        data-revelar
        className="chanfro-lg border border-linha bg-areia p-8 text-center md:p-12"
      >
        {intro ? <p className="text-lg text-grafite md:text-xl">{intro}</p> : null}

        {aberto ? (
          <Link
            href={`/g/${campanha.slugGrupo}?de=${origem}`}
            prefetch={false}
            className="toque mt-8 inline-flex min-h-14 items-center justify-center gap-2 chanfro bg-amarelo px-8 text-lg font-semibold text-azul-escuro transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--color-amarelo)_88%,white)]"
          >
            {rotuloBotao}
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1-1.4-1-2.6 0-1.3.6-1.9.9-2.1.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.4-.3.4c-.1.1-.3.3-.1.6.1.3.6 1.1 1.4 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.7-.1 1.3Z" />
            </svg>
          </Link>
        ) : (
          <p className="mt-8 chanfro border border-amarelo/60 bg-amarelo/15 px-6 py-4 text-base text-tinta">
            {avisoEmBreve}
          </p>
        )}
      </div>
    </div>
  )
}
