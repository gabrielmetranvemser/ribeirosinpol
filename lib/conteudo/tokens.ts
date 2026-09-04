import type { Conteudo } from './tipos'
import { config } from '@/lib/config'

/**
 * Resolve {{tokens}} dentro de texto editável.
 *
 * Serve para a política de privacidade não repetir o nome e o cargo da
 * de quem é candidato em oito lugares — quando mudar, muda num lugar só.
 *
 * ⚠️ É WHITELIST, não acesso livre ao objeto. Sem a lista fechada, um
 *    token conseguiria desreferenciar qualquer coisa do conteúdo
 *    (inclusive campos que não deviam vazar para a página) ou apontar
 *    para um texto que contém outro token e entrar em recursão.
 *
 *    Token fora da lista fica literal na tela. Aparecer "{{x}}" para o
 *    editor é melhor que sumir em silêncio: ele vê que errou.
 */

const MARCACAO = /\{\{([a-zA-Z.]+)\}\}/g

export function resolverTokens(texto: string, conteudo: Conteudo): string {
  if (!texto.includes('{{')) return texto

  const permitidos: Record<string, string> = {
    'candidato.nome': conteudo.candidato.nome,
    'candidato.numero': conteudo.candidato.numero,
    'candidato.cargo': conteudo.candidato.cargo,
    'candidato.estado': conteudo.candidato.estado,
    'candidato.uf': conteudo.candidato.uf,
    'candidato.partidoExtenso': conteudo.candidato.partidoExtenso,
    'candidato.instagramHandle': conteudo.candidato.instagramHandle,
    // Os dados legais saíram de variável de ambiente e passaram para o
    // painel — ver o comentário em content/copy.ts, seção rodape.legal.
    'legal.cnpj': conteudo.rodape.legal.cnpj,
    'legal.candidato': conteudo.rodape.legal.candidato,
    'legal.comite': conteudo.rodape.legal.comite,
    'legal.partido': conteudo.rodape.legal.partido,
    'legal.coligacao': conteudo.rodape.legal.coligacao,
    'site.url': config.siteUrl,
  }

  return texto.replace(MARCACAO, (inteiro, chave: string) => permitidos[chave] ?? inteiro)
}

/** Os tokens que o painel pode oferecer numa lista de ajuda. */
export const TOKENS_DISPONIVEIS = [
  'candidato.nome',
  'candidato.numero',
  'candidato.cargo',
  'candidato.estado',
  'candidato.uf',
  'candidato.partidoExtenso',
  'candidato.instagramHandle',
  'legal.cnpj',
  'legal.candidato',
  'legal.comite',
  'legal.partido',
  'legal.coligacao',
  'site.url',
] as const
