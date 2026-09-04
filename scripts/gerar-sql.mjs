/**
 * Reconstrói sql/01-instalacao.sql a partir de supabase/migrations/.
 *
 *   npm run sql
 *
 * Existe porque o pacote de SQL tem dois públicos com necessidades
 * opostas, e servir os dois com um arquivo só não funciona:
 *
 *   · quem instala quer UM arquivo para colar no SQL Editor do
 *     Supabase e nunca mais pensar no assunto;
 *   · quem mantém o projeto quer migrations pequenas, com data no
 *     nome e uma mudança em cada, para saber o que entrou quando.
 *
 * As migrations são a fonte. Este script é o empacotador. Editar
 * sql/01-instalacao.sql à mão funciona até a próxima vez que alguém
 * rodar isto aqui — então não edite: edite a migration.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'

const dir = new URL('../supabase/migrations/', import.meta.url)
const arquivos = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()

const CABECA = await readFile(new URL('../sql/.cabecalho-instalacao.txt', import.meta.url), 'utf8')

const partes = [CABECA]
for (const nome of arquivos) {
  partes.push(
    `\n\n-- ╔══════════════════════════════════════════════════════════════════╗\n` +
      `-- ║ ${nome.padEnd(64)} ║\n` +
      `-- ╚══════════════════════════════════════════════════════════════════╝\n\n`,
  )
  partes.push((await readFile(new URL(nome, dir), 'utf8')).trimEnd() + '\n')
}

await writeFile(new URL('../sql/01-instalacao.sql', import.meta.url), partes.join(''))
console.log(`  ✓ sql/01-instalacao.sql · ${arquivos.length} migrations`)
