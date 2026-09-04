/**
 * OS ESPAÇOS DE IMAGEM DA PÁGINA.
 *
 * Um slot é um lugar que aceita imagem, com chave estável. Vive em
 * código, não no banco: um slot só existe se algum componente o
 * renderiza. Adicionar slot é mudança de layout; trocar a imagem do
 * slot é ação do admin.
 *
 * Os requisitos declarados aqui são exatamente o que o painel imprime
 * na tela — "instruções de tamanho e formato" não é texto solto, é
 * este objeto. E agora são também o que o RECORTADOR obedece: a
 * proporção vira a janela de corte e o mínimo vira o tamanho de saída.
 * Por isso toda imagem que sai do painel já nasce válida.
 *
 * A ORDEM DA LISTA É A ORDEM DA PÁGINA. `SLOTS_POR_ONDE` preserva a
 * ordem de inserção, então quem abre o painel percorre os espaços na
 * mesma sequência em que o visitante percorre o site.
 */

import { campanha, g } from './campanha'

/** O rótulo da seção de origem, com o nome de quem está na página. */
const ONDE_ORIGEM = `Quem é ${campanha.primeiroNome}`

export interface Slot {
  chave: string
  rotulo: string
  onde: string
  /** Proporção esperada. `null` = livre (recorte sem fundo, print). */
  proporcao: string | null
  larguraMin: number
  alturaMin: number
  /** Exige canal alpha — foto recortada, logo, moldura. */
  alpha?: boolean
  /** Dimensão EXATA, não mínima. Só molduras. */
  exata?: boolean
  balde?: 'midia' | 'molduras'
  nota?: string
  /** Arquivo em /public usado enquanto o slot não tem imagem. */
  padrao?: string
}

export const SLOTS: Slot[] = [
  // ── Marca ──────────────────────────────────────────────────────
  // O símbolo e o ícone do navegador. Ficam PRIMEIRO na lista porque
  // são os únicos espaços que aparecem em toda página do site, e não
  // numa seção só.
  {
    chave: 'marca.simbolo',
    rotulo: 'Símbolo da marca',
    onde: 'Marca',
    proporcao: null,
    larguraMin: 256,
    alturaMin: 190,
    alpha: true,
    nota: 'O ícone ao lado do nome, no topo de toda página. PNG com fundo transparente — ele fica sobre o azul e sobre o branco. Sem imagem aqui, o site usa o símbolo desenhado em código, que nunca corta.',
  },
  {
    chave: 'marca.favicon',
    rotulo: 'Ícone do navegador',
    onde: 'Marca',
    proporcao: '1/1',
    larguraMin: 512,
    alturaMin: 512,
    nota: 'Quadrado. É o ícone da aba do navegador e o do atalho na tela inicial do celular. Desenho simples: ele será visto com 16 pixels de lado.',
  },
  // ⚠️ A PROPORÇÃO NÃO É 16:9, e quem chega com uma arte de story ou
  //    de post vai estranhar. 1200×630 é o formato que o WhatsApp, o
  //    Facebook e o Telegram recortam para mostrar; mandar 16:9 faz o
  //    aplicativo aparar por conta própria, quase sempre cortando
  //    justamente o número. O recortador do painel resolve isso: ele
  //    abre a imagem nesta janela e deixa escolher o que fica.
  {
    chave: 'marca.cartaoLink',
    rotulo: 'Cartão do link (WhatsApp)',
    onde: 'Marca',
    proporcao: '1200/630',
    larguraMin: 1200,
    alturaMin: 630,
    nota: 'A imagem que aparece quando alguém cola o link do site no WhatsApp, no Facebook ou no Telegram. Deitada, com o rosto e o número no meio — as bordas são aparadas em telas pequenas. Sem imagem aqui, o site desenha o cartão sozinho, com o nome e o número. O WhatsApp guarda o cartão de um link por semanas: trocar aqui não muda os links já enviados.',
  },

  {
    chave: 'marca.logotipo',
    rotulo: 'Logotipo deitado (branco)',
    onde: 'Marca',
    proporcao: null,
    larguraMin: 900,
    alturaMin: 145,
    alpha: true,
    nota: 'A marca da campanha em faixa, com o nome escrito em BRANCO e fundo transparente. Aparece no rodapé, que é escuro. Sem imagem aqui, o site escreve o nome e o cargo na fonte de título — funciona, e é o estado normal enquanto a arte não chega.',
  },
  {
    /**
     * ⚠️ O NÚMERO SOZINHO, NA TIPOGRAFIA DA CAMPANHA.
     *
     *    `components/ui/Marca.tsx` já sabia receber uma imagem aqui —
     *    o `Numero` tem o parâmetro `url` desde sempre —, mas ninguém
     *    alimentava, então a chamada final desenhava "25197" com a
     *    fonte de título do site. Fica parecido e não é: o número da
     *    urna é a coisa que a campanha mais repete em adesivo, santinho
     *    e camiseta, e é o que a pessoa procura na tela da urna. Ele
     *    tem de ser sempre o MESMO desenho.
     *
     *    A arte que a campanha entregou não trazia o número solto: ele
     *    só existia dentro do adesivo de bolso. Este PNG saiu de lá.
     */
    chave: 'marca.numero',
    rotulo: 'O número, na arte oficial',
    onde: 'Marca',
    proporcao: null,
    larguraMin: 600,
    alturaMin: 160,
    alpha: true,
    nota: 'Só os algarismos, PNG com fundo transparente, na fonte da campanha. Sem esta imagem o site escreve o número na fonte de título — parecido, mas não é a marca.',
  },

  {
    chave: 'marca.lockup',
    rotulo: 'Marca com o número (em pé)',
    onde: 'Marca',
    proporcao: null,
    larguraMin: 700,
    alturaMin: 500,
    alpha: true,
    nota: 'O bloco da arte de capa: nome em cima, número embaixo. Aparece na primeira dobra, no CELULAR. Fundo transparente e nome em branco — ele fica sobre a cor cheia. Sem imagem aqui, o site desenha o mesmo bloco com o nome e o número.',
  },
  {
    chave: 'marca.lockupDeitado',
    rotulo: 'Marca com o número (deitada)',
    onde: 'Marca',
    proporcao: null,
    larguraMin: 1400,
    alturaMin: 227,
    alpha: true,
    nota: 'A mesma coisa em faixa 6:1 — nome à esquerda, número à direita. É a versão do DESKTOP, sobreposta às figuras da primeira dobra. Sem imagem aqui, o site desenha a faixa.',
  },

  // ── Primeira dobra ─────────────────────────────────────────────
  {
    chave: 'hero.retrato',
    rotulo: `Foto ${g.do} ${campanha.primeiroNome}`,
    onde: 'Primeira dobra',
    proporcao: null,
    larguraMin: 1200,
    alturaMin: 1500,
    alpha: true,
    nota: 'PNG recortado, sem fundo. É a única imagem em que o recorte importa: ela fica sobre o azul. O recortador aqui só enquadra — quem tira o fundo é o editor de imagem, antes.',
  },

  // ⚠️ `hero.apoio` FOI REMOVIDO nesta campanha. Era a segunda figura
  //    da primeira dobra — o padrinho político. O Ribeiro não tem uma,
  //    e o espaço exigia autorização de imagem de terceiro que nunca
  //    seria pedida. Um cartão de envio no painel que ninguém vai usar
  //    é um convite a subir a foto errada ali.
  //    `Hero.tsx` já renderiza a segunda figura só quando existe, então
  //    remover o espaço não muda um pixel da dobra.

  // ── Quem é (origem) ────────────────────────────────────────────
  {
    chave: 'origem.retrato',
    rotulo: 'Retrato',
    onde: ONDE_ORIGEM,
    proporcao: '4/5',
    larguraMin: 1000,
    alturaMin: 1250,
    nota: 'Vertical. A foto do espetinho com a bandeira é a indicada: é a história de origem numa imagem.',
  },
  {
    chave: 'origem.detalhe.1',
    rotulo: 'Detalhe 1',
    onde: ONDE_ORIGEM,
    proporcao: '1/1',
    larguraMin: 800,
    alturaMin: 800,
    nota: 'A cozinha de Iata — filtro de barro e parede de tábua. Prova "a luz acabava às nove" sem legenda.',
  },
  {
    chave: 'origem.detalhe.2',
    rotulo: 'Detalhe 2',
    onde: ONDE_ORIGEM,
    proporcao: '1/1',
    larguraMin: 800,
    alturaMin: 800,
    nota: 'A selfie na churrasqueira. O rosto e o ofício no mesmo quadro.',
  },

  // ── O álbum ────────────────────────────────────────────────────
  // ⚠️ DEITADO (3:2), E NÃO EM PÉ. Nasceu 3:4 porque servia a um acervo
  //    de família analógico — foto de papel é quase sempre em pé. Nesta
  //    campanha o bloco é outro: a assembleia do SINPOL de 2022, e as
  //    fotos que existem dela são horizontais de sala cheia (1440×959,
  //    que é 3:2 exato). Em 3:4 elas perdiam METADE da largura, e numa
  //    foto de setenta pessoas em fileira isso não é recorte, é
  //    apagar gente.
  //
  //    O mínimo continua baixo: é registro de celular em assembleia,
  //    não ensaio.
  //    São QUATRO, e não oito: o bloco conta um capítulo só (a
  //    assembleia de 2022), tem duas fotos, e quatro é folga
  //    suficiente para o que a campanha ainda achar no arquivo do
  //    sindicato. Oito cartões vazios no painel só escondem os cheios.
  ...Array.from({ length: 4 }, (_, i) => ({
    chave: `album.${i + 1}`,
    rotulo: `Foto ${i + 1}`,
    onde: 'O álbum',
    proporcao: '3/2',
    larguraMin: 900,
    alturaMin: 600,
    nota:
      i === 0
        ? 'Fotos horizontais, de sala cheia. Endireite antes de subir — registro de celular costuma vir torto.'
        : undefined,
  })),

  // ── A rua ──────────────────────────────────────────────────────
  // ⚠️ EM PÉ (3:4), E ISSO ACERTA UMA CONTRADIÇÃO ANTIGA: os três
  //    espaços eram declarados 4:3 DEITADO, mas a grade de `Rua.tsx`
  //    dá à primeira foto um `md:row-span-2` — uma caixa ALTA. Com
  //    `object-cover`, uma foto deitada ali era cortada nas laterais
  //    pelo CSS, sem que nada avisasse. O que o espaço prometia e o
  //    que o layout desenhava eram coisas diferentes.
  //
  //    Agora os três são em pé, que é o formato das fotos da Polícia
  //    Civil que a campanha tem — a continência em formatura é 768×1024,
  //    3:4 exato, e entra sem perder um pixel.
  {
    chave: 'rua.1',
    rotulo: 'Foto 1 — a mais forte',
    onde: 'A rua',
    proporcao: '3/4',
    larguraMin: 700,
    alturaMin: 930,
    nota: 'Ocupa a coluna alta, à esquerda. É a prova visual da manchete da página.',
  },
  {
    chave: 'rua.2',
    rotulo: 'Foto 2',
    onde: 'A rua',
    proporcao: '3/4',
    larguraMin: 700,
    alturaMin: 930,
    nota: 'A bandeira na pista, todos de máscara. Data a cena na pandemia sem precisar escrever a data.',
  },
  {
    chave: 'rua.3',
    rotulo: 'Foto 3',
    onde: 'A rua',
    proporcao: '3/4',
    larguraMin: 700,
    alturaMin: 930,
    nota: '⚠️ Confira a marca d’água: as melhores fotos da rua são de terceiros e precisam de autorização.',
  },

  // ── Minhas bandeiras ───────────────────────────────────────────
  {
    chave: 'valores.imagem',
    rotulo: 'Foto de apoio',
    onde: 'Minhas bandeiras',
    // ⚠️ DEITADO, e é o que a caixa sempre pediu: a figura desta seção
    //    é uma grade `[0.9fr_1.1fr]` com `min-h-26rem`, ou seja, uma
    //    janela mais larga que alta. Declarar 3:4 aqui obrigava o
    //    `object-cover` a comer as laterais de toda foto aceita.
    proporcao: '4/3',
    larguraMin: 1000,
    alturaMin: 750,
    nota: '⚠️ Decisão de campanha. Foto com arma pesa em classificador de rede social e o custo cai no alcance orgânico — que é o motor desta página. A camiseta PRO ARMAS entrega o mesmo posicionamento sem o risco.',
  },

  // ── O que já foi feito ─────────────────────────────────────────
  // Os três espaços de foto de entrega saíram. As entregas são LEIS, e
  // não existe foto de uma lei — foto ilustrativa ao lado de "Lei
  // 3.285/2025" enfraquece o único bloco documental da página. No lugar
  // entra o registro público, que é o que o documento de campanha pede.
  {
    chave: 'provas.documento',
    rotulo: 'Print do registro público',
    onde: 'O que já foi feito',
    proporcao: null,
    larguraMin: 900,
    alturaMin: 500,
    nota: 'Captura de tela do registro público (SAPL, portal da Câmara, Diário Oficial) com o que foi aprovado. É prova documental: separa mandato de influencer. Fica clicável para o portal oficial.',
  },

  // ⚠️ OS 8 ESPAÇOS DE PROVA SOCIAL FORAM REMOVIDOS nesta campanha.
  //    Eram seis prints de comentário e dois de ataque. A seção nasce
  //    desligada (`exibir.social: false`) por dois motivos que não se
  //    resolvem com trabalho: print de comentário de terceiro exige
  //    autorização de uso de imagem de cada pessoa, e o par de ataques
  //    exige o jurídico assinando embaixo. Nenhuma das duas coisas
  //    existe, e nenhuma está encaminhada.
  //
  //    Enquanto os espaços ficavam declarados, o painel mostrava oito
  //    cartões de envio para uma seção que não vai ao ar — e a tela
  //    Início contava oito pendências que não eram pendências.
  //    A copy de `social` continua em content/copy.ts: se um dia o
  //    jurídico liberar, é só devolver os espaços aqui.

  // ── A faixa das bandeiras ──────────────────────────────────────
  // ⚠️ ESPAÇOS NOVOS, criados a partir das FOTOS e não da vontade de
  //    ter mais um bloco. A seção das bandeiras cobre seis temas do
  //    documento — esporte, criança, mulher, escritura, polícia — e
  //    tinha uma única imagem, a que fecha a seção. Sobravam duas
  //    fotos que pertencem a esses temas e não cabiam em nenhum
  //    espaço existente: a academia de jiu-jitsu e o apoio à
  //    exposição de arte.
  //
  //    3:4 EM PÉ porque é o formato exato das duas (1536×2048). O
  //    caminho contrário — declarar 4:3 e deixar o object-cover
  //    resolver — é o erro que esta campanha já cometeu duas vezes.
  //    São TRÊS, e a primeira é DEITADA enquanto as outras duas são
  //    EM PÉ. Não é descuido de padronização: é o formato real das
  //    fotos que a campanha tem para estes temas — o ginásio dos Jogos
  //    dos Rondonienses é 2048×1536 (4:3), a academia de jiu-jitsu e o
  //    apoio à exposição são 1536×2048 (3:4). Uniformizar os três num
  //    formato só obrigaria a cortar 44% de duas delas.
  //
  //    O componente compõe em duas fileiras — a deitada inteira em
  //    cima, as duas em pé embaixo — e nenhuma das três perde um pixel.
  {
    chave: 'valores.faixa.1',
    rotulo: 'Foto 1 da faixa (deitada)',
    onde: 'Minhas bandeiras',
    proporcao: '4/3',
    larguraMin: 1000,
    alturaMin: 750,
    nota: 'A bandeira acontecendo, em foto larga: o ginásio cheio, o evento, a quadra. Ocupa a fileira inteira. Sem foto aqui a faixa some e a seção fica como sempre esteve.',
  },
  ...Array.from({ length: 2 }, (_, i) => ({
    chave: `valores.faixa.${i + 2}`,
    rotulo: `Foto ${i + 2} da faixa (em pé)`,
    onde: 'Minhas bandeiras',
    proporcao: '3/4',
    larguraMin: 700,
    alturaMin: 930,
    nota: undefined,
  })),

  // ⚠️ NÃO CRIE ESPAÇO DE FOTO EM "O QUE JÁ FOI FEITO".
  //    Cheguei a criar um e desfiz: `Provas.tsx` registra, por
  //    extenso, que os cartões já tiveram foto e a perderam de
  //    propósito — cada cartão é uma LEI, não existe foto de uma lei,
  //    e foto ilustrativa enfraquece o único bloco DOCUMENTAL da
  //    página, que é justamente o que separa mandato de palanque.
  //    A prova ali é o número e o registro público, não a imagem.

  // ── Os grupos por município ────────────────────────────────────
  {
    chave: 'grupos.imagem',
    rotulo: 'Foto do interior',
    onde: 'Grupos de WhatsApp',
    proporcao: '4/3',
    larguraMin: 1000,
    alturaMin: 750,
    nota: 'O mandato chegando no interior — visita, entrega, agenda em município pequeno. É o que dá lastro ao "meu mandato é para os 52 municípios" logo acima do buscador de grupo.',
  },

  // ── Chamada final ──────────────────────────────────────────────
  {
    chave: 'cta.retrato',
    rotulo: 'Retrato de fechamento',
    onde: 'Chamada final',
    proporcao: '4/5',
    larguraMin: 1000,
    alturaMin: 1250,
    nota: 'Olhando para a câmera, luz natural. É a última imagem da página — o rosto que fica associado ao número.',
  },

  // ── Gerador de filtro ──────────────────────────────────────────
  {
    chave: 'moldura.story',
    rotulo: 'Moldura de story',
    onde: 'Gerador de filtro',
    proporcao: '9/16',
    larguraMin: 1080,
    alturaMin: 1920,
    alpha: true,
    exata: true,
    balde: 'molduras',
    nota: 'PNG 1080×1920 com transparência no miolo. ⚠️ Exigência legal: o CNPJ da campanha precisa estar legível na arte.',
    padrao: '/molduras/story-apoio.svg',
  },
  {
    chave: 'moldura.perfil',
    rotulo: 'Moldura de perfil',
    onde: 'Gerador de filtro',
    proporcao: '1/1',
    larguraMin: 1080,
    alturaMin: 1080,
    alpha: true,
    exata: true,
    balde: 'molduras',
    nota: 'PNG 1080×1080 com transparência no miolo. ⚠️ CNPJ obrigatório na arte.',
    padrao: '/molduras/perfil-apoio.svg',
  },

  // ── Os apoiadores de exemplo ───────────────────────────────────
  // As fotos que giram DENTRO das duas molduras, na seção do site que
  // convida a usar o filtro. Substituem a silhueta cinza desenhada em
  // código — que mostra onde a foto entra, mas não mostra o resultado.
  //
  // ⚠️ SÃO PARES, E O PAR É A UNIDADE. Cada apoiador tem as duas fotos,
  //    story e perfil, e as duas molduras trocam JUNTAS: quem olha vê a
  //    mesma pessoa nos dois formatos, que é o que faz o exemplo
  //    funcionar como exemplo. Par incompleto simplesmente não entra na
  //    roda — ver `resolverExemplos` em lib/molduras.ts. Não é um
  //    erro a corrigir: é o que permite subir o apoiador 1 hoje e o 2
  //    na semana que vem sem a seção quebrar no meio do caminho.
  //
  // ⚠️ MÍNIMOS BAIXOS DE PROPÓSITO. Estas fotos aparecem com menos de
  //    300px de largura na tela, e a origem delas é o rolo da câmera de
  //    um apoiador — muitas chegam por WhatsApp, já comprimidas. Exigir
  //    1080 aqui barraria exatamente o material que a seção quer.
  //
  // ⚠️ SÃO TRÊS PARES, E ERAM SEIS. A vitrine gira entre os apoiadores
  //    que existirem, e três já bastam para ela deixar de parecer
  //    parada. Seis pares eram DOZE cartões de envio no painel para um
  //    material que ainda não existe — e cartão vazio demais é o que
  //    faz o coordenador parar de olhar a tela de Imagens, que é
  //    justamente onde ele precisa olhar.
  //
  // ⚠️ ESTE NÚMERO TEM DOIS DONOS: `MAXIMO_DE_EXEMPLOS`, em
  //    `lib/molduras.ts`, varre de 1 até ele procurando pares. Se os
  //    dois divergirem, o excedente vira espaço que o painel oferece e
  //    o site nunca lê — ou pior, par que existe no banco e não
  //    aparece. Mudar aqui é mudar lá.
  ...Array.from({ length: 3 }, (_, i) => [
    {
      chave: `filtro.exemplo.${i + 1}.story`,
      rotulo: `Apoiador ${i + 1} · story`,
      onde: 'Gerador de filtro',
      proporcao: '9/16',
      larguraMin: 540,
      alturaMin: 960,
      nota:
        i === 0
          ? 'De três a seis apoiadores, cada um com as DUAS fotos. Rosto no terço de cima: a moldura escurece a metade de baixo. Peça autorização antes de subir a foto de alguém.'
          : undefined,
    },
    {
      chave: `filtro.exemplo.${i + 1}.perfil`,
      rotulo: `Apoiador ${i + 1} · perfil`,
      onde: 'Gerador de filtro',
      proporcao: '1/1',
      larguraMin: 540,
      alturaMin: 540,
      nota:
        i === 0
          ? 'A mesma pessoa da foto de story ao lado, enquadrada em quadrado. Sem as duas, o apoiador não entra na roda.'
          : undefined,
    },
  ]).flat(),
]

export const SLOTS_POR_CHAVE: Record<string, Slot> = Object.fromEntries(
  SLOTS.map((s) => [s.chave, s]),
)

/**
 * DE QUAL SEÇÃO DO PAINEL CADA ESPAÇO FAZ PARTE.
 *
 * O painel deixou de ser organizado por TIPO (uma aba de textos, outra
 * de imagens) e passou a ser organizado por SEÇÃO — porque é assim que
 * quem edita pensa: "quero mexer em Quem é <nome>", e não "quero mexer
 * numa imagem". Para juntar texto, imagem e vídeo na mesma tela, cada
 * espaço precisa dizer a que seção pertence.
 *
 * ⚠️ POR PREFIXO, e não um campo em cada objeto. A chave do espaço já
 *    carrega a informação (`origem.retrato` é de `origem`), e repetir
 *    isso 25 vezes seria 25 oportunidades de divergir. As três exceções
 *    estão declaradas primeiro, pela chave inteira: a marca e o ícone
 *    não pertencem a nenhuma seção da página — aparecem em todas — e
 *    por isso moram nas telas de Identidade.
 */
const SECAO_DO_ESPACO: Record<string, string> = {
  'marca.simbolo': 'candidato',
  'marca.favicon': 'meta',
  'marca.cartaoLink': 'meta',
  hero: 'hero',
  origem: 'origem',
  album: 'album',
  rua: 'rua',
  valores: 'valores',
  provas: 'provas',
  social: 'social',
  cta: 'ctaFinal',
  moldura: 'filtro',
  filtro: 'filtro',
}

export function secaoDoEspaco(chave: string): string | null {
  return SECAO_DO_ESPACO[chave] ?? SECAO_DO_ESPACO[chave.split('.')[0]] ?? null
}

/** Agrupados pela seção do painel a que pertencem. */
export const SLOTS_POR_SECAO = SLOTS.reduce<Record<string, Slot[]>>((acc, s) => {
  const secao = secaoDoEspaco(s.chave)
  if (secao) (acc[secao] ??= []).push(s)
  return acc
}, {})

/** Agrupados por seção da página, para a galeria do painel. */
export const SLOTS_POR_ONDE = SLOTS.reduce<Record<string, Slot[]>>((acc, s) => {
  ;(acc[s.onde] ??= []).push(s)
  return acc
}, {})

/**
 * O tamanho que o recortador deve produzir para um slot.
 *
 * Regra: nunca abaixo do mínimo (senão o servidor recusa) e nunca
 * acima de 2400 (o servidor reduz para lá de qualquer jeito, e subir
 * pixel que será jogado fora só custa dados do celular de quem edita).
 * Entre os dois, manda a resolução real da área escolhida.
 */
export const TETO_RECORTE = 2400

export function tamanhoDeSaida(
  slot: Slot,
  larguraDaArea: number,
  alturaDaArea: number,
): { largura: number; altura: number; ampliando: boolean } {
  if (slot.exata) {
    return {
      largura: slot.larguraMin,
      altura: slot.alturaMin,
      ampliando: larguraDaArea < slot.larguraMin,
    }
  }

  const escalaMinima = Math.max(
    slot.larguraMin / larguraDaArea,
    slot.alturaMin / alturaDaArea,
    // Área menor que o mínimo: amplia até caber. Ampliar é ruim, e a
    // tela avisa — mas é melhor que barrar a única foto que existe.
  )
  const escalaTeto = TETO_RECORTE / Math.max(larguraDaArea, alturaDaArea)
  const escala = escalaMinima > 1 ? escalaMinima : Math.min(1, escalaTeto)

  return {
    largura: Math.max(slot.larguraMin, Math.round(larguraDaArea * escala)),
    altura: Math.max(slot.alturaMin, Math.round(alturaDaArea * escala)),
    ampliando: escalaMinima > 1,
  }
}
