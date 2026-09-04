/**
 * As 27 unidades da federação, com o código do IBGE.
 *
 * O código é o que a API de malhas usa. A sigla é o que a pessoa
 * digita. Nada aqui muda — a última alteração na lista foi em 1988.
 */

export const UFS = {
  AC: { codigo: 12, nome: 'Acre', gentilico: 'acreano' },
  AL: { codigo: 27, nome: 'Alagoas', gentilico: 'alagoano' },
  AP: { codigo: 16, nome: 'Amapá', gentilico: 'amapaense' },
  AM: { codigo: 13, nome: 'Amazonas', gentilico: 'amazonense' },
  BA: { codigo: 29, nome: 'Bahia', gentilico: 'baiano' },
  CE: { codigo: 23, nome: 'Ceará', gentilico: 'cearense' },
  DF: { codigo: 53, nome: 'Distrito Federal', gentilico: 'brasiliense' },
  ES: { codigo: 32, nome: 'Espírito Santo', gentilico: 'capixaba' },
  GO: { codigo: 52, nome: 'Goiás', gentilico: 'goiano' },
  MA: { codigo: 21, nome: 'Maranhão', gentilico: 'maranhense' },
  MT: { codigo: 51, nome: 'Mato Grosso', gentilico: 'mato-grossense' },
  MS: { codigo: 50, nome: 'Mato Grosso do Sul', gentilico: 'sul-mato-grossense' },
  MG: { codigo: 31, nome: 'Minas Gerais', gentilico: 'mineiro' },
  PA: { codigo: 15, nome: 'Pará', gentilico: 'paraense' },
  PB: { codigo: 25, nome: 'Paraíba', gentilico: 'paraibano' },
  PR: { codigo: 41, nome: 'Paraná', gentilico: 'paranaense' },
  PE: { codigo: 26, nome: 'Pernambuco', gentilico: 'pernambucano' },
  PI: { codigo: 22, nome: 'Piauí', gentilico: 'piauiense' },
  RJ: { codigo: 33, nome: 'Rio de Janeiro', gentilico: 'fluminense' },
  RN: { codigo: 24, nome: 'Rio Grande do Norte', gentilico: 'potiguar' },
  RS: { codigo: 43, nome: 'Rio Grande do Sul', gentilico: 'gaúcho' },
  RO: { codigo: 11, nome: 'Rondônia', gentilico: 'rondoniense' },
  RR: { codigo: 14, nome: 'Roraima', gentilico: 'roraimense' },
  SC: { codigo: 42, nome: 'Santa Catarina', gentilico: 'catarinense' },
  SP: { codigo: 35, nome: 'São Paulo', gentilico: 'paulista' },
  SE: { codigo: 28, nome: 'Sergipe', gentilico: 'sergipano' },
  TO: { codigo: 17, nome: 'Tocantins', gentilico: 'tocantinense' },
}

/** A mesma normalização de lib/geo.ts, repetida porque script não passa pelo bundler. */
export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** 'São Miguel do Guaporé' → 'sao-miguel-do-guapore'. É a URL de /g/. */
export function slugificar(nome) {
  return normalizar(nome).replace(/ /g, '-')
}
