import { lerConteudo } from '@/lib/conteudo/ler'
import { CabecalhoSecao } from '@/components/ui/Secao'
import { CartaoItem } from '@/components/ui/CartaoItem'
import { PalcoMotor } from '@/components/animacao/PalcoMotor'

/**
 * Compromissos — palco: a tela prende e a fita de cartões anda de lado
 * conforme a página desce. Rolar para cima traz de volta.
 *
 * Antes eram cinco cartões largos empilhados: 1.444px de altura no
 * celular que ninguém rolava até o fim. Depois virou barra rolável
 * horizontal, que era pior: no desktop, o trackpad manda um pouco de
 * X junto com o Y, o navegador tranca o gesto no eixo horizontal e a
 * página inteira para de descer. Barra rolável dentro de página que
 * rola é sempre uma briga entre dois alvos de rolagem.
 *
 * No palco não existe segundo alvo. Quem rola é a página, sempre; o
 * movimento lateral é consequência da posição, não um gesto
 * concorrente. E é a mesma mecânica da cena da bandeira — um motor só
 * para os dois.
 */
export async function Futuro() {
  const { futuro } = await lerConteudo()

  return (
    // ⚠️ `areia` E NÃO `branco`. Os cartões desta seção são brancos, e
    //    cartão branco sobre seção branca só se lê pela borda de 1px —
    //    virou problema quando a sombra saiu, porque era ela que os
    //    separava antes. A seção anterior também é areia, e isso deixou
    //    de ser conflito: quem separa uma seção da outra agora é o fio
    //    de largura total do cabeçalho, não a troca de tom do fundo.
    <section id="futuro" data-palco className="relative bg-areia text-tinta">
      <div
        className="palco-trilho"
        // Passos definem a duração. Menos que o número de cartões de
        // propósito: mais de um cabe na tela ao mesmo tempo, então
        // pedir uma rolagem inteira por cartão faria a seção arrastar.
        style={{ ['--palco-passos' as string]: Math.max(2, futuro.itens.length - 2) }}
      >
        <div className="palco-fixa flex flex-col justify-center gap-12">
          <PalcoMotor />

          <div className="container-lp">
            <CabecalhoSecao
              etiqueta={futuro.etiqueta}
              titulo={futuro.titulo}
              destaque="grifo"
              intro={futuro.intro}
            />
          </div>

          <ol className="palco-fita gap-5">
            {futuro.itens.map((item) => (
              <CartaoItem
                key={item.id}
                tom="verde"
                marca={item.numero}
                titulo={item.titulo}
                texto={item.texto}
                // A fita do palco anda sozinha: o cartão precisa de
                // largura própria, senão a grade o encolhe até caber.
                className="w-[80vw] shrink-0 sm:w-[23rem]"
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
