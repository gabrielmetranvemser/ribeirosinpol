'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { evento } from '@/lib/eventos'
import { Simbolo } from '@/components/ui/Marca'

export function Header({
  silencio = false,
  simbolo = null,
  ocultas = [],
}: {
  silencio?: boolean
  /** URL do espaço `marca.simbolo`. Vem do servidor: o Header é cliente. */
  simbolo?: string | null
  /** Ids de seção desligadas no painel. Somem do menu. */
  ocultas?: string[]
}) {
  const { candidato, ctas, navegacao } = useConteudo()
  // Item de menu apontando para âncora que não existe mais não dá
  // erro: ele só não faz nada. Fora do menu é mais honesto.
  // O botão do próprio cabeçalho seguia com destino fixo. Com a seção
  // de grupos desligada ele virava clique morto — o pior tipo de bug,
  // porque não dá erro nenhum.
  const paraOsGrupos = ocultas.includes('grupos') ? '/grupos' : '/#grupos'

  const itens = navegacao.itens.filter((item) => {
    const ancora = item.href.match(/#([\w-]+)/)
    return !ancora || !ocultas.includes(ancora[1])
  })

  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)

  // ⚠️ O BOTÃO AMARELO SOME ENQUANTO A PRIMEIRA DOBRA ESTÁ NA TELA. Na
  //    página inicial, parado no topo, ele ficava a 40px do botão
  //    idêntico do cartão do número — dois "Entrar no grupo" amarelos
  //    na mesma tela, que era um dos seis amarelos que faziam a dobra
  //    ler como amadora. Assim que a página rola, o cartão sai de cena
  //    e o botão do cabeçalho volta. Nas outras páginas (/grupos,
  //    /filtro) não há cartão, então ele fica sempre.
  const semBotaoNoTopo = usePathname() === '/' && !rolou

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 16)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-4">
      <div className="container-lp">
        <div
          /* ⚠️ NO TOPO DA PÁGINA ELE NÃO É UMA PÍLULA, e isso é
             deliberado. A primeira dobra sangra até a borda da tela, e
             o cabeçalho é a PRIMEIRA LINHA dela — não uma barra de
             vidro flutuando por cima. Pílula sobre a dobra cria uma
             segunda moldura concorrendo com a do navegador, que foi
             parte do que fazia a dobra parecer empilhada.

             Por isso, parado no topo: sem fundo, sem borda, sem
             chanfro, e um fio embaixo separando do conteúdo. O recuo
             lateral (`pl-5 md:pl-8`) é o mesmo do conteúdo da dobra,
             senão o logotipo nasce desalinhado do título por 0,75rem —
             desalinho pequeno o bastante para ninguém saber nomear e
             grande o bastante para incomodar.

             Assim que a página rola, ele VOLTA a ser pílula branca:
             fora do painel não há moldura nenhuma para acompanhar, e aí
             a pílula é o que separa o cabeçalho do conteúdo. */
          className={`relative flex h-16 items-center justify-between gap-4 transition-all duration-300 ${
            rolou || aberto
              ? 'chanfro border border-linha bg-white/92 px-3 pl-5 text-tinta shadow-suave backdrop-blur-xl'
              : 'border-b border-white/12 px-3 pl-5 text-white md:pr-4 md:pl-8'
          }`}
        >
          <Link href="/" className="flex items-center gap-3" aria-label={`${candidato.nome} — início`}>
            <Simbolo prioridade url={simbolo} className="h-8 w-auto shrink-0" />
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-titulo)] text-[1.0625rem] font-bold tracking-[-0.025em]">
                {candidato.nome}
              </span>
              <span
                className={`block text-[0.6875rem] font-medium tracking-[0.08em] ${
                  rolou || aberto ? 'text-grafite' : 'text-white/75'
                }`}
              >
                {candidato.cargo} · {candidato.estado}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {itens.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`chanfro-sm px-4 py-2.5 text-[0.9375rem] font-medium transition-colors ${
                  rolou || aberto
                    ? 'text-grafite hover:bg-azul-suave hover:text-azul-escuro'
                    : 'text-white/85 hover:bg-white/15 hover:text-white'
                }`}
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!silencio ? (
              <Link
                href={paraOsGrupos}
                onClick={() => evento('clicou_cta', { origem: 'topo' })}
                className={`toque hidden min-h-11 items-center chanfro bg-amarelo px-5 text-[0.9375rem] font-semibold text-azul-escuro transition-colors hover:bg-[color-mix(in_srgb,var(--color-amarelo)_88%,white)] ${
                  semBotaoNoTopo ? '' : 'sm:inline-flex'
                }`}
              >
                {ctas.grupoCurto}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-mobile"
              aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
              className={`inline-flex size-12 items-center justify-center rounded-full transition-colors lg:hidden ${
                rolou || aberto ? 'text-azul-escuro hover:bg-azul-suave' : 'text-white hover:bg-white/15'
              }`}
            >
              <span className="relative block h-3.5 w-5" aria-hidden>
                <span
                  className={`absolute inset-x-0 h-[2px] rounded-full bg-current transition-all duration-300 ${
                    aberto ? 'top-1/2 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 ${
                    aberto ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute inset-x-0 h-[2px] rounded-full bg-current transition-all duration-300 ${
                    aberto ? 'top-1/2 -rotate-45' : 'bottom-0'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Progresso de leitura. Zero JavaScript: a animação é ligada
              à rolagem da página por animation-timeline. Onde o
              navegador não suporta, a regra inteira é ignorada e a
              barra fica em scaleX(0) — invisível, sem quebrar nada. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-7 bottom-0 h-[3px] overflow-hidden rounded-full"
          >
            <span className="barra-progresso block h-full rounded-full bg-amarelo" />
          </span>
        </div>

        {/* Menu mobile */}
        {aberto ? (
          <nav
            id="menu-mobile"
            className="mt-2 chanfro-lg border border-linha bg-white p-2 shadow-media lg:hidden"
            aria-label="Menu mobile"
          >
            {itens.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className="flex min-h-14 items-center chanfro-lg px-4 text-lg font-medium transition-colors hover:bg-azul-suave"
              >
                {item.rotulo}
              </Link>
            ))}
            {!silencio ? (
              <Link
                href={paraOsGrupos}
                onClick={() => {
                  setAberto(false)
                  evento('clicou_cta', { origem: 'topo' })
                }}
                className="mt-2 flex min-h-14 items-center justify-center chanfro bg-amarelo px-6 font-semibold text-azul-escuro"
              >
                {ctas.grupo}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  )
}
