/**
 * ███████████████████████████████████████████████████████████████
 * ██  A CAMPANHA. O ÚNICO ARQUIVO QUE TODA CAMPANHA PRECISA     ██
 * ██  EDITAR PARA O SITE PASSAR A SER DE OUTRA PESSOA.          ██
 * ███████████████████████████████████████████████████████████████
 *
 * Quem lê este arquivo: `content/copy.ts` (os textos), `app/layout.tsx`
 * (cores e metadados), `lib/config.ts`, o gerador de molduras e o
 * gerador de estado. Nenhum componente lê daqui direto — eles leem do
 * conteúdo mesclado, que nasce daqui e é sobrescrito pelo painel.
 *
 * ⚠️ REGRA DE OURO DESTE PROJETO
 *    Nada aqui é lei. Tudo o que está neste arquivo vira o PADRÃO DE
 *    FÁBRICA do site — e o painel (/painel) sobrescreve por cima, sem
 *    deploy. Este arquivo é o estado inicial; o banco é a verdade
 *    corrente. Se o banco estiver vazio, o site é exatamente isto.
 *
 * ⚠️ O QUE **NÃO** MORA AQUI
 *    · Senhas, chaves e tokens → `.env.local`
 *    · CNPJ, comitê, coligação → painel ▸ Identidade ▸ Rodapé
 *      (dado legal errado em campanha não pode esperar deploy)
 *    · Links dos grupos de WhatsApp → banco (tabela `grupos`)
 *
 * Ordem de personalização recomendada: ver PERSONALIZAR.md.
 */

/** Feminino muda concordância em ~20 frases do site. Não é enfeite. */
export type Genero = 'f' | 'm'

/**
 * ESTADUAL = a página divide o eleitorado por MUNICÍPIO (deputado
 * estadual/federal, senador, governador). É o modo com mapa.
 *
 * MUNICIPAL = a página divide por BAIRRO/ZONA (vereador, prefeito).
 * O mapa some sozinho — não existe malha oficial de bairro no IBGE —
 * e a busca passa a procurar bairro. Ver PERSONALIZAR.md ▸ campanha
 * municipal.
 */
export type Escopo = 'estadual' | 'municipal'

export const campanha = {
  // ═══════════════════════════════════════════════════════════════
  // 1 · QUEM É
  // ═══════════════════════════════════════════════════════════════

  /** Como a pessoa é conhecida. É o que aparece no cabeçalho. */
  nome: 'Ribeiro do Sinpol',

  /** Usado nas frases em que o nome inteiro fica longo demais. */
  primeiroNome: 'Ribeiro',

  /**
   * O nome que vai na urna, como registrado no TSE.
   *
   * ⛔ VAZIO DE PROPÓSITO. Ninguém conferiu o registro ainda, e nome
   *    de urna é dado do TSE, não apelido de campanha — as duas
   *    coisas divergem com frequência. Preencher pelo painel ▸
   *    Identidade quando o deferimento sair. Está no PENDENCIAS.md.
   */
  nomeUrna: '',

  /** O número da urna. String, não número: '045' tem zero à esquerda. */
  numero: '25197',

  /** Sem o artigo. Ex.: 'Deputado Federal', 'Vereadora', 'Prefeito'. */
  cargo: 'Deputado Estadual',

  /**
   * Decide "candidato/candidata", "eleito/eleita", "pronto/pronta" em
   * todo texto de fábrica. Trocar aqui reescreve as concordâncias.
   */
  genero: 'm' as Genero,

  /** Sigla do partido, como no santinho. */
  partido: 'PRD',
  partidoExtenso: 'Partido Renovação Democrática',
  /** O número do partido — os dois primeiros dígitos do número da urna. */
  partidoNumero: '25',

  // ═══════════════════════════════════════════════════════════════
  // 2 · ONDE
  // ═══════════════════════════════════════════════════════════════

  /**
   * ESTADUAL põe o mapa e os municípios no ar. MUNICIPAL troca
   * município por bairro e esconde o mapa.
   */
  escopo: 'estadual' as Escopo,

  /**
   * Sigla da UF.
   *
   * ⚠️ AQUI RONDÔNIA NÃO É EXEMPLO — é a campanha. O modelo do qual
   *    este site saiu vinha com RO de fábrica (é o estado com menos
   *    municípios, 52, então o mapa que acompanha o repositório é leve),
   *    e por sorte é o estado certo. Ou seja: `npm run uf -- RO` não
   *    precisou rodar, e `data/municipios.json`, `data/mapa.json`,
   *    `data/grupos.local.json` e `sql/02-seed-municipios.sql` já estão
   *    corretos. Não troque a sigla achando que é sobra do modelo.
   */
  uf: 'RO',
  estado: 'Rondônia',
  /** Código do IBGE da UF. A tabela das 27 está em scripts/ufs.mjs. */
  ufCodigoIbge: 11,

  /** A cidade da pessoa. Aparece em "Vereadora em ___". */
  cidadeBase: 'Porto Velho',

  /**
   * Como a página chama cada pedaço do território. Em campanha
   * estadual é município; em municipal, bairro. Trocar aqui troca em
   * toda a página, incluindo o painel.
   */
  regiao: {
    singular: 'município',
    plural: 'municípios',
    /** Com artigo, para caber em frase: "o município", "os municípios". */
    artigoSingular: 'o',
    /** O que a pessoa digita na busca: 'cidade' ou 'bairro'. */
    rotuloBusca: 'cidade',
  },

  // ═══════════════════════════════════════════════════════════════
  // 3 · CANAIS
  // ═══════════════════════════════════════════════════════════════

  /** Vazio = o link some do rodapé. Não deixa link quebrado no ar. */
  instagram: '',
  instagramHandle: '',
  /** Formato wa.me/55DDDNÚMERO. Vazio esconde o botão. */
  whatsapp: '',
  facebook: '',
  youtube: '',
  tiktok: '',

  // ═══════════════════════════════════════════════════════════════
  // 4 · A ELEIÇÃO
  // ═══════════════════════════════════════════════════════════════

  eleicao: {
    ano: 2026,
    /** Como aparece escrito na chamada final. */
    dataVotacao: '4 de outubro de 2026',
    /**
     * ⚠️ O silêncio eleitoral REAL é lido de
     *    NEXT_PUBLIC_SILENCIO_ELEITORAL_EM (.env.local). Isto aqui é
     *    só o padrão de quem esqueceu de preencher — e o certo é
     *    preencher, porque tirar CTA do ar na hora certa não pode
     *    depender de alguém lembrar num domingo de manhã.
     */
    silencioPadraoUtc: '2026-10-03T04:00:00.000Z',
  },

  // ═══════════════════════════════════════════════════════════════
  // 5 · AS CORES
  //
  // Cinco hex e a página inteira muda de partido.
  //
  // ⚠️ OS NOMES SÃO PAPÉIS, NÃO CORES. `azul` é a cor primária;
  //    `verde`, a secundária; `amarelo`, a cor de AÇÃO. Uma campanha
  //    vermelha põe vermelho em `azul` e a página fica vermelha —
  //    os nomes ficam estranhos no CSS e nada mais acontece. Renomear
  //    as variáveis obrigaria a mexer em ~400 classes de utilitário
  //    espalhadas pelos componentes, o que é troca cara por um ganho
  //    cosmético.
  //
  // ⚠️ REGRA QUE NÃO SE NEGOCIA: a cor de AÇÃO nunca é texto sobre
  //    fundo claro. Ela é o que aponta o botão. Se a sua cor de ação
  //    for escura, inverta `acaoTexto` para branco.
  //
  // Estes valores são injetados como variáveis CSS em `app/layout.tsx`
  // e vencem os padrões de `app/globals.css` — o arquivo CSS não
  // precisa ser tocado.
  // ═══════════════════════════════════════════════════════════════

  /**
   * A PALETA É A BANDEIRA DE RONDÔNIA. Não é escolha decorativa: a cena
   * de rolagem no meio da página MONTA a bandeira do estado, e ela é
   * pintada com estas variáveis. Trocar um destes hex por uma cor que
   * não seja de bandeira faz a cena virar "três cores passando".
   *
   * As três oficiais entram exatas em `primariaEscura`, `secundaria` e
   * `acao`. As outras quatro são derivadas na MESMA matiz — azuis todos
   * em 220°, verdes todos em 142,7° —, porque nenhum degradê deste site
   * pode atravessar de uma família para a outra (o meio do caminho
   * entre azul e verde é um verde-água que não existe na marca).
   */
  cores: {
    /** Superfície escura: primeira dobra, chamada final, rodapé.
     *  O azul da bandeira de Rondônia, exato. Branco em cima: 13,5:1. */
    primariaEscura: '#002776',
    /** A cor de marca — mesma matiz, mais clara. Sobre branco: 9,3:1. */
    primaria: '#003BB2',
    /**
     * Superfície escura alternativa: o verde da bandeira ESCURECIDO até
     * carregar texto branco de corpo (7,2:1). O verde oficial não faz
     * isso — ver `secundaria`.
     */
    secundariaEscura: '#006627',
    /**
     * Ênfase: o verde da bandeira, exato.
     *
     * ⚠️ É ÊNFASE, NÃO SUPERFÍCIE DE TEXTO. Com branco por cima dá
     *    3,61:1 — passa em título grande e REPROVA em corpo. Ele vive
     *    no símbolo, na cunha da cena e nos detalhes; debaixo de um
     *    parágrafo vai a versão escura (ver `fundo-verde` no CSS).
     */
    secundaria: '#009C3B',
    /** AÇÃO: botões e detalhes. O amarelo da bandeira. Nunca superfície
     *  grande, e nunca texto sobre claro (sobre branco dá 1,33:1). */
    acao: '#FFDF00',
    /** Texto que fica em cima da cor de ação. Sobre o amarelo: 10,2:1. */
    acaoTexto: '#002776',
    /** O fim do gradiente da primeira dobra. Mais escuro que a primária. */
    noite: '#001642',
  },

  // ═══════════════════════════════════════════════════════════════
  // 6 · CHAVES TÉCNICAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Identificador curto da campanha, em minúsculas e sem acento.
   *
   * Batiza o cookie da sessão do painel, a chave de sessão no
   * navegador e o nome dos arquivos que o visitante baixa
   * (`joao-1234-story.jpg`). Trocar depois de o site estar no ar
   * desloga quem estiver no painel — e nada mais.
   */
  slug: 'ribeiro',
} as const

// ═══════════════════════════════════════════════════════════════
// DERIVADOS — não editar. Existem para as frases concordarem.
// ═══════════════════════════════════════════════════════════════

const f = campanha.genero === 'f'

export const g = {
  /** candidato · candidata */
  candidato: f ? 'candidata' : 'candidato',
  /** Candidato · Candidata — início de frase. */
  Candidato: f ? 'Candidata' : 'Candidato',
  /** o · a */
  o: f ? 'a' : 'o',
  /** do · da */
  do: f ? 'da' : 'do',
  /** ele · ela */
  ele: f ? 'ela' : 'ele',
  /** eleito · eleita */
  eleito: f ? 'eleita' : 'eleito',
  /** pronto · pronta */
  pronto: f ? 'pronta' : 'pronto',
  /** Ele mesmo · Ela mesma */
  mesmo: f ? 'mesma' : 'mesmo',
} as const

/** 'Fulano 1234' — o nome como a campanha o escreve em peça. */
export const nomeComNumero = campanha.nome.includes(campanha.numero)
  ? campanha.nome
  : `${campanha.nome} ${campanha.numero}`

/** 'município'/'bairro' já resolvido pelo escopo. */
export const REGIAO = campanha.regiao

/** O mapa só existe em campanha estadual: não há malha de bairro. */
export const TEM_MAPA = campanha.escopo === 'estadual'

/**
 * O nome do cookie de sessão do painel.
 *
 * ⚠️ MORA AQUI PORQUE TEM DOIS DONOS, e os dois precisam concordar:
 *    `lib/painel/sessao.ts` (Node) escreve o cookie e `middleware.ts`
 *    (Edge) o confere. O middleware não pode importar a lib — lá não
 *    existem `node:crypto` nem `next/headers` —, então a constante
 *    tinha de sair de um arquivo que os dois runtimes carreguem.
 *    Este arquivo é objeto puro: carrega em qualquer um.
 *
 *    Duas cópias divergiriam na primeira troca de campanha, e a
 *    divergência aparece do pior jeito possível: o login aceita a
 *    senha, grava o cookie, e o middleware devolve a pessoa para a
 *    tela de entrar — sem erro nenhum na tela.
 */
export const COOKIE_PAINEL = `${campanha.slug}_painel`
