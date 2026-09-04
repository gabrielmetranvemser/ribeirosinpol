# Pendências

O que falta para esta instalação sair do modelo e ir ao ar. Marque
conforme resolver; acrescente o que aparecer.

> Esta lista nasce cheia: é o estado de uma instalação nova. À medida
> que a campanha entregar os dados, ela esvazia. **Item aqui não se
> inventa** — o certo é continuar em branco até alguém responder.

---

## ⛔ Trava a publicação em domínio próprio

Exigência da lei eleitoral. Sem isto, mantenha o site em URL de
preview (o `robots.ts` já bloqueia a indexação sozinho).

- [ ] **CONFERIR o CNPJ da campanha** — já está preenchido em
      `content/copy.ts` como `CNPJ 68.519.615/0001-62`, **lido da arte
      oficial** (`MARCA/BOLA RIBEIRO 50X50CM.png`, onde a lei já obriga
      a constar). Não foi deduzido, mas também não foi conferido:
      alguém precisa bater os catorze dígitos contra o registro de
      candidatura, uma vez. É o único campo do site cujo erro é
      infração
- [ ] **Nome na urna** — `campanha.nomeUrna` está **vazio de
      propósito**. "Ribeiro do Sinpol" é como ele é conhecido; o nome
      registrado no TSE pode divergir, e é o registrado que vai no
      rodapé. Painel ▸ Identidade ▸ Rodapé
- [ ] **Coligação**, se houver — vazio. Não aparece em nenhuma peça
      entregue. Painel ▸ Identidade ▸ Rodapé
- [ ] **Endereço do comitê** — vazio. Painel ▸ Identidade ▸ Rodapé
- [ ] **CNPJ na moldura** — depois de conferido:
      `CAMPANHA_CNPJ="CNPJ 68.519.615/0001-62" npm run molduras`
- [ ] **Silêncio eleitoral** — `NEXT_PUBLIC_SILENCIO_ELEITORAL_EM` no
      `.env.local`, em UTC. Rondônia é UTC−4, então meia-noite daqui é
      `2026-10-03T04:00:00.000Z` — que é o padrão já escrito em
      `content/campanha.ts`. Confirmar a data da votação e repetir no
      `.env.local`, que é de onde o site lê de verdade
- [ ] **Domínio** comprado e apontado

---

## ⛔ Trava a operação

Sem isto o site está no ar, mas não faz o que veio fazer.

- [ ] **Links dos grupos de WhatsApp** — painel ▸ Grupos, um por
      município. Enquanto vazios, todos aparecem como "em breve"
- [ ] **Supabase conectado** — `sql/01-instalacao.sql`,
      `sql/02-seed-municipios.sql` e as três chaves no `.env.local`
- [ ] **Senha do painel** trocada, e `PAINEL_SESSION_SECRET` gerado
      (`openssl rand -hex 32`)

---

## ✍️ Conteúdo

**A copy inteira foi escrita a partir do `RIBEIRO SITE.docx`** e não
está mais no texto de fábrica. O que sobrou são os dados que o
documento não traz — e que não se inventam.

- [ ] **Número da lei do realinhamento da carreira** (2023). O
      documento conta a conquista e o cronograma, mas não cita a lei.
      Hoje o rótulo do cartão diz `Lei · 2023`; com o número, vira
      `Lei 0.000/2023` — provas ▸ entrega 01
- [ ] **Número da lei da Carteira Azul** — mesma coisa. Hoje o rótulo
      é `+70 entregues`, que está conferido
- [ ] **Endereço do registro público na ALE-RO** —
      `provas.documento.link`, hoje vazio. Precisa ser a página de
      proposições **deste mandato**, aberta e conferida uma vez, não a
      home do portal. Enquanto vazio, o botão "Abrir o registro
      oficial" não aparece (corrigido em `components/site/Provas.tsx`)
- [ ] **Instagram e WhatsApp da campanha** — `content/campanha.ts`,
      hoje vazios: o link some do rodapé em vez de ficar quebrado
- [ ] **Conferir as 8 legendas do álbum e as 3 da rua** contra as
      fotos que forem escolhidas. Cada legenda é um fato do documento,
      mas ninguém garantiu ainda que a foto é daquela cena
- [ ] **Data da política de privacidade** (`privacidade.atualizadoEm`)
      — em branco até alguém revisar o texto e assumir a data

---

## 🖼 Material

- [ ] **Foto principal** — PNG recortado, sem fundo, de corpo inteiro
      (`hero.retrato`). Sem ela o site desenha uma silhueta
- [x] ~~**Logotipo**~~ — a marca **já chegou**, em `MARCA/`. Falta
      subir pelo painel (exige Supabase de pé):
        · `marca.logotipo`  → `HORIZONTALBRANCORIBEIRO2026.png`
        · `marca.lockup`    → `VERTICALCOLORIDORIBEIRO2026.png`
        · `marca.lockupDeitado` → `HORIZONTALCOLORIDORIBEIRO2026.png`
      ⚠️ Os PNGs de "RIBEIRO" são **texto branco**: eles só aparecem
      sobre fundo escuro. Conferir o lockup no claro antes de aprovar
- [ ] **Ícone do navegador**, quadrado, 512×512 (`marca.favicon`)
- [ ] **Cartão do link**, 1200×630 (`marca.cartaoLink`). Sem ele o
      site desenha o cartão com nome e número
- [ ] **Cinco fotos de rua** para o fundo da primeira dobra —
      `public/fundo-1..5.webp`, em cinza no arquivo. Vêm com
      placeholders
- [ ] **Fotos do álbum** (8 espaços) — aqui o álbum **não é de
      infância**: é a trajetória, de 2001 à Assembleia. O documento da
      campanha não traz uma única cena de infância, e legenda de
      família inventada seria o pior lugar possível para inventar
- [ ] **Fotos da rua** (3 espaços) — a "rua" desta campanha é a
      Polícia Civil. ⚠️ crédito de fotógrafo é condição de uso
- [ ] **Vídeos** — ⚠️ os quatro links que vieram no documento são do
      **Instagram**, e o player só aceita **YouTube, Vimeo ou MP4**
      (`lib/video.ts`). Precisam ser reenviados em um desses formatos.
      Enquanto isso a seção "A trilha" some sozinha da página:
        · instagram.com/p/DYBARFSByd6/
        · instagram.com/p/DXkBVVPEVda/
        · instagram.com/p/DUlb4dKkQaS/
        · instagram.com/p/DPHF4xzABP2/
      (e as fotos de 2022: instagram.com/p/DUrXHgejIqg/)

---

## ⚖️ Depende de terceiro

- [ ] **Prints de comentários** (seção Prova social) — autorização de
      uso de imagem de cada pessoa. A seção nasce **desligada**
- [ ] **Menções a processo judicial** — ⛔ não sobe sem o jurídico
      assinando embaixo, nem para dizer que a campanha ganhou
- [ ] **Foto do padrinho político** (`hero.apoio`) — autorização por
      escrito
- [ ] **Pixel da Meta**, se houver tráfego pago — e, junto dele, o
      texto novo da política de privacidade (o painel entrega pronto)

---

## ✅ Testes antes de publicar

- [ ] **O filtro dentro do Instagram, no iPhone e no Android, até
      salvar a foto.** É o que mais falha — faça primeiro
- [ ] `/g/<municipio>` no celular cai no grupo certo
- [ ] trocar o link no painel e reabrir a mesma URL: novo destino sem
      republicar
- [ ] município sem grupo: mensagem tratada, nunca erro
- [ ] colar o link no WhatsApp: cartão com imagem e título
- [ ] cinco municípios distantes entre si conferidos no mapa
- [ ] celular antigo em 4G: teto de 3s até o botão principal ficar
      clicável
- [ ] `sql/09-zerar-metricas.sql` rodado, para o funil não começar com
      os seus próprios cliques
