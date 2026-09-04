/**
 * COPY DA CAMPANHA — o texto de fábrica, num arquivo só.
 *
 * Tudo que é texto vive aqui. Nenhum componente escreve frase solta.
 * É o que este projeto chama de separar "motor" de "maquiagem": o
 * motor (`lib/`, `app/painel/`, `app/g/`) se repete em qualquer
 * campanha; a maquiagem é este arquivo, `content/campanha.ts` e as
 * cinco cores.
 *
 * ⚠️ ISTO É O ESTADO INICIAL, NÃO O SITE NO AR
 *    O banco guarda só o que a campanha editou, e `lib/conteudo`
 *    mescla um sobre o outro. Com o banco vazio, o site é exatamente
 *    o que está escrito aqui. Ao apagar a linha de uma seção no
 *    banco, ela volta para cá. Por isso nada disto é semeado por
 *    migration: semear congelaria a copy no dia do deploy.
 *
 * ⚠️ TEXTO DE FÁBRICA NÃO SE PUBLICA
 *    Todo bloco abaixo marcado com  // ✍️ ESCREVER  está com texto
 *    genérico, escrito para o site ficar de pé e mostrar a forma — não
 *    para ir ao ar. O painel sabe disso: a tela Início lista quais
 *    seções ainda estão no texto de fábrica, comparando o banco com
 *    este arquivo. Publicar com a lista cheia é publicar um modelo.
 *
 * ⚠️ SOBRE OS CAMPOS `id`
 *    Toda lista de OBJETO carrega um `id` estável. Não é enfeite: as
 *    chaves de React vinham do próprio conteúdo (`key={item.numero}`),
 *    e no dia em que alguém digitar "01" duas vezes no painel o React
 *    embaralha ou some com itens. O `id` nunca é exibido.
 *
 *    Listas de STRING não têm `id` de propósito — string não tem
 *    identidade, e ali a chave por índice é a correta.
 */

import { campanha, g, nomeComNumero, REGIAO } from './campanha'

/**
 * O vídeo vazio.
 *
 * Todo espaço de vídeo nasce sem endereço, e um espaço sem endereço
 * não desenha nada — nem moldura, nem "em breve". A campanha cola o
 * link no painel e o bloco aparece. Enquanto não colar, a seção fica
 * exatamente como se o vídeo não existisse no desenho.
 */
/**
 * A raiz pública do balde de vídeo.
 *
 * ⚠️ NÃO É O MESMO BALDE DAS IMAGENS. `midia` aceita só image/* e tem
 *    teto de 10 MB; estes arquivos são MP4 de 9 a 24 MB. Separar
 *    também é o que permite, no dia em que a banda de vídeo estourar a
 *    cota do plano, desligar SÓ o vídeo sem derrubar junto todas as
 *    fotos do site.
 */
const STORAGE_VIDEO =
  'https://malsmardybvuxvgarhgg.supabase.co/storage/v1/object/public/videos'

/**
 * ⚠️ OS QUATRO ARQUIVOS JÁ FORAM RECOMPRIMIDOS — não reencode de novo.
 *
 *    Vieram do Instagram já compactados (H.264, 720p, 0,9 a 1,5 Mbps).
 *    Foram passados uma vez em x264 CRF 27, `preset slow`, com o áudio
 *    COPIADO (nada de reencodar fala de 60 kbps). Resultado medido:
 *    61 MB → 52 MB, com SSIM de 0,985 a 0,990 contra o original.
 *
 *    Testei CRF 24 antes: o arquivo ficou MAIOR que o original. Fonte
 *    já eficiente não melhora com bitrate maior — só engorda. E cada
 *    passada nova é uma geração de perda sobre a anterior, então a
 *    próxima "compressão" custaria qualidade visível para economizar
 *    pouco. Se um dia precisar de menos peso, o caminho é resolução,
 *    não bitrate — mas veja a nota abaixo antes.
 *
 * ⚠️ NÃO REDUZA A RESOLUÇÃO ACHANDO QUE 720p É EXAGERO. O vídeo em pé
 *    é desenhado com teto de altura `min(74svh, 34rem)`, ou seja no
 *    máximo 544 px de altura e 306 px de largura. Numa tela retina de
 *    2x isso já pede 612 px, e o arquivo tem 720. Não sobra tanto
 *    quanto parece.
 *
 * ⚠️ TODOS COM `-movflags +faststart`, e isso consertou um defeito
 *    real: o DPHF4xzABP2 vinha com o índice (`moov`) no FIM do
 *    arquivo, o que obriga o navegador a baixar os 9 MB inteiros antes
 *    de mostrar o primeiro quadro. Agora os quatro começam a tocar
 *    enquanto baixam.
 */

const VIDEO = {
  titulo: '',
  url: '',
  formato: 'deitado',
  opcoes: {
    controles: true,
    inicio: 'clique',
    telaCheia: true,
    carregamento: 'ao-clicar',
    botaoRotulo: '',
    botaoDestino: '',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// QUEM É — espelha content/campanha.ts.
//
// Existe como seção de conteúdo (e não só como import) porque o
// painel edita estes campos: trocar o handle do Instagram em campanha
// não pode exigir deploy. `content/campanha.ts` é o valor inicial.
// ═══════════════════════════════════════════════════════════════
export const candidato = {
  nome: campanha.nome,
  numero: campanha.numero,
  cargo: campanha.cargo,
  estado: campanha.estado,
  uf: campanha.uf,
  partido: campanha.partido,
  partidoExtenso: campanha.partidoExtenso,
  instagram: campanha.instagram,
  instagramHandle: campanha.instagramHandle,
  whatsapp: campanha.whatsapp,
} as const

export const meta = {
  titulo: `${nomeComNumero} — ${campanha.cargo} por ${campanha.estado}`,
  tituloCurto: nomeComNumero,
  descricao:
    `${campanha.nome}, ${campanha.numero}, ${g.candidato} a ${campanha.cargo} por ` +
    `${campanha.estado} pelo ${campanha.partido}. Policial civil e ex-presidente do ` +
    'SINPOL. Entre no grupo de WhatsApp da campanha.',
  palavrasChave: [
    campanha.nome,
    nomeComNumero,
    campanha.numero,
    `${campanha.cargo} ${campanha.estado}`,
    `${campanha.partido} ${campanha.uf}`,
    `eleições ${campanha.eleicao.ano} ${campanha.estado}`,
  ],
  og: {
    titulo: `${campanha.nome.toUpperCase()} · ${campanha.numero}`,
    subtitulo: `${campanha.cargo} por ${campanha.estado}`,
    chamada: 'Quem já protegeu na rua sabe o que falta na lei.',
  },
  /**
   * O código do Google Search Console.
   *
   * ⚠️ VAZIO É O ESTADO NORMAL. Ele só é preenchido se a verificação
   *    de propriedade for feita pela meta tag; quem verificar pelo DNS
   *    (o caminho recomendado, porque vale para o domínio inteiro e
   *    não se perde numa republicação) deixa isto em branco para
   *    sempre — e o site não emite tag nenhuma.
   *
   * Não é segredo: a tag fica visível no HTML de qualquer visitante.
   * Ela não dá acesso a nada — só prova ao Google que quem a colocou
   * ali manda no site. Preenchido em Painel ▸ Buscas.
   */
  verificacaoGoogle: '',
} as const

/**
 * Metadata por página. Fica aqui, e não hardcoded em cada
 * `export const metadata`, porque mudar o título de uma aba não pode
 * custar um deploy.
 */
export const paginas = {
  filtro: {
    tituloAba: `Coloque o ${campanha.numero} na sua foto`,
    descricao:
      'Gere sua foto de perfil e seu story com a moldura da campanha. ' +
      'Sem cadastro. Sua foto não sai do seu aparelho.',
    ogTitulo: `Coloque o ${campanha.numero} na sua foto · ${campanha.nome}`,
    ogDescricao: 'Sem cadastro. Sua foto não sai do seu aparelho.',
  },
  grupos: {
    tituloAba: 'Grupo de WhatsApp da campanha',
    descricao:
      'Entre no grupo de WhatsApp da campanha do Ribeiro do Sinpol e acompanhe agenda, ' +
      'visita e o que estiver acontecendo em Rondônia.',
    ogTitulo: `Grupo de WhatsApp · ${nomeComNumero}`,
    ogDescricao: 'Um grupo, para Rondônia inteira.',
  },
  privacidade: {
    tituloAba: 'Política de Privacidade',
    descricao:
      'Como esta página trata (e não trata) seus dados: a foto do filtro não sai do seu aparelho ' +
      'e a localização é usada no aparelho e descartada.',
    ogTitulo: `Política de Privacidade · ${nomeComNumero}`,
    ogDescricao: 'A foto do filtro não sai do seu aparelho.',
  },
} as const

// Objeto, e não array solto: toda seção do CMS precisa ser objeto
// (a constraint `jsonb_typeof(dados) = 'object'` existe para impedir
// que uma ação forjada grave um tipo inesperado).
export const navegacao = {
  itens: [
    { id: 'nav-01', rotulo: `Quem é ${campanha.primeiroNome}`, href: '/#origem' },
    { id: 'nav-02', rotulo: 'Compromissos', href: '/#futuro' },
    { id: 'nav-03', rotulo: 'Grupo de WhatsApp', href: '/#grupos' },
    { id: 'nav-04', rotulo: `Coloque o ${campanha.numero}`, href: '/filtro' },
  ],
} as const

export const ctas = {
  // ⚠️ "da minha cidade" SAIU DE TODO LUGAR. A campanha tem UM grupo,
  //    e prometer o grupo da cidade de quem lê é prometer uma coisa que
  //    não existe — a pessoa entra esperando vizinho e encontra o
  //    estado inteiro. Ver `grupoUnico` em content/campanha.ts.
  grupo: 'Entrar no grupo da campanha',
  grupoCurto: 'Entrar no grupo',
  filtro: `Colocar o ${campanha.numero} na minha foto`,
  filtroCurto: `Colocar o ${campanha.numero}`,
  compartilhar: 'Compartilhar esta página',
  instagram: 'Seguir no Instagram',
  // Texto exibido no lugar dos CTAs a partir do silêncio eleitoral.
  silencio:
    'Período de silêncio eleitoral. Os canais de campanha estão suspensos até o fim da votação.',
} as const

// ─────────────────────────────────────────────────────────────
// 1. HERO — a primeira dobra
//
// É a única seção que TODO visitante vê. O título é uma frase de duas
// linhas: a segunda vem entre [[colchetes duplos]] e sai realçada na
// cor de ação.
//
// Regra que vale para toda a página: a frase é de quem fala, na
// primeira pessoa. "Eu fiz", não "ele fez".
//
// A manchete é a frase que o próprio Ribeiro usa para se apresentar, e
// ela é a espinha da página: a seção "A rua" prova a primeira metade
// (vinte anos de Polícia Civil) e a seção "O que eu fiz" prova a
// segunda (o realinhamento da carreira, virado em lei). Trocar esta
// frase sem trocar aquelas duas seções deixa a página afirmando o que
// ela não mostra.
// ─────────────────────────────────────────────────────────────
export const hero = {
  etiqueta: `${g.Candidato} a ${campanha.cargo}`,
  titulo: ['Quem já protegeu na rua', '[[sabe o que falta na lei.]]'],
  subtitulo:
    'Sou José Ribeiro Pinto Filho, mas Rondônia me conhece como Ribeiro do Sinpol. Nasci em ' +
    'Porto Velho, entrei para a Polícia Civil em 2001, presidi o SINPOL/RO e hoje sou deputado ' +
    'estadual. Eu não li sobre segurança pública: eu vivi a segurança pública.',
  numeroLegenda: `Escreva ${campanha.numero} na urna`,
  /**
   * A assinatura da arte oficial, abaixo do número. Apagar aqui tira
   * ela da página — não quebra nada.
   */
  lema: 'Conhece e entrega.',
  ctaPrimario: ctas.grupo,
  ctaSecundario: 'Conhecer minha história',
  ctaSecundarioHref: '#origem',
  rodapeHero: `${campanha.cargo} por ${campanha.estado}. Policial civil.`,
} as const

// ─────────────────────────────────────────────────────────────
// 2. ORIGEM — de onde veio
//
// É a seção que faz a página não ser um santinho. Quatro parágrafos,
// primeira pessoa, fatos concretos: lugar, idade, ofício, a virada.
// Nada de adjetivo sobre si.
//
// A ordem aqui é a do documento da campanha e é cronológica: o
// nascimento, a perda da mãe, os ofícios, a entrada na Polícia Civil.
// O quarto parágrafo entrega a página para a seção "A rua", que conta
// o que veio depois de 2001 — por isso ele para justamente ali.
// ─────────────────────────────────────────────────────────────
export const origem = {
  etiqueta: 'De onde eu vim',
  titulo: 'Eu aprendi o valor do trabalho [[antes de aprender política.]]',
  paragrafos: [
    'Nasci em Porto Velho, no dia 30 de agosto de 1978, na Maternidade Darcy Vargas. Sou filho ' +
      'desta terra: foi aqui que cresci, trabalhei, construí minha família e passei a maior ' +
      'parte da minha vida.',
    'Ainda jovem, perdi minha mãe, Maria José da Silva Pinto. Meu pai precisou assumir a ' +
      'responsabilidade pela família, e eu aprendi muito cedo que a vida exige coragem e ' +
      'responsabilidade.',
    'Trabalhei como office boy, ajudante de padaria, garçom e vendedor. Não conto isso para ' +
      'falar de dificuldade. Conto porque foi ali que aprendi a respeitar profundamente quem ' +
      'acorda todos os dias para trabalhar, sustentar a família e construir o próprio caminho.',
    'Em 2001, me formei em Administração e entrei para a Polícia Civil de Rondônia. Foi dentro ' +
      'dela que a minha visão sobre segurança pública mudou para sempre.',
  ],
  citacao: 'Antes de chegar à política, eu conheci a vida real.',

  /**
   * O vídeo em que a pessoa conta a própria história.
   *
   * Nasce vazio: com o campo em branco a coluna de fotos fica exatamente
   * como está, e o bloco de vídeo não reserva espaço nem aparece como
   * "em breve". Colar o endereço no painel liga tudo.
   */
  video: { ...VIDEO },
} as const

// ─────────────────────────────────────────────────────────────
// 3. PROBLEMA — o que está errado
//
// Dores que o eleitor VIVE, não pautas que o candidato defende.
//
// ⚠️ AQUI NÃO SÃO QUATRO, SÃO SEIS, e a lista veio pronta do
//    documento da campanha: é o bloco "ainda existem" com que o
//    Ribeiro fecha a apresentação dele. Manter as seis frases na
//    forma original ("Ainda existem…") é o que faz esta seção soar
//    como quem já tem mandato e continua achando pouco — em vez de
//    quem descobriu o problema na semana da campanha. Cada uma tem
//    par exato em `futuro`: a dor 01 responde ao compromisso 01, e
//    assim por diante. Reordenar uma sem reordenar a outra desmonta
//    a leitura da página.
//
// ⚠️ SEM ESTATÍSTICA. Nenhuma destas seis carrega número, e é
//    proposital: os números desta campanha estão todos em `provas`,
//    onde têm fonte. Número solto aqui viraria promessa disfarçada de
//    diagnóstico, que é exatamente o que a seção seguinte acusa.
// ─────────────────────────────────────────────────────────────
export const problema = {
  etiqueta: 'Hoje eu tenho novos desafios',
  titulo: 'Por que eu [[quero continuar?]]',
  intro:
    'Meu primeiro mandato me mostrou que resultado exige persistência. Uma demanda não termina ' +
    'quando a gente faz uma indicação, e uma luta não termina quando a gente faz um discurso. ' +
    'Eu continuo andando por Rondônia, e é isto que eu continuo ouvindo.',
  itens: [
    {
      id: 'item-01',
      numero: '01',
      titulo: 'Ainda existem delegacias que precisam de estrutura',
      texto:
        'Uma investigação não pode depender de um prédio que não funciona, de efetivo que não ' +
        'chega e de equipamento que falta na hora. Eu sei disso por experiência própria.',
    },
    {
      id: 'item-02',
      numero: '02',
      titulo: 'Ainda existem crianças que precisam de oportunidade',
      texto:
        'Eu vi, na Delegacia dos Menores, aonde leva a porta que fica aberta quando não há mais ' +
        'nada para a criança fazer no contraturno. O Estado precisa chegar antes.',
    },
    {
      id: 'item-03',
      numero: '03',
      titulo: 'Ainda existem mulheres que precisam de proteção',
      texto:
        'Uma mulher que não sabe que o agressor deixou a prisão não tem como se proteger nem ' +
        'proteger os filhos. Informação também é proteção.',
    },
    {
      id: 'item-04',
      numero: '04',
      titulo: 'Ainda existem famílias esperando pela escritura',
      texto:
        'Gente que vive há anos dentro da própria casa sem um documento definitivo dela. Sem ' +
        'escritura não há patrimônio, não há garantia e não há o que deixar para os filhos.',
    },
    {
      id: 'item-05',
      numero: '05',
      titulo: 'Ainda existem servidores que precisam ser valorizados',
      texto:
        'O servidor público é a base que sustenta o Estado. Quem protege também precisa ser ' +
        'protegido — e isso não se resolve com discurso, se resolve com carreira.',
    },
    {
      id: 'item-06',
      numero: '06',
      titulo: 'Ainda existem atletas esperando por uma chance',
      texto:
        'Um tatame, um kimono, uma etapa de campeonato. Custa pouco perto do que evita, e é a ' +
        'diferença entre o menino no esporte e o menino na esquina.',
    },
  ],
  video: { ...VIDEO },
} as const

// ─────────────────────────────────────────────────────────────
// 4. VALORES — as bandeiras
//
// Seis, e cada uma com uma lei, um projeto ou uma ação real por trás.
// Bandeira sem lastro é slogan, e slogan o adversário copia.
//
// ⚠️ A CHAVE `chave` ESCOLHE O ÍCONE, e a lista boa é a de
//    `content/esquema.ts`: familia · liberdade · segurança · lei ·
//    armas · producao · imposto · fe. São oito, e `Valores.tsx` não
//    tem mais nenhum — chave desconhecida deixa o cartão sem ícone,
//    em silêncio, e ninguém percebe até a página estar no ar.
//    (O comentário antigo aqui listava saude/educacao/social, que
//    nunca existiram no componente.)
//
// As seis abaixo usam seis ícones distintos de propósito: repetir
// ícone em grade de três colunas faz duas bandeiras diferentes
// parecerem a mesma coisa lida de relance, que é como esta seção é
// lida.
//
// O tema "polícia especializada" foi dobrado dentro de "Delegacia que
// funciona", e a Carteira Azul saiu daqui para `provas`: ela não é
// bandeira, é entrega — tem número e data.
// ─────────────────────────────────────────────────────────────
export const valores = {
  etiqueta: 'Minhas bandeiras',
  titulo: 'Meu mandato é sobre [[quem nunca vestiu farda.]]',
  intro:
    'Quando eu defendo uma delegacia melhor estruturada, não estou pensando apenas no policial: ' +
    'estou pensando na família que chega ali procurando justiça. Segurança pública é proteger ' +
    'gente, dentro e fora da farda.',
  itens: [
    {
      id: 'val-01',
      chave: 'segurança',
      titulo: 'Delegacia que funciona',
      texto:
        'Estrutura, efetivo, concurso e formação. Uma investigação eficiente é a resposta que a ' +
        'vítima está esperando.',
    },
    {
      id: 'val-02',
      chave: 'lei',
      titulo: 'Valorizar quem protege',
      texto:
        'O realinhamento da carreira da Polícia Civil virou lei em 2023 e vem sendo cumprido por ' +
        'etapas. Quem protege também precisa ser protegido.',
    },
    {
      id: 'val-03',
      chave: 'familia',
      titulo: 'Esporte que salva',
      texto:
        'Menino no tatame não está na esquina. Levei para o esporte o que aprendi na Delegacia ' +
        'dos Menores: é preciso agir antes.',
    },
    {
      id: 'val-04',
      chave: 'armas',
      titulo: 'Proteção à criança',
      texto:
        'O combate ao crime começa antes do crime. Prevenção, proteção e oportunidade para quem ' +
        'ainda dá tempo de proteger.',
    },
    {
      id: 'val-05',
      chave: 'liberdade',
      titulo: 'Proteção às mulheres',
      texto:
        'Defendi a notificação da soltura de agressores. Uma mulher que sabe que o agressor está ' +
        'solto pode se proteger e proteger os filhos.',
    },
    {
      id: 'val-06',
      chave: 'producao',
      titulo: 'Escritura na mão',
      texto:
        'Regularização fundiária em Porto Velho e no interior. Para uma família, a escritura ' +
        'significa patrimônio, segurança e paz.',
    },
  ],
  /** A linha que fecha a seção, ao lado da foto de apoio. */
  frase: 'Proteger pessoas. Foi isso que a farda me ensinou.',
} as const

// ─────────────────────────────────────────────────────────────
// 4b. CENA — a bandeira de Rondônia, montada pela rolagem
//
// Quatro telas: o azul toma a tela, o amarelo sobe até a metade, a
// cunha verde cresce do pé, a estrela assenta no campo azul. A ordem é
// a da bandeira e não muda. Por isso são quatro campos fixos, e não
// uma lista.
//
// ⚠️ AS CHAVES SÃO A ORDEM, NÃO A COR. Já foram `verde/amarelo/azul`,
//    de quando esta cena desenhava a bandeira do Brasil, e isso
//    amarrava o texto ao desenho: trocar a bandeira obrigava a
//    renomear conteúdo. A ordem é a única coisa que sobrevive a uma
//    troca de paleta ou de estado.
//
//    Renomear chave aqui só é de graça com o BANCO VAZIO: `mesclar`
//    descarta chave desconhecida em silêncio e devolve o padrão para a
//    que falta, então num site no ar a troca faria todo texto editado
//    da cena voltar ao padrão de fábrica sem avisar ninguém.
//
// ✍️ ESCREVER: TRÊS frases curtas contando um arco. Antes → a virada →
//    o pedido. São três e não quatro porque a cena tem três tempos: o
//    azul, o amarelo, e a bandeira montando com a estrela. O texto
//    aparece grande e ocupa a tela — o teto de caracteres é o que cabe
//    num celular sem o título passar de três linhas.
// ─────────────────────────────────────────────────────────────
export const cena = {
  passo1: {
    etiqueta: 'O antes',
    titulo: 'Eu vivi a [[segurança pública.]]',
    texto: 'Entrei para a Polícia Civil em 2001. Não li sobre a ponta: eu estive nela.',
  },
  passo2: {
    etiqueta: 'A virada',
    titulo: 'A categoria me lançou [[à política.]]',
    texto:
      'Presidente do SINPOL em 2022 e, no mesmo ano, deputado estadual com 9.751 votos em 52 ' +
      'municípios.',
  },
  passo3: {
    etiqueta: `Por isso o ${campanha.numero}`,
    titulo: 'Agora é [[continuar.]]',
    texto: 'Não vim começar uma história. Vim continuar uma que já começou.',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 5. PROVAS — o que já foi feito
//
// ✍️ ESCREVER, e só com o que estiver em registro público. Esta é a
//    seção que separa candidato sério de vendedor de promessa, e ela
//    só funciona se o leitor puder conferir sozinho. Número sem fonte
//    aqui destrói a página inteira.
//
// Sem mandato anterior: troque as entregas por realizações
// verificáveis da vida profissional, ou desligue a seção em
// `exibir.provas`. Uma seção de provas com promessa dentro é pior do
// que não ter seção de provas.
// ─────────────────────────────────────────────────────────────
// ⚠️ O CAMPO `valor` NÃO TRAZ NÚMERO DE LEI EM NENHUMA DAS SEIS, e
//    isso é decisão, não esquecimento. O documento da campanha conta o
//    realinhamento da carreira e a Carteira Azul sem citar a lei que os
//    criou, e número de lei é a única coisa desta página que o leitor
//    vai conferir literalmente. Inventar um seria fabricar prova; pôr
//    "Lei 0.000/0000" seria publicar o texto de fábrica. Então o rótulo
//    carrega o que ESTÁ conferido — o ano, a quantidade, o valor — e os
//    números das leis estão pedidos em PENDENCIAS.md. Quando chegarem,
//    entram por aqui ou pelo painel, sem deploy.
export const provas = {
  etiqueta: 'O que eu fiz',
  titulo: 'Uma das maiores conquistas: [[valorizar quem protege.]]',
  intro:
    'Qualquer um sobe num palanque e fala bonito. O que separa candidato sério de vendedor de ' +
    'promessa é uma coisa só: o que já está feito e pode ser conferido. Isto é o primeiro ' +
    'mandato, item por item.',
  video: { ...VIDEO },
  entregas: [
    {
      id: 'entrega-01',
      titulo: 'Realinhamento da carreira da Polícia Civil',
      municipio: campanha.estado,
      texto:
        'Aprovado e transformado em lei em 2023, com cronograma por etapas: cerca de R$ 9,7 mil ' +
        'em 2024, R$ 13,9 mil em 2025 e R$ 17 mil na Classe Especial em 2026.',
      valor: 'Lei · 2023',
    },
    {
      id: 'entrega-02',
      titulo: 'Carteira Azul para pessoas com autismo',
      municipio: campanha.estado,
      texto:
        'Facilita a identificação e garante atendimento prioritário a pessoas com Transtorno do ' +
        'Espectro Autista. Mais de 70 carteiras já foram entregues.',
      valor: '+70 entregues',
    },
    {
      id: 'entrega-03',
      titulo: '2.000 kimonos para o jiu-jitsu',
      municipio: campanha.estado,
      texto:
        'Destinados a projetos e atletas do jiu-jitsu. São 2.000 oportunidades de colocar uma ' +
        'criança dentro do esporte em vez de deixá-la na esquina.',
      valor: '2.000 kimonos',
    },
    {
      id: 'entrega-04',
      titulo: 'Campeonato Estadual de Jiu-Jitsu',
      municipio: campanha.cidadeBase,
      texto:
        'Apoiei eventos e etapas do campeonato, que reuniram aproximadamente 500 atletas no ' +
        'Ginásio Cláudio Coutinho.',
      valor: '≈ 500 atletas',
    },
    {
      id: 'entrega-05',
      titulo: 'Estrutura para as delegacias do interior',
      municipio: 'Interior de Rondônia',
      texto:
        'Participei da articulação de investimentos e intervenções em unidades da Polícia Civil ' +
        'em Rolim de Moura, Costa Marques, Guajará-Mirim e Cacoal.',
      valor: '4 unidades',
    },
    {
      id: 'entrega-06',
      titulo: 'Concurso da Polícia Civil mantido',
      municipio: campanha.estado,
      texto:
        'Atuei pela manutenção da validade e pela prorrogação do concurso, mantendo aberta a ' +
        'possibilidade de convocação e formação de novos policiais.',
      valor: 'Prorrogado',
    },
  ],
  aviso:
    'Ao longo do mandato, os investimentos e apoios destinados ao esporte chegaram a cerca de ' +
    'R$ 5 milhões. Também atuei na regularização fundiária em Porto Velho e no interior.',
  /**
   * O print do registro público. É o que separa "eu fiz" de "eu digo
   * que fiz" — e é a única coisa nesta seção que o leitor pode ir
   * conferir sozinho, agora, sem confiar em nós.
   */
  documento: {
    titulo: 'Pesquisa o que eu fiz.',
    texto:
      'O histórico está no registro público da Assembleia Legislativa de Rondônia. Não precisa ' +
      'acreditar em mim: confere.',
    rotuloLink: 'Abrir o registro oficial',
    /**
     * ⛔ VAZIO DE PROPÓSITO, e o botão some enquanto estiver assim.
     *
     * O endereço tem de ser a página de proposições DESTE mandato na
     * ALE-RO, conferida uma vez com o link aberto — não a home do
     * portal. Um botão que promete "o registro oficial" e cai numa
     * busca vazia é pior do que não existir: ele convida o leitor a
     * checar e entrega a impressão de que não há o que mostrar.
     * Pedido em PENDENCIAS.md.
     */
    link: '',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 5.8 TRILHA DE VÍDEOS
//
// O mesmo mecanismo da seção de compromissos — a tela prende e a fita
// anda de lado conforme a página desce — com vídeo no lugar de texto.
//
// Fica logo acima de Compromissos de propósito: é o último bloco de
// prova antes de a página parar de olhar para trás e começar a
// prometer.
//
// Todos os itens nascem sem endereço, e A SEÇÃO INTEIRA SOME enquanto
// nenhum deles tiver link. Não é preciso desligar nada no painel.
// ─────────────────────────────────────────────────────────────
export const trilha = {
  etiqueta: 'O esporte',
  titulo: 'Menino no tatame [[não está na esquina.]]',
  intro:
    'O esporte não é discurso: é gente treinando. Estes quatro registros são de quadra, de ' +
    'tatame e de ginásio, do jeito que foram gravados.',
  /**
   * OS QUATRO VÍDEOS DO ESPORTE, na ordem do documento da campanha.
   *
   * ⚠️ SÃO ARQUIVOS MP4 NO STORAGE, e não links do Instagram. O
   *    documento indicava quatro posts do Instagram, e o player não
   *    aceita Instagram — `lib/video.ts` reconhece YouTube, Vimeo e
   *    arquivo direto, e o Instagram não entrega o arquivo do vídeo
   *    sem sessão autenticada (testado: o HTML do post não traz
   *    nenhuma referência a .mp4). A campanha exportou os quatro e
   *    eles subiram para um balde `videos` próprio.
   *
   * ⚠️ `formato` NÃO É ENFEITE: ele reserva a proporção antes de o
   *    vídeo carregar. Três destes são verticais de celular (720×1280)
   *    e o da federação é deitado (1276×720). Errar aqui faz o quadro
   *    saltar de tamanho quando o vídeo entra.
   *
   * ⚠️ OS TÍTULOS SAÍRAM DE VER OS VÍDEOS, um quadro de cada, e não do
   *    nome do arquivo — que é só o código do post. Já aconteceu nesta
   *    campanha de o nome herdado do documento não descrever a peça.
   *
   * Os quatro espaços restantes ficam vazios: espaço sem endereço não
   * desenha nada, e a seção se ajusta ao número de vídeos que houver.
   */
  itens: [
    {
      id: 'trilha-01',
      ...VIDEO,
      titulo: 'A ferramenta de transformação é o kimono',
      url: `${STORAGE_VIDEO}/DPHF4xzABP2.mp4`,
      formato: 'em-pe',
    },
    {
      id: 'trilha-02',
      ...VIDEO,
      titulo: 'Campeonato de jiu-jitsu, com a federação',
      url: `${STORAGE_VIDEO}/DUlb4dKkQaS.mp4`,
      formato: 'deitado',
    },
    {
      id: 'trilha-03',
      ...VIDEO,
      titulo: 'A Copa Brasil de tênis de mesa em Rondônia',
      url: `${STORAGE_VIDEO}/DXkBVVPEVda.mp4`,
      formato: 'em-pe',
    },
    {
      id: 'trilha-04',
      ...VIDEO,
      titulo: 'O que o jiu-jitsu de Rondônia tem a dizer',
      url: `${STORAGE_VIDEO}/DYBARFSByd6.mp4`,
      formato: 'em-pe',
    },
    { id: 'trilha-05', ...VIDEO },
    { id: 'trilha-06', ...VIDEO },
    { id: 'trilha-07', ...VIDEO },
    { id: 'trilha-08', ...VIDEO },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 6. FUTURO — os compromissos
//
// Seis pautas escritas de um jeito que dê para COBRAR em quatro anos.
// "Lutar por saúde" não é compromisso; é enfeite.
//
// ⚠️ "PRA BRASÍLIA" SAIU DAQUI. O texto de fábrica veio de uma
//    campanha a deputado FEDERAL, e a frase sobreviveria a uma leitura
//    distraída — mas o Ribeiro disputa a Assembleia Legislativa, e
//    prometer Brasília numa campanha estadual é erro que o adversário
//    recorta em quinze segundos.
//
// Os seis respondem, na mesma ordem, às seis dores de `problema`.
// Reordenar um lado sem o outro desmonta a leitura da página.
// ─────────────────────────────────────────────────────────────
export const futuro = {
  etiqueta: 'O que eu vou fazer',
  titulo: 'É assim que eu quero [[continuar trabalhando.]]',
  intro:
    'Eu não quero voltar à Assembleia para começar uma história. Quero continuar uma que já ' +
    'começou. São seis compromissos escritos de um jeito que dá para cobrar em quatro anos.',
  itens: [
    {
      id: 'fut-01',
      numero: '01',
      titulo: 'Delegacia estruturada em toda Rondônia',
      texto:
        'Continuar articulando investimento em unidades da Polícia Civil na capital e no ' +
        'interior, com prioridade para as que atendem mais gente com menos condição.',
    },
    {
      id: 'fut-02',
      numero: '02',
      titulo: 'Esporte no contraturno, em todo o estado',
      texto:
        'Ampliar o repasse a projetos esportivos e a entrega de material, levando tatame e ' +
        'quadra para onde hoje só existe a esquina.',
    },
    {
      id: 'fut-03',
      numero: '03',
      titulo: 'A mulher avisada quando o agressor sair',
      texto:
        'Garantir a notificação da soltura de agressores e fortalecer os serviços que atendem a ' +
        'mulher depois da denúncia.',
    },
    {
      id: 'fut-04',
      numero: '04',
      titulo: 'Escritura na mão da família',
      /**
       * ⚠️ OS BAIRROS ESTÃO NOMEADOS DE PROPÓSITO, e este é o único
       *    compromisso da lista que nomeia lugar. O documento da
       *    campanha traz os sete, e escondê-los atrás de "comunidades
       *    de Porto Velho" jogava fora exatamente o que o projeto pede
       *    em toda seção: dado local que o leitor reconhece. Quem mora
       *    na Terra Prometida se encontra nesta frase; "comunidades do
       *    interior" não pertence a ninguém.
       *
       *    É também o que torna o compromisso cobrável: daqui a quatro
       *    anos dá para perguntar, bairro por bairro, se a escritura
       *    saiu.
       */
      texto:
        'Acompanhar a regularização fundiária em Aparecida, Cascalheira, Monte Sinai, Planalto, ' +
        'Porto Cristo, Terra Prometida e nas áreas da BR-319, até a escritura chegar à mão de ' +
        'quem mora na casa.',
    },
    {
      id: 'fut-05',
      numero: '05',
      titulo: 'Concluir o cronograma da carreira',
      texto:
        'Acompanhar o cumprimento integral das etapas até a Classe Especial e defender a ' +
        'valorização dos demais servidores da segurança pública do estado.',
    },
    {
      id: 'fut-06',
      numero: '06',
      titulo: 'Ampliar a Carteira Azul e a proteção à infância',
      texto:
        'Levar a Carteira Azul a mais municípios e fortalecer os mecanismos de proteção à ' +
        'criança, ao adolescente e às pessoas com deficiência em Rondônia.',
    },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 7. GRUPOS — o objetivo número um da página
//
// Estes rótulos são de INTERFACE, não de campanha: quase nenhum
// precisa ser reescrito. Os que precisam estão marcados.
// ─────────────────────────────────────────────────────────────
export const grupos = {
  etiqueta: 'Entre no grupo',
  /**
   * ⚠️ UM GRUPO, NÃO UM POR CIDADE. O modelo nasceu com um grupo por
   *    município e o título dizia "na sua cidade"; esta campanha
   *    escolheu um grupo só para Rondônia inteira. Trocar só o título e
   *    deixar o buscador de pé seria o pior dos dois mundos — por isso
   *    a mudança é de estrutura, em `grupoUnico`, e este texto é a
   *    parte visível dela.
   *
   * ⚠️ A INTRO NÃO PROMETE "PERTO DE VOCÊ". Prometia, quando havia um
   *    grupo por município, e ali era verdade. Num grupo estadual, quem
   *    entra esperando o vizinho encontra o estado inteiro e sai — e a
   *    saída acontece depois do clique, que é o clique mais caro da
   *    campanha.
   */
  titulo: `Um grupo. [[Rondônia inteira.]]`,
  intro:
    'Meu mandato é para os 52 municípios que confiaram em mim, e o grupo é um só — de Porto ' +
    'Velho ao último distrito. É por ali que a campanha avisa de agenda, visita e do que ' +
    'estiver acontecendo, sem depender de rede social para chegar em você.',
  // ── Daqui para baixo: rótulos do BUSCADOR, do MAPA e da LISTA.
  //    Com `grupoUnico` ligado eles não aparecem em lugar nenhum — a
  //    seção é um bloco com um botão. Ficam de propósito, e não foram
  //    apagados por dois motivos: o esquema do painel os declara (some
  //    daqui e o formulário quebra), e são o caminho de volta se a
  //    campanha decidir abrir grupo por região mais para frente.
  rotuloBusca: `Digite o nome da sua ${REGIAO.rotuloBusca}`,
  placeholderBusca: 'Comece a digitar…',
  botaoGeo: 'Usar minha localização',
  botaoGeoCarregando: 'Localizando…',
  geoNegado: 'Sem problema. Procure na lista abaixo.',
  sugestaoTitulo: 'Você está em',
  sugestaoPergunta: 'Confirma para entrar no grupo daqui.',
  sugestaoNao: `Não é minha ${REGIAO.rotuloBusca}`,
  dicaBusca: 'Pode digitar sem acento.',
  vazio: 'Nada com esse nome. Veja a lista completa.',
  listaTitulo: `Todos os ${REGIAO.plural}`,
  verTodos: `Ver todos os ${REGIAO.plural}`,
  abertos: 'grupos abertos',
  folhaTitulo: `Encontre sua ${REGIAO.rotuloBusca}`,
  folhaFechar: 'Fechar',
  proximasTitulo: 'As mais perto de você',
  abertosTitulo: 'Grupos abertos agora',
  mapaTitulo: 'Onde você mora?',
  mapaDica: `Toque na sua ${REGIAO.rotuloBusca}. Verde é grupo aberto.`,
  mapaLegendaAberto: 'Grupo aberto',
  sugestaoSim: 'Sim, entrar no grupo',
  sugestaoLonge: `Confira se é mesmo a sua ${REGIAO.rotuloBusca} — a sede mais próxima está longe.`,
  emBreve: 'Em breve',
  cheio: 'Grupo cheio',
  aberto: 'Entrar',
  // ⚠️ ESTE TEXTO ESTÁ NO AR AGORA. Enquanto o link não for colado no
  //    painel, é ele que ocupa o lugar do botão — ver `BlocoGrupoUnico`.
  avisoEmBreve:
    'O grupo abre em instantes. Siga o Instagram da campanha que avisamos assim que ele estiver no ar.',
} as const

// ─────────────────────────────────────────────────────────────
// 8. FILTRO — a moldura na foto de perfil
//
// Rótulos de interface. Foram escritos para um público de 35 a 64
// anos usando o celular, e cada um deles resolveu um problema real de
// teste. Reescrever por gosto costuma piorar. O que muda por campanha
// é só o número.
// ─────────────────────────────────────────────────────────────
export const filtro = {
  etiqueta: 'Mostre seu apoio',
  titulo: `Coloque o [[${campanha.numero}]] na sua foto.`,
  intro:
    'Sua foto não sai do seu aparelho. Nada é enviado, nada é guardado, não precisa cadastro. ' +
    'É tudo feito aqui dentro do seu celular.',
  passos: [
    { id: 'passo-01', numero: '1', titulo: 'Escolha a moldura', texto: 'Story para postar ou quadrado para foto de perfil.' },
    { id: 'passo-02', numero: '2', titulo: 'Escolha sua foto', texto: 'Do rolo da câmera mesmo. Ela não sai daqui.' },
    { id: 'passo-03', numero: '3', titulo: 'Ajuste', texto: 'Arraste e dê zoom até o rosto ficar bem enquadrado.' },
    { id: 'passo-04', numero: '4', titulo: 'Salve e poste', texto: 'Baixe, compartilhe ou segure na foto para salvar.' },
  ],
  formatos: {
    story: { rotulo: 'Story', descricao: '1080 × 1920 — para postar no Instagram e no status' },
    perfil: { rotulo: 'Perfil', descricao: '1080 × 1080 — para foto de perfil do WhatsApp' },
  },
  botaoEscolherFoto: 'Escolher minha foto',
  botaoTrocarFoto: 'Trocar foto',
  botaoGerar: 'Gerar minha foto',
  botaoGerando: 'Gerando…',
  botaoBaixar: 'Baixar foto',
  botaoCompartilhar: 'Compartilhar',
  botaoStory: 'Abrir o Instagram',
  notaStory:
    'Salve a foto primeiro. O Instagram abre na câmera de story — aí é só escolher a foto salva.',
  botaoRefazer: 'Fazer outra',
  botaoVoltar: 'Voltar',
  botaoAvancar: 'Continuar',
  dicaSalvar: 'No celular: segure o dedo na foto acima e escolha "Salvar imagem".',
  vazioPrevia: 'Sua foto entra aqui.',
  rotuloZoom: 'Zoom',
  botaoCentralizar: 'Centralizar',
  dicaAjuste: 'Arraste a foto para posicionar. No celular, use dois dedos para aproximar.',
  tituloPronto: 'Sua foto está pronta.',
  textoPronto: 'Agora é postar. Story, perfil, status do WhatsApp — onde a sua gente vê.',
  avisoInstagram:
    'Você abriu pelo Instagram. Aqui o download costuma falhar — toque para abrir no navegador.',
  avisoInstagramBotao: 'Abrir no navegador',
  naoBaixouTitulo: 'Não baixou?',
  naoBaixouTexto:
    'Dentro do Instagram o download costuma não funcionar. Segure o dedo na foto acima e ' +
    'escolha "Salvar imagem", ou abra esta página no navegador.',
  erroFormato:
    'Essa foto está num formato que o navegador não abre (comum em fotos de iPhone). ' +
    'Tire um print dela e use o print.',
  erroPequena: 'Essa foto é pequena e vai sair borrada. Sugerimos escolher outra.',
  erroGerar: 'Não foi possível gerar a imagem neste aparelho. Tente uma foto menor.',
  avisoZonaSegura: 'Deixe o rosto aqui dentro',
  privacidade: 'Sua foto nunca sai do seu aparelho.',
  // O número entra na frente, vindo do banco. Só aparece depois de
  // passar de um piso que não constranja — ver lib/apoios.ts.
  apoios: 'pessoas já colocaram o {{candidato.numero}} na foto.',
} as const

// ─────────────────────────────────────────────────────────────
// 9. COMPARTILHAR
// ─────────────────────────────────────────────────────────────
export const compartilhar = {
  etiqueta: 'Espalhe',
  titulo: 'Campanha boa é a que [[anda sozinha.]]',
  intro:
    'Não tem verba que compre o que a sua indicação faz. Mande esta página para três pessoas ' +
    'que confiam em você.',
  // ✍️ ESCREVER — é o texto que sai no WhatsApp de quem compartilha.
  //    Precisa fazer sentido lido sozinho, sem a página junto.
  textoWhatsapp:
    `Olha a página ${g.do} ${nomeComNumero}, ${g.candidato} a ${campanha.cargo} por ` +
    `${campanha.estado}. Dá pra entrar no grupo da campanha e colocar o ` +
    `${campanha.numero} na sua foto:`,
  botaoWhatsapp: 'Enviar no WhatsApp',
  botaoCopiar: 'Copiar o link',
  copiado: 'Link copiado.',
} as const

// ─────────────────────────────────────────────────────────────
// 10. CTA FINAL
// ─────────────────────────────────────────────────────────────
// O texto abaixo é o fecho do documento da campanha — a lista de
// títulos que o Ribeiro usa para se apresentar. Ela fica AQUI, e não
// numa seção própria, porque é a última coisa que ele diz antes de
// pedir o voto: uma seção inteira para ela empurraria o pedido para
// baixo da dobra em celular, que é onde 90% desta página é lida.
export const ctaFinal = {
  titulo: ['Eu sou Ribeiro do Sinpol.', `${campanha.eleicao.dataVotacao}.`, '[[O próximo passo é seu.]]'],
  texto:
    'Sou policial civil, administrador, ex-presidente do SINPOL, deputado estadual, pai da ' +
    'Valentina e cristão. Acima de qualquer título, sou um rondoniense que viveu aqui a vida ' +
    'inteira. Agora falta a parte que só você pode fazer.',
  ctaPrimario: ctas.grupo,
  ctaSecundario: ctas.filtro,
} as const

// ─────────────────────────────────────────────────────────────
// FAIXA — a tarja que corre entre a primeira dobra e o resto.
// Serve para o que precisa ser lembrado sem ocupar seção: número,
// nome de urna, partido, o que a campanha quiser martelar.
// ─────────────────────────────────────────────────────────────
export const faixa = {
  itens: [
    { id: 'faixa-01', texto: nomeComNumero },
    { id: 'faixa-02', texto: `${campanha.cargo} · ${campanha.partido}` },
    { id: 'faixa-03', texto: 'Conhece e entrega' },
    { id: 'faixa-04', texto: 'O crime se combate antes do crime' },
    { id: 'faixa-05', texto: 'Menino no tatame não está na esquina' },
    { id: 'faixa-06', texto: 'Escritura na mão é paz na família' },
    { id: 'faixa-07', texto: 'Pesquisa o que eu fiz' },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 11. RODAPÉ
// ─────────────────────────────────────────────────────────────
export const rodape = {
  /**
   * A última linha do documento da campanha, e por isso a última linha
   * do site. "Feito em Rondônia." era o padrão de fábrica e servia
   * para qualquer candidatura de qualquer estado — que é o problema.
   */
  assinatura: 'Juntos pela Rondônia que a gente quer.',
  links: [
    { id: 'link-01', rotulo: 'Grupo de WhatsApp', href: '/grupos' },
    { id: 'link-02', rotulo: `Coloque o ${campanha.numero} na sua foto`, href: '/filtro' },
    { id: 'link-03', rotulo: 'Política de privacidade', href: '/politica-de-privacidade' },
  ],
  legalRotulo: 'Propaganda eleitoral',
  aviso: 'Esta página é propaganda eleitoral e não coleta dados pessoais dos visitantes.',

  /**
   * ⚠️ IDENTIFICAÇÃO ELEITORAL OBRIGATÓRIA — NÃO PUBLICAR EM BRANCO.
   *
   * Estes campos não moram em variável de ambiente de propósito: pelo
   * painel, corrigir um dado errado leva trinta segundos em vez de um
   * deploy, e é isso que importa numa campanha. Em compensação, quem
   * tem a senha do painel pode mudar o CNPJ da peça — que é exposição
   * jurídica. O histórico de versões cobre parte disso: toda alteração
   * fica registrada e dá para restaurar.
   *
   * Preenchidos em Painel ▸ Identidade ▸ Rodapé.
   */
  legal: {
    eleicao: `ELEIÇÃO ${campanha.eleicao.ano}`,
    candidato: campanha.nomeUrna,
    cargo: campanha.cargo.toUpperCase(),
    partido: `PARTIDO ${campanha.partido} ${campanha.partidoNumero}`,
    /**
     * ⚠️ ESTE CNPJ NÃO FOI ESCRITO AQUI: ELE FOI LIDO DA ARTE OFICIAL.
     *
     * Está carimbado na borda do adesivo de bolso entregue pela
     * campanha (`MARCA/BOLA RIBEIRO 50X50CM.png`), onde a lei eleitoral
     * já obriga a constar. Ou seja, é a própria campanha declarando o
     * número — não é dado que alguém deduziu.
     *
     * Ainda assim, ele é o único campo desta página cujo erro é
     * infração, e não deslize de texto. Antes de apontar domínio,
     * alguém precisa bater estes catorze dígitos contra o registro de
     * candidatura, uma vez, olhando para os dois. Está em
     * PENDENCIAS.md, e é conferência de trinta segundos.
     */
    cnpj: 'CNPJ 68.519.615/0001-62',
    /**
     * ⛔ Vazios: coligação e endereço do comitê não aparecem em
     *    nenhuma peça entregue até aqui, e nenhum dos dois se deduz.
     *    Campo vazio some da linha do rodapé (ver RodapeLegal.tsx);
     *    campo preenchido por chute vira peça irregular.
     */
    coligacao: '',
    comite: '',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 12. PRIVACIDADE
//
// ⚠️ ESTE TEXTO DESCREVE O QUE O CÓDIGO FAZ. Ele é verdadeiro para
//    este projeto como ele está: a foto do filtro não sai do
//    aparelho, a coordenada é usada e descartada, e não há cookie de
//    rastreamento — ENQUANTO o pixel estiver desligado.
//
//    Ligar o pixel da Meta torna o item 4 falso. A tela Painel ▸
//    Tráfego entrega o parágrafo substituto pronto para colar. Não
//    ligue o pixel sem trocar o texto: é a única parte deste site que
//    tem consequência fora dele.
//
// Os textos aceitam {{tokens}}. A lista permitida está em
// lib/conteudo/tokens.ts — é whitelist, não acesso livre ao objeto.
// ─────────────────────────────────────────────────────────────
export const privacidade = {
  titulo: 'Política de Privacidade',
  atualizadoEm: '',
  resumo:
    'Resumo em uma frase: esta página não pede seu nome, não pede seu telefone, ' +
    'não guarda sua foto e não guarda sua localização.',

  secoes: [
    {
      id: 'priv-01',
      titulo: '1. Quem é o responsável',
      conteudo: [
        'Esta página é mantida pela campanha de {{candidato.nome}}, candidatura a ' +
          '{{candidato.cargo}} por {{candidato.estado}} pelo {{candidato.partidoExtenso}}, ' +
          'número {{candidato.numero}}. Os dados de identificação da campanha, incluindo CNPJ e ' +
          'endereço do comitê, estão no rodapé de todas as páginas.',
      ],
    },
    {
      id: 'priv-02',
      titulo: '2. A sua foto no gerador de moldura',
      conteudo: [
        'O gerador de moldura funciona inteiramente dentro do seu aparelho. A foto que você escolhe ' +
          'é lida pelo próprio navegador, desenhada numa tela interna junto com a moldura e salva por você.',
        'Em nenhum momento a foto é enviada para um servidor, para a campanha ou para terceiros. ' +
          'Não guardamos, não vemos e não temos como recuperar nenhuma imagem gerada aqui. ' +
          'Por isso o gerador não pede cadastro nem login.',
      ],
    },
    {
      id: 'priv-03',
      titulo: '3. A sua localização',
      conteudo: [
        'Ao tocar em "Usar minha localização", o navegador pede a sua permissão e informa a coordenada ' +
          'apenas para o código que roda no seu próprio aparelho. Essa coordenada é usada para calcular ' +
          'qual sede está mais perto e é descartada em seguida.',
        'A coordenada não é enviada para nenhum servidor nem armazenada. Se você recusar a permissão, ' +
          'a página continua funcionando normalmente: basta buscar pelo nome.',
        'Independentemente disso, a hospedagem pode inferir a cidade aproximada a partir do endereço de rede, ' +
          'como qualquer site faz. Usamos essa informação apenas para sugerir uma cidade na tela, ' +
          'no momento em que a página carrega. Ela não é gravada.',
      ],
    },
    {
      id: 'priv-04',
      titulo: '4. O que medimos',
      conteudo: [
        'Registramos eventos de uso sem identificar pessoas: página vista, rolagem, busca, ' +
          'clique no botão do grupo, uso do gerador de moldura e compartilhamento.',
        'A cada visita é gerado um identificador aleatório, guardado apenas enquanto a aba estiver aberta, ' +
          'cuja única função é evitar que a mesma visita seja contada várias vezes. ' +
          'Ele não contém nome, telefone, e-mail nem endereço de rede, e desaparece quando você fecha a aba.',
        'Não usamos cookies de rastreamento e não montamos perfil de navegação.',
      ],
    },
    {
      id: 'priv-09',
      titulo: '5. Os vídeos da página',
      conteudo: [
        'Os vídeos desta página são hospedados no YouTube e no Vimeo, e não neste site. ' +
          'Enquanto você não toca no botão de play, nada é pedido a esses serviços: o que aparece na tela ' +
          'é apenas uma imagem de capa e um botão, servidos por nós.',
        'Ao tocar em play, o player do serviço é carregado e, a partir daí, o tratamento dos seus dados ' +
          'dentro dele segue a política de privacidade do próprio serviço. ' +
          'Usamos os endereços que não gravam cookie de publicidade, mas não temos como falar pelo que eles fazem.',
      ],
    },
    {
      id: 'priv-05',
      titulo: '6. Grupos de WhatsApp',
      conteudo: [
        'Ao entrar num grupo de WhatsApp da campanha, o tratamento dos seus dados dentro do aplicativo ' +
          'passa a seguir a política de privacidade do próprio WhatsApp e as regras do grupo. ' +
          'Você pode sair do grupo a qualquer momento pelo próprio aplicativo.',
      ],
    },
    {
      id: 'priv-06',
      titulo: '7. Compartilhamento com terceiros',
      conteudo: [
        'Não vendemos, alugamos nem cedemos dados de visitantes. ' +
          'Os serviços de hospedagem e de banco de dados utilizados pelo site processam dados ' +
          'exclusivamente para manter a página no ar e gerar as métricas agregadas descritas acima.',
      ],
    },
    {
      id: 'priv-07',
      titulo: '8. Seus direitos',
      conteudo: [
        'Como não coletamos dados que identifiquem você, não há cadastro para consultar, corrigir ou apagar. ' +
          'Ainda assim, se tiver qualquer dúvida sobre esta política ou sobre o tratamento de dados, ' +
          'a campanha responde pelos canais indicados no rodapé.',
      ],
    },
    {
      id: 'priv-08',
      titulo: '9. Mudanças nesta política',
      conteudo: [
        'Se esta política mudar, a data de atualização no topo desta página muda junto. ' +
          'Recomendamos conferir esta página caso tenha alguma dúvida.',
      ],
    },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 2.5 ÁLBUM — o acervo de família
//
// O material mais difícil de forjar que existe numa campanha, e por
// isso ele aparece COMO papel: borda, amarelado, data no canto.
//
// As legendas são de quem viveu a cena. "No colo do pai, com a vó do
// lado" vale mais que "Infância". O campo `ano` aceita ano, lugar ou
// as duas coisas.
//
// ⚠️ AQUI O ÁLBUM NÃO É DE INFÂNCIA, É DE TRAJETÓRIA — e a troca foi
//    obrigatória, não estética. O documento da campanha não traz uma
//    única cena de infância: ele começa a mostrar imagem em 2001, na
//    Polícia Civil. Legenda de infância aqui só poderia ser inventada,
//    e "foto de família" inventada é o pior lugar possível para
//    inventar, porque é justamente o material que a seção anuncia como
//    impossível de forjar. O arco vira 2001 → SINPOL → mandato, e o
//    título "não dá pra inventar isso" continua verdadeiro.
//
// ⚠️ AS OITO LEGENDAS DESCREVEM FOTOS QUE AINDA NÃO EXISTEM. Cada uma
//    é um fato do documento, mas quem escolher a foto precisa conferir
//    se ela é mesmo daquela cena — legenda que não bate com a imagem é
//    o tipo de erro que só o adversário encontra. Está em
//    PENDENCIAS.md. Enquanto os slots estiverem vazios, o componente
//    desenha o quadro com a proporção reservada e nada quebra.
// ─────────────────────────────────────────────────────────────
export const album = {
  etiqueta: '2022 · O SINPOL',
  titulo: 'Quando os policiais me confiaram [[uma nova missão.]]',
  intro:
    'Depois de tantos anos dentro da Polícia Civil, meus colegas me confiaram outra ' +
    'responsabilidade. Não é foto produzida para esta página: é o que ficou de quem estava na ' +
    'sala no dia da assembleia.',
  /**
   * ⚠️ QUATRO, E NÃO OITO. O álbum nasceu com oito espaços porque
   *    servia de acervo de família genérico; aqui ele conta UM
   *    capítulo — o sindicato e a eleição de 2022 —, e para esse
   *    capítulo existem quatro fotos: as duas da assembleia geral, que
   *    vieram embutidas no próprio RIBEIRO SITE.docx, e as da campanha,
   *    que estão no post do Instagram que o documento indica.
   *
   *    Encher os outros quatro espaços com legendas de 2001 e do
   *    mandato — que é como estava — punha a trajetória inteira debaixo
   *    de um título que fala de 2022. O componente aceita de 3 a 8, e
   *    quatro é o número honesto.
   */
  fotos: [
    { id: 'album-01', legenda: 'A assembleia geral do SINPOL', ano: 'Porto Velho' },
    { id: 'album-02', legenda: 'Falando para a categoria', ano: 'SINPOL/RO' },
  ],
  rodape: 'Fotos do arquivo do sindicato e da campanha de 2022.',
} as const

// ─────────────────────────────────────────────────────────────
// 2.6 A RUA — a prova de que a manchete é literal
//
// Se a primeira dobra afirma alguma coisa sobre a rua, esta seção é
// onde ela se prova. Sem ela a página afirma e não mostra — que é
// exatamente o que ela acusa os outros de fazer duas seções abaixo.
//
// ⚠️ AQUI "A RUA" É A POLÍCIA CIVIL, e é o que sustenta a manchete.
//    A primeira dobra diz "quem já protegeu na rua sabe o que falta na
//    lei" — se esta seção não mostrar a rua, aquela frase vira retórica
//    de palanque, que é o que a página inteira se propõe a não ser.
//    O título de fábrica ficou porque, por coincidência boa, ele é
//    literal nesta campanha: a rua dele não era metáfora.
//
// A DEAAI aparece aqui e reaparece em `valores` (esporte) e em
// `problema` (criança). Não é repetição descuidada: é a mesma origem
// explicando três posições diferentes, e é o argumento mais forte que
// esta candidatura tem.
// ─────────────────────────────────────────────────────────────
export const rua = {
  etiqueta: '2001 · Polícia Civil',
  titulo: 'Minha história na [[Polícia Civil.]]',
  texto:
    'Trabalhei na DEAAI, a Delegacia dos Menores, e acompanhei de perto crianças e adolescentes ' +
    'entrando no caminho da criminalidade. Também chefiei o setor de investigação e atuei na ' +
    'área financeira da Polícia Civil. Foi ali que entendi o que carrego até hoje: o combate ao ' +
    'crime começa antes do crime.',
  video: { ...VIDEO },
  /**
   * ⚠️ DUAS, E NÃO TRÊS — e as duas legendas descrevem as fotos que
   *    existem de verdade, não as que seriam ideais. A primeira é a
   *    continência numa formatura; a segunda, a visita às unidades.
   *    Não há foto de plantão na DEAAI no material da campanha, e a
   *    legenda anterior descrevia uma que ninguém tinha.
   */
  fotos: [
    { id: 'rua-01', legenda: 'Continência na formatura', local: 'Rondônia' },
    { id: 'rua-02', legenda: 'Visita às unidades da Polícia Civil', local: 'Interior de RO' },
  ],
  // ⚠️ As melhores fotos de rua são de fotógrafo e de veículo de
  //    imprensa. Este crédito não é enfeite: é a condição de uso.
  credito: 'Fotos do arquivo pessoal.',
} as const

// ─────────────────────────────────────────────────────────────
// 5.5 PROVA SOCIAL — o que os outros dizem
//
// Vem DEPOIS de Provas de propósito: primeiro eu provo com lei,
// depois outro fala por mim. Invertido, os elogios chegam antes de
// haver motivo para eles.
//
// ⛔ NASCE DESLIGADA (ver `exibir.social`). São prints de comentários
//    de terceiros e menções a processos judiciais: os primeiros
//    exigem autorização de uso de imagem, os segundos exigem o
//    jurídico assinando embaixo. Ligar antes disso é criar problema
//    onde não havia.
// ─────────────────────────────────────────────────────────────
export const social = {
  etiqueta: 'O que dizem',
  titulo: 'Aqui não sou eu [[falando de mim.]]',
  intro:
    'São comentários que as pessoas escreveram por conta própria, nos posts, sem eu pedir. ' +
    'Deixei do jeito que chegaram.',
  legendas: [
    { id: 'leg-01', texto: 'Quem escreveu, sem nome completo' },
    { id: 'leg-02', texto: '' },
    { id: 'leg-03', texto: '' },
    { id: 'leg-04', texto: '' },
    { id: 'leg-05', texto: '' },
    { id: 'leg-06', texto: '' },
  ],
  videos: [
    { id: 'svid-01', ...VIDEO, titulo: 'Comentário 1' },
    { id: 'svid-02', ...VIDEO, titulo: 'Comentário 2' },
  ],
  ataques: {
    etiqueta: 'O outro lado',
    titulo: 'E o que dizem [[contra mim?]]',
    intro: 'O que o adversário publica, reproduzido sem edição.',
    fecho: 'A leitura da campanha sobre o que está acima, em duas linhas.',
  },
  /**
   * ⛔ MENÇÃO A PROCESSO JUDICIAL NÃO SOBE SEM O JURÍDICO.
   *    Nem para dizer que a campanha ganhou. O texto precisa ser
   *    conferido por quem responde por ele.
   */
  processos: [
    {
      id: 'proc-01',
      titulo: 'O caso, em uma frase',
      texto: 'O que foi alegado, por quem, quando.',
      resultado: 'O que a Justiça decidiu.',
      videos: [{ id: 'pvid-01', ...VIDEO, titulo: 'O processo' }],
    },
  ],
  nota: 'Comentários públicos, reproduzidos com identificação preservada apenas onde houve autorização.',
} as const

// ─────────────────────────────────────────────────────────────
// EXIBIR — quais seções vão ao ar
//
// Um interruptor por seção. Serve para duas coisas reais de campanha:
// tirar do ar um bloco cuja prova ainda não chegou, e encurtar a
// página quando o tráfego pago pedir caminho mais curto até o grupo.
//
// ⚠️ Hero, chamada final e rodapé NÃO estão aqui de propósito. O
//    rodapé carrega a identificação exigida pela lei eleitoral, e uma
//    página de campanha sem primeira dobra nem pedido de voto não é
//    uma página mais curta: é outra coisa.
// ─────────────────────────────────────────────────────────────
export const exibir = {
  faixa: true,
  origem: true,
  album: true,
  rua: true,
  problema: true,
  valores: true,
  cena: true,
  provas: true,
  /** ⛔ Desligada de fábrica: direito de imagem e jurídico. Ver acima. */
  social: false,
  trilha: true,
  futuro: true,
  grupos: true,
  filtro: true,
  compartilhar: true,
} as const

// ─────────────────────────────────────────────────────────────
// APARÊNCIA
//
// Os poucos ajustes visuais que a campanha decide sem chamar
// ninguém. Não é um editor de tema: são três chaves, e cada uma
// existe porque alguém já quis mexer nela. As CORES ficam em
// content/campanha.ts.
// ─────────────────────────────────────────────────────────────
export const aparencia = {
  /**
   * As cores da primeira dobra.
   *
   * Seis combinações: azul · verde · amarelo · verde-amarelo ·
   * azul-verde · amarelo-azul. Ver `.capa` em globals.css — cada uma
   * define a própria cor de realce e de botão, para os dois
   * continuarem saltando do fundo em vez de afundar nele.
   *
   * Lembrando que os nomes são PAPÉIS: "azul" é a cor primária da
   * campanha, seja ela qual for.
   */
  heroCor: 'bandeira',

  /**
   * O TAMANHO DA FIGURA NA PRIMEIRA DOBRA, em % da altura da dobra.
   *
   * ⚠️ ISTO ERA UM NÚMERO CRAVADO NO COMPONENTE (`h-[112%]`), e virou
   *    controle porque é decisão de campanha, não de código: o recorte
   *    que a campanha sobe muda a cada foto — uns vêm de corpo inteiro,
   *    outros da cintura para cima — e o mesmo 112% que enquadra bem
   *    um deixa o outro pequeno no meio da tela. Trocar isso não pode
   *    custar um deploy.
   *
   * Acima de 100 a figura é maior que a dobra e sobra para baixo; é o
   * normal, e é o que faz ela encostar no pé da seção em vez de
   * flutuar. Combinado com `heroFiguraDescida`, é assim que se "corta"
   * a foto na altura que a campanha quiser sem editar o arquivo.
   */
  heroFiguraAltura: 112,

  /**
   * QUANTO A FIGURA SOBE OU DESCE, em % da própria altura.
   * Negativo sobe, positivo desce.
   *
   * ⚠️ ACEITAR NEGATIVO É O QUE FAZ O PAR FUNCIONAR. A figura é
   *    ancorada pelo TOPO da dobra (`items-start` no invólucro) e o
   *    conteúdo assenta no pé da própria caixa (`object-bottom`).
   *    Consequência: aumentar o tamanho já empurra a figura para
   *    baixo sozinho. Com o controle indo só de 0 para cima, quem
   *    aumentava para ver melhor o rosto via o rosto AFUNDAR, e não
   *    havia como trazer de volta.
   *
   *    A receita que a campanha vai usar: aumentar o tamanho e depois
   *    subir (negativo) até o rosto voltar ao lugar. O que passa do pé
   *    da seção é cortado — ela já tem `overflow: hidden` — e o
   *    arquivo da foto continua intacto, em alta.
   */
  heroFiguraDescida: 0,

  /** nenhuma · halftone · ruido · tracejado */
  textura: 'halftone',
  /** De 0 a 100. Ver .textura em globals.css: 100 é o teto do tipo. */
  texturaForca: 20,
} as const

// ═══════════════════════════════════════════════════════════════
// PADRÃO DE FÁBRICA
//
// Este objeto é a VERDADE PADRÃO do site. As chaves daqui são as
// chaves que o banco aceita — acrescentar seção é acrescentar linha
// aqui, em content/esquema.ts e em content/mapa.ts.
// ═══════════════════════════════════════════════════════════════
export const PADRAO = {
  candidato,
  aparencia,
  meta,
  paginas,
  navegacao,
  ctas,
  hero,
  origem,
  album,
  rua,
  problema,
  valores,
  faixa,
  cena,
  provas,
  social,
  trilha,
  futuro,
  grupos,
  filtro,
  compartilhar,
  ctaFinal,
  rodape,
  privacidade,
  exibir,
} as const

/** As chaves de seção que o banco aceita. */
export const SECOES = Object.keys(PADRAO) as (keyof typeof PADRAO)[]
