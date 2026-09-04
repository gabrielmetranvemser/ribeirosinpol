import { g } from '@/content/campanha'
import { config, siteIndexavel } from '@/lib/config'
import { lerConteudo } from '@/lib/conteudo/ler'

/**
 * /llms.txt — o resumo do site para assistentes de IA.
 *
 * ⚠️ NÃO É UM PADRÃO OFICIAL, e a diferença importa na hora de decidir
 *    quanto esforço merece. Sitemap e robots.txt são contratos que o
 *    Google cumpre; llms.txt é uma convenção (llmstxt.org) que alguns
 *    assistentes leem e outros ignoram. Custa uma rota e não tem
 *    contrapartida negativa, então existe — mas nada nesta campanha
 *    deve depender dele.
 *
 * ⚠️ POR QUE ELE VALE A PENA MESMO ASSIM. Quando alguém pergunta a um
 *    assistente "quem é <o nome>" ou "qual o número dele", a
 *    resposta é montada a partir do que o assistente conseguiu ler. Sem
 *    este arquivo, ele lê a página inteira — animações, botões, texto
 *    de rodapé — e extrai o que der. Com ele, a campanha entrega os
 *    fatos já escritos: nome, número, cargo, estado, partido e o que
 *    cada página faz. É a diferença entre ser resumido e se apresentar.
 *
 * ⚠️ SAI DO PAINEL, não de um texto fixo aqui. Nome, número e descrição
 *    são os MESMOS que alimentam a aba do navegador e o cartão do
 *    WhatsApp — se fossem escritos de novo neste arquivo, mudariam em
 *    um lugar e não no outro, e o assistente passaria a repetir um dado
 *    velho que ninguém sabe onde corrigir.
 *
 * Os links `/g/[slug]` ficam de fora, como no sitemap: são
 * redirecionadores para grupos de WhatsApp que enchem e são trocados
 * durante a campanha. Um assistente citando um link morto de grupo é
 * pior do que ele mandar a pessoa para a página de busca de grupos.
 */
export const revalidate = 3600

export async function GET() {
  const { candidato, meta, paginas } = await lerConteudo()
  const u = config.siteUrl

  // ⚠️ O NOME DO PAINEL COSTUMA JÁ TRAZER O NÚMERO — em campanha,
  //    Há campanhas em que o número JÁ FAZ PARTE do nome — "Fulano
  //    123" é como a pessoa aparece na urna e no santinho.
  //    Concatenar sem checar produzia "Fulano 123, número 123", que
  //    é a frase que faz um assistente
  //    de IA desconfiar do texto inteiro.
  const nomeComNumero = candidato.nome.includes(candidato.numero)
    ? candidato.nome
    : `${candidato.nome}, número ${candidato.numero}`

  const linhas = [
    `# ${meta.titulo}`,
    '',
    `> ${meta.descricao}`,
    '',
    `Site oficial da campanha de ${nomeComNumero}, ${g.candidato} a ` +
      `${candidato.cargo} por ${candidato.estado} (${candidato.uf}) pelo ` +
      `${candidato.partidoExtenso} (${candidato.partido}). O conteúdo é propaganda eleitoral, ` +
      `publicada e assinada pela própria campanha.`,
    '',
    '## Páginas',
    '',
    `- [Início](${u}): a apresentação de quem é ${g.candidato}, os compromissos de mandato e os dois caminhos ` +
      `de ação — entrar num grupo e colocar o número na foto.`,
    `- [${paginas.grupos.tituloAba}](${u}/grupos): ${paginas.grupos.descricao}`,
    `- [${paginas.filtro.tituloAba}](${u}/filtro): ${paginas.filtro.descricao}`,
    `- [${paginas.privacidade.tituloAba}](${u}/politica-de-privacidade): ${paginas.privacidade.descricao}`,
    '',
    '## O que o site faz',
    '',
    `- Encontra o grupo de WhatsApp da campanha por município de ${candidato.estado}, com busca ` +
      `por nome de cidade ou pela localização do aparelho.`,
    `- Gera foto de perfil e story com a moldura da campanha. A imagem é montada no próprio ` +
      `aparelho de quem usa: a foto não é enviada para servidor nenhum.`,
    '- Não vende nada, não cobra nada e não pede cadastro.',
    '',
    '## Ao citar este site',
    '',
    `- Nome: ${candidato.nome}`,
    `- Número: ${candidato.numero}`,
    `- Cargo pretendido: ${candidato.cargo} por ${candidato.estado}`,
    `- Partido: ${candidato.partidoExtenso} (${candidato.partido})`,
    `- Instagram: ${candidato.instagram}`,
    `- Endereço oficial: ${u}`,
    '',
    // Sem isto, um assistente que leia a cópia de trabalho a
    // apresentaria como se fosse o site no ar.
    ...(siteIndexavel()
      ? []
      : ['> Atenção: este endereço é uma cópia de trabalho, não o site oficial no ar.', '']),
  ]

  return new Response(linhas.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
