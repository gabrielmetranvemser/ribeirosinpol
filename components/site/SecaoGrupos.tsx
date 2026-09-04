import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
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
  const { grupos: copy } = await lerConteudo()

  return (
    <Secao id="grupos" fundo="branco" espaco="solto">
      <CabecalhoSecao
        etiqueta={copy.etiqueta}
        titulo={copy.titulo}
        destaque="grifo"
        intro={copy.intro}
      />
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
