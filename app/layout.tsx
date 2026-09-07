import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter } from 'next/font/google'
import { candidato } from '@/content/copy'
import { campanha } from '@/content/campanha'
import { config } from '@/lib/config'
import { lerSlots } from '@/lib/midia/ler'
import { Revelar } from '@/components/ui/Revelar'
import { ConteudoProvider } from '@/lib/conteudo/contexto'
import { lerConteudoCliente } from '@/lib/conteudo/subconjunto'
import { lerConteudo } from '@/lib/conteudo/ler'
import { lerTrafegoPublico } from '@/lib/trafego/ler'
import { Trafego } from '@/components/trafego/Trafego'
import './globals.css'

/**
 * TÍTULO — Bricolage Grotesque, condensada pelo eixo de largura.
 *
 * ⚠️ ERA ARCHIVO, E A TROCA NÃO FOI DE GOSTO. Este projeto é um modelo,
 *    e a página da Sofia Andrade saiu do mesmo tema — mesma cidade,
 *    mesma eleição. Archivo 700 nos títulos era o traço que mais
 *    entregava os dois sites como irmãos. Fonte é metade da impressão
 *    digital de um layout; trocar a família é o que separa as duas
 *    páginas por menos código.
 *
 * ⚠️ DUAS TENTATIVAS FORAM REPROVADAS ANTES DESTA, e ficam
 *    registradas porque as duas tentações vão voltar.
 *
 *    ANTON ("é o que a campanha imprime: condensada pesada"). Tem um
 *    peso só e nenhum contraste de haste. Em corpo de cartaz não lê
 *    como autoridade, lê como TIJOLO — e as contra-formas do "a" e do
 *    "e" fecham. Reprovada na tela, não no papel.
 *
 *    SPACE GROTESK ("moderna e diferentona"). O desenho é bom, mas ela
 *    é LARGA: cada linha da copy quebrava em duas, o bloco de título
 *    crescia para baixo e comia a dobra. Numa primeira dobra o que
 *    manda é quantos caracteres cabem por linha, não o quanto a letra
 *    é bonita isolada.
 *
 * ⚠️ A LARGURA É A VARIÁVEL QUE IMPORTA, e é por isso que esta é a
 *    escolha certa: Bricolage Grotesque é variável em PESO e em
 *    LARGURA. Podemos condensar (`wdth`) até o título caber na coluna
 *    sem baixar o corpo da letra — que é exatamente o problema que
 *    derrubou as outras duas. Cartaz precisa de letra ALTA e ESTREITA,
 *    e essas são duas manoplas independentes aqui.
 *
 *    O `axes` não é opcional: sem pedir 'wdth' explicitamente, o
 *    Google serve só o eixo de peso e o `font-stretch` do CSS não faz
 *    nada — em silêncio, sem erro nenhum.
 *
 *    'opsz' fica de fora de propósito. É mais um eixo para baixar, e o
 *    tamanho óptico automático brigaria com o ajuste manual de largura
 *    que a dobra depende.
 *
 * ⚠️ NÃO TEM ITÁLICO. A `voz-marca`, que é o itálico da marca, é
 *    oblíqua sintética (`font-style: oblique`). Aceitável porque ela
 *    só aparece em corpo grande e em palavra curta.
 *
 *    Não declaramos `weight`: é variável (200–800), e omitir a lista é
 *    o que entrega o eixo inteiro num arquivo só.
 *
 * CORPO — Inter. Público de 35 a 64 anos lendo 18px no celular. Não
 * mudou: o corpo é onde se lê, e ali neutro é qualidade, não falta de
 * personalidade. A personalidade fica toda no título.
 *
 * `display: swap` porque o teto do plano é 3 segundos até o botão
 * principal ficar clicável — texto invisível esperando fonte é o
 * jeito mais barato de estourar esse teto.
 */
const titulo = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--fonte-titulo',
  display: 'swap',
})

const corpo = Inter({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
})

/**
 * Virou `generateMetadata` por causa do ÍCONE.
 *
 * Metadata estática é avaliada no build; o ícone agora vem do painel e
 * pode mudar sem deploy. Tudo o mais aqui continua idêntico — só o
 * bloco `icons` é dinâmico.
 *
 * Sem imagem no espaço, o Next continua servindo o `icon.png` da pasta
 * `app/`, que é a convenção dele. Por isso não há fallback escrito
 * aqui: omitir `icons` é justamente deixar a convenção agir.
 *
 * ⚠️ TÍTULO E DESCRIÇÃO VÊM DO PAINEL, e até agora não vinham. Estes
 *    campos eram lidos direto de `content/copy.ts`, enquanto as
 *    páginas internas (/grupos, /filtro, privacidade) já liam da
 *    edição — então "Busca e compartilhamento" prometia editar a aba
 *    da home e não editava nada. Salvar não dava erro, só não fazia
 *    efeito, que é a pior forma de um painel mentir.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [icone, trafego, conteudo] = await Promise.all([
    lerSlots().then((s) => s['marca.favicon']?.url ?? null),
    lerTrafegoPublico(),
    lerConteudo(),
  ])
  const meta = conteudo.meta

  return {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: meta.titulo,
    template: `%s · ${meta.tituloCurto}`,
  },
  description: meta.descricao,
  keywords: [...meta.palavrasChave],
  authors: [{ name: candidato.nome }],
  creator: candidato.nome,
  publisher: candidato.nome,
  applicationName: meta.tituloCurto,
  category: 'politics',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: config.siteUrl,
    siteName: meta.tituloCurto,
    title: meta.titulo,
    description: meta.descricao,
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.titulo,
    description: meta.descricao,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false, address: false, email: false },
    ...(icone
      ? {
          icons: {
            icon: [{ url: icone, type: 'image/webp' }],
            shortcut: [{ url: icone }],
            apple: [{ url: icone }],
          },
        }
      : {}),
    /* ⚠️ A VERIFICAÇÃO DE DOMÍNIO PRECISA ESTAR NO <head>, e é por
       isso que ela entra pelos metadados e não junto do pixel. É ela
       que dá à campanha o direito de configurar os Eventos Agregados
       de Mensuração — o mecanismo que a Meta criou para o iOS. Sem
       ela, no iPhone só a primeira conversão de cada pessoa é
       atribuída, e o gestor vê o custo por resultado subir sem
       explicação. */
    ...(trafego.metaDominio
      ? { other: { 'facebook-domain-verification': trafego.metaDominio } }
      : {}),
    /* ⚠️ A VERIFICAÇÃO DO GOOGLE SÓ EXISTE SE ALGUÉM A COLOU. Vazio
       significa que a propriedade foi verificada pelo DNS — o caminho
       recomendado — ou que ainda não foi verificada. Nos dois casos o
       certo é não emitir tag nenhuma: uma tag com valor em branco não
       é neutra, é uma verificação falhando em silêncio toda vez que o
       Google revisita o site. Preenchido em Painel ▸ Buscas. */
    ...(meta.verificacaoGoogle
      ? { verification: { google: meta.verificacaoGoogle } }
      : {}),
  }
}

export const viewport: Viewport = {
  /* A cor da barra do navegador no Android. Vem da campanha: uma
     barra azul em cima de um site vermelho é a primeira coisa que
     denuncia um modelo mal trocado. */
  themeColor: campanha.cores.primariaEscura,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default async function LayoutRaiz({ children }: { children: React.ReactNode }) {
  // Só o recorte que a árvore de cliente consome atravessa a fronteira.
  const [conteudoCliente, { aparencia }, trafego] = await Promise.all([
    lerConteudoCliente(),
    lerConteudo(),
    lerTrafegoPublico(),
  ])

  return (
    <html lang="pt-BR" className={`${titulo.variable} ${corpo.variable} sem-js`}>
      {/* A textura é um ATRIBUTO com o tipo, e a força vem numa
          variável de 0 a 1 — dois canais porque são duas perguntas
          diferentes: qual trama, e quanto dela. O CSS combina a força
          com o teto de cada tipo (ver .textura em globals.css).

          Desligada — ou em força zero — o atributo não existe e a
          camada nem chega a ser criada.

          Mora no <body> e não numa seção porque cobre a página inteira,
          incluindo as internas: filtro, grupos e privacidade herdam
          daqui sem precisar saber que ela existe. */}
      <body
        /* ⚠️ AS CORES DA CAMPANHA ENTRAM AQUI, e não no CSS.

           `app/globals.css` declara a paleta padrão em `@theme`, e o
           Tailwind v4 compila toda classe de cor para
           `var(--color-…)`. Redeclarar essas mesmas variáveis num
           `style` inline sobrescreve TODAS elas de uma vez, sem tocar
           em uma única classe de utilitário.

           É o que torna a troca de campanha barata: cinco hex em
           content/campanha.ts e a página inteira muda de partido.
           Quem não quiser cor dinâmica apaga este `style` e edita o
           `@theme` — o site funciona dos dois jeitos.

           Os NOMES SÃO PAPÉIS, não cores: `azul` é a primária,
           `verde` a secundária, `amarelo` a cor de ação. */
        style={
          {
            '--color-azul-escuro': campanha.cores.primariaEscura,
            '--color-azul': campanha.cores.primaria,
            '--color-verde-escuro': campanha.cores.secundariaEscura,
            '--color-verde': campanha.cores.secundaria,
            '--color-amarelo': campanha.cores.acao,
            '--color-azul-noite': campanha.cores.noite,
            '--textura-forca': aparencia.texturaForca / 100,
            // Sem unidade: o CSS da primeira dobra multiplica por
            // `svh`. Mandar já em `svh` daqui prenderia a conta ao
            // JavaScript, e ela pertence à folha de estilo.
            '--hero-profundidade': aparencia.heroProfundidade,
          } as React.CSSProperties
        }
        data-textura={
          aparencia.textura !== 'nenhuma' && aparencia.texturaForca > 0
            ? aparencia.textura
            : undefined
        }
      >
        {/* Pular para o conteúdo: leitor de tela e navegação por teclado */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-amarelo focus:px-6 focus:py-3 focus:font-semibold focus:text-azul-escuro"
        >
          Pular para o conteúdo
        </a>

        <ConteudoProvider valor={conteudoCliente}>{children}</ConteudoProvider>
        <Revelar />
        {/* Só os ids públicos atravessam. O token da Conversions API
            fica no servidor — ver lib/trafego/ler.ts. */}
        <Trafego {...trafego} />
      </body>
    </html>
  )
}
