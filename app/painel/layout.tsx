import { config } from '@/lib/config'
import { MenuLateral } from './_componentes/MenuLateral'

export const metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

/**
 * ⚠️ A FAIXA DE "MODO LOCAL" MUDOU DE LUGAR — foi daqui para dentro do
 *    MenuLateral. Não é arrumação: este layout é servidor e não sabe
 *    em qual rota está, então a faixa aparecia também na tela de
 *    entrar, contando a quem ainda não passou pela senha se o banco da
 *    campanha está conectado ou não. Quem sabe a rota é o componente
 *    de cliente, que tem o caminho na mão.
 */
/**
 * ⚠️ `data-painel` NÃO É GANCHO DE ESTILO SOLTO — é a fronteira entre a
 *    peça de campanha e a ferramenta de trabalho.
 *
 *    A página usa uma display condensada de cartaz (Anton) nos títulos,
 *    em caixa alta. Ela existe para ser lida de longe por quem passa o
 *    dedo no Instagram. O painel é o oposto disso: um coordenador de
 *    campanha lendo formulário por vinte minutos seguidos, onde caixa
 *    alta cansa e condensada atrapalha a varredura.
 *
 *    Sem esta marca a troca de fonte vazaria para cá sozinha, porque o
 *    painel usa o utilitário `titulo-secao` em doze telas. A regra que
 *    devolve a fonte do corpo está em globals.css, ancorada neste
 *    atributo — uma linha lá, um atributo aqui, e nenhuma das doze
 *    telas precisou ser tocada.
 */
export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <div data-painel className="min-h-screen bg-areia">
      <MenuLateral modoLocal={!config.supabaseAtivo}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </MenuLateral>
    </div>
  )
}
