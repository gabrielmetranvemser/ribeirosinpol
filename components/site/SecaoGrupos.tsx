import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
import { MapaEstado } from '@/components/grupos/MapaEstado'
import { TEM_MAPA } from '@/content/campanha'
import type { MunicipioComGrupo } from '@/lib/tipos'

export async function SecaoGrupos({
  municipios,
  sugerido,
}: {
  municipios: MunicipioComGrupo[]
  sugerido?: MunicipioComGrupo | null
}) {
  const [{ grupos: copy }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <Secao id="grupos" fundo="branco" espaco="solto">
      <CabecalhoSecao
        etiqueta={copy.etiqueta}
        titulo={copy.titulo}
        destaque="grifo"
        intro={copy.intro}
      />

      {/* ⚠️ A FOTO FICA ENTRE A INTRODUÇÃO E O BUSCADOR, e a ordem
          importa mais do que parece. A introdução afirma "meu mandato
          é para os 52 municípios"; o buscador pede que a pessoa
          encontre o dela. Entre uma coisa e outra há um salto de
          confiança, e é ali que a foto do interior trabalha: ela
          mostra o mandato num município pequeno antes de pedir que
          alguém de um município pequeno se identifique.

          Depois do buscador ela não serviria para nada — quem já
          clicou no grupo saiu da página. E some inteira quando o
          espaço está vazio: o buscador é o objetivo número um da
          página e não divide atenção com moldura cinza. */}
      {slots['grupos.imagem'] ? (
        <figure data-revelar className="mt-12 overflow-hidden chanfro-lg">
          <Imagem
            slot="grupos.imagem"
            slots={slots}
            sizes="(max-width: 768px) 100vw, 72rem"
            className="w-full object-cover"
          />
        </figure>
      ) : null}

      <BuscadorDeGrupo
        municipios={municipios}
        sugerido={sugerido}
        /* ⚠️ O MAPA SÓ EXISTE EM CAMPANHA ESTADUAL. Em campanha
           municipal o território é dividido por bairro, e não há
           malha oficial de bairro no IBGE para desenhar. O
           `BuscadorDeGrupo` aceita `mapa` nulo e se rearranja em
           coluna única — a busca e a lista continuam inteiras. */
        mapa={TEM_MAPA ? <MapaEstado municipios={municipios} destacado={sugerido?.slug} /> : null}
      />
    </Secao>
  )
}
