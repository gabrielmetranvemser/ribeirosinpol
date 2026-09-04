import { g } from '@/content/campanha'
import { headers } from 'next/headers'
import { lerSlots } from '@/lib/midia/ler'
import { listarMunicipiosComStatus } from '@/lib/dados'
import { casarCidadePorHeader } from '@/lib/geo'
import { config, emSilencioEleitoral } from '@/lib/config'
import { candidato, meta } from '@/content/copy'
import { lerConteudo } from '@/lib/conteudo/ler'
import { destinoGrupo, secoesOcultas } from '@/lib/conteudo/secoes'

import { Header } from '@/components/site/Header'
import { BotaoFlutuante } from '@/components/site/BotaoFlutuante'
import { RegistroDePagina } from '@/components/site/RegistroDePagina'
import { Hero } from '@/components/site/Hero'
import { FaixaCorrida } from '@/components/site/FaixaCorrida'
import { Origem } from '@/components/site/Origem'
import { Album } from '@/components/site/Album'
import { Rua } from '@/components/site/Rua'
import { Problema } from '@/components/site/Problema'
import { Valores } from '@/components/site/Valores'
import { CenaBandeira } from '@/components/animacao/CenaBandeira'
import { Provas } from '@/components/site/Provas'
import { ProvaSocial } from '@/components/site/ProvaSocial'
import { Trilha } from '@/components/site/Trilha'
import { Futuro } from '@/components/site/Futuro'
import { SecaoGrupos } from '@/components/site/SecaoGrupos'
import { SecaoFiltro } from '@/components/site/SecaoFiltro'
import { Compartilhar } from '@/components/site/Compartilhar'
import { CtaFinal } from '@/components/site/CtaFinal'
import { RodapeLegal } from '@/components/site/RodapeLegal'

/**
 * Revalida de hora em hora. Dois motivos:
 *  · o status dos grupos muda no painel e precisa aparecer sem redeploy
 *  · o silêncio eleitoral vira sozinho, sem alguém lembrar de apagar CTA
 */
export const revalidate = 3600

export default async function Home() {
  const simboloDaMarca = (await lerSlots())['marca.simbolo']?.url ?? null
  // Quais seções estão ligadas. Vem do painel; ver content/copy.ts.
  const { exibir } = await lerConteudo()
  const [municipios, cabecalhos] = await Promise.all([
    listarMunicipiosComStatus(),
    headers(),
  ])

  // Sugestão silenciosa por IP: o header vem da Vercel, de graça,
  // sem pedir permissão nenhuma para a pessoa.
  const sugerido = casarCidadePorHeader(
    municipios,
    cabecalhos.get('x-vercel-ip-city'),
    cabecalhos.get('x-vercel-ip-country-region'),
  )

  const silencio = emSilencioEleitoral()

  return (
    <>
      <RegistroDePagina />
      <Header silencio={silencio} simbolo={simboloDaMarca} ocultas={secoesOcultas(exibir)} />

      <main id="conteudo">
        {/* ═══════════════════════════════════════════════════════
            ⚠️ ESTA ORDEM É A DO `RIBEIRO SITE.docx`, NÃO A DO MODELO.
               Não mexa nela sem abrir o documento ao lado.

            O modelo nasceu com uma ordem de CONVERSÃO — dor, valores,
            provas, pedido —, que é a ordem de quem quer o clique o
            mais cedo possível. A primeira montagem desta campanha
            seguiu essa ordem e espremeu os 18 blocos do documento
            dentro dela. O resultado desmontava a narrativa: o bloco
            "POR QUE EU QUERO CONTINUAR", que é o fecho emocional do
            documento, virava a SEXTA seção da página, e o esporte —
            duas seções seguidas no documento — ficava repartido entre
            bandeiras e prestação de contas.

            Agora é o inverso, que era o pedido: o documento manda na
            ordem, e os componentes se acomodam a ele. Cada linha
            abaixo diz de qual bloco do documento ela veio.

            O CUSTO, para quem for mexer: seguindo o documento, o
            pedido de voto fica no fim. Quem segura a conversão até lá
            é o `BotaoFlutuante` e o `Header` — os dois acompanham a
            rolagem. Não remova nenhum dos dois achando que é enfeite.
            ═══════════════════════════════════════════════════════ */}
        <Hero silencio={silencio} />
        {exibir.faixa ? <FaixaCorrida /> : null}

        {/* 1 · "EU SOU RIBEIRO DO SINPOL" — Porto Velho, a mãe, os ofícios */}
        {exibir.origem ? <Origem /> : null}

        {/* 2 · "MINHA HISTÓRIA NA POLÍCIA CIVIL" — 2001, DEAAI, investigação.
               Vem ANTES do álbum: no documento a farda antecede o sindicato. */}
        {exibir.rua ? <Rua /> : null}

        {/* 3 · "QUANDO OS POLICIAIS ME CONFIARAM UMA NOVA MISSÃO" —
               SINPOL, 2022, os 9.751 votos. É o bloco que traz as duas
               fotos da assembleia embutidas no próprio .docx. */}
        {exibir.album ? <Album /> : null}

        {/* A virada, em três tempos, montando a bandeira de Rondônia.
               Fecha a biografia e abre o mandato — não corresponde a um
               bloco do documento, é a dobradiça entre as duas metades. */}
        {exibir.cena ? <CenaBandeira /> : null}

        {/* 4 a 7 · "UMA DAS MAIORES CONQUISTAS: VALORIZAR QUEM PROTEGE",
               "SEGURANÇA PÚBLICA PARA QUEM ESTÁ DO LADO DE FORA DA
               DELEGACIA", as fotos das UNISPS e "QUEM PROTEGE TAMBÉM
               PRECISA SER PROTEGIDO". Os quatro blocos são prestação de
               contas e cabem numa seção só. */}
        {exibir.provas ? <Provas /> : null}

        {/* 8 · "EU LEVEI A EXPERIÊNCIA DA DEAAI PARA O ESPORTE" — é
               exatamente aqui que o documento cola os links de vídeo.
               A seção some sozinha enquanto nenhum tiver endereço. */}
        {exibir.trilha ? <Trilha /> : null}

        {/* 9 a 14 · do esporte à escritura: "ESPORTE QUE SALVA", "MEU
               MANDATO TAMBÉM É SOBRE QUEM NUNCA VESTIU UMA FARDA", a
               Carteira Azul, as crianças, as mulheres e a escritura. */}
        {exibir.valores ? <Valores /> : null}

        {/* 15 · "UM MANDATO QUE CHEGA AO INTERIOR" — os 52 municípios.
               O documento põe o interior aqui, e é uma sorte: é o único
               ponto em que o pedido do grupo nasce do próprio texto em
               vez de interromper. */}
        {exibir.grupos ? <SecaoGrupos municipios={municipios} sugerido={sugerido} /> : null}

        {/* 16 e 17 · "HOJE, EU TENHO NOVOS DESAFIOS" e "POR QUE EU
               QUERO CONTINUAR?" — o bloco dos "ainda existem". No
               documento é o fecho, e agora é o fecho aqui também. */}
        {exibir.problema ? <Problema /> : null}
        {exibir.futuro ? <Futuro /> : null}

        {/* Desligada de fábrica: direito de imagem e jurídico. */}
        {exibir.social ? <ProvaSocial /> : null}

        {exibir.filtro ? <SecaoFiltro /> : null}
        {exibir.compartilhar ? <Compartilhar siteUrl={config.siteUrl} /> : null}

        {/* 18 · "EU SOU RIBEIRO DO SINPOL" — sou policial, sou pai da
               Valentina, sou cristão. A última linha do documento é a
               última linha da página. */}
        <CtaFinal silencio={silencio} />
      </main>

      <RodapeLegal />
      <BotaoFlutuante silencio={silencio} destino={destinoGrupo(exibir)} />

      {/* Dados estruturados: ajuda o Google a entender quem é a pessoa.
          SEO importa pouco aqui (o tráfego vem do Instagram), mas custa
          zero e resolve a busca por nome próprio.

          ⚠️ O `replace` NÃO É ENFEITE, e é o único ponto da página que
          escreve HTML sem passar pelo React. `JSON.stringify` escapa
          aspas, mas NÃO escapa `</script>` — e o navegador fecha a tag
          ao ver essa sequência, esteja ela dentro de uma string JSON ou
          não. Um nome de candidatura com `</script><script>…` gravado no
          painel viraria código executado em toda visita.

          Trocar `<` pelo seu escape unicode resolve na origem: dentro
          de JSON, `\u003c` é lido como `<` e o valor continua correto;
          para o analisador de HTML, a sequência que fecha a tag deixa
          de existir. É a mesma defesa que as bibliotecas seriam
          obrigadas a aplicar — aqui é explícita porque o `dangerously`
          no nome da prop é o aviso de que ninguém mais vai proteger. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: candidato.nome,
            jobTitle: `${g.Candidato} a ${candidato.cargo}`,
            description: meta.descricao,
            url: config.siteUrl,
            sameAs: [candidato.instagram],
            affiliation: { '@type': 'Organization', name: candidato.partidoExtenso },
            homeLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressRegion: candidato.uf,
                addressCountry: 'BR',
              },
            },
          }).replace(/</g, '\\u003c'),
        }}
      />
    </>
  )
}
