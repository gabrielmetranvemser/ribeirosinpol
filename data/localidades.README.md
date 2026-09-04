# `localidades.json` — os distritos com grupo próprio

Vazio é o estado normal. Este arquivo existe para o caso em que **um
distrito é grande o bastante para merecer o próprio grupo de
WhatsApp**, separado do da sede do município.

Acontece mais do que parece: um distrito a 90 km da sede, com escola,
comércio e cinco mil pessoas, não se sente representado por um grupo
com o nome da cidade grande — e a pessoa de lá não entra.

## Formato

```json
[
  {
    "slug": "nome-do-distrito",
    "nome": "Nome do Distrito",
    "municipioSlug": "municipio-a-que-pertence",
    "ordem": 2
  }
]
```

- **`slug`** vira a URL: `/g/nome-do-distrito`;
- **`municipioSlug`** precisa existir em `municipios.json`;
- **`ordem`** é a linha da tabela `grupos` daquele município que
  pertence a este distrito. A sede usa a ordem 1, então o primeiro
  distrito usa 2, o segundo 3, e assim por diante.

## O que o site faz com isto

O distrito **não entra na contagem** de municípios nem no mapa: ele é
um destino a mais, oferecido na lista e no mapa dentro do município a
que pertence.

Os dois destinos são independentes de propósito. `/g/nome-do-distrito`
tem uma linha só, a dele, e **não cai para a sede** se estiver cheio.
Do outro lado, a sede também não herda o grupo do distrito — quem
clicou na cidade quer a cidade, e mandar essa pessoa para o grupo do
distrito seria trocar o destino por baixo do pano. O que existe é a
escolha, e ela é oferecida.

## Depois de editar

O grupo do distrito precisa existir no banco, com a mesma `ordem`:

```sql
insert into public.grupos (municipio_slug, ordem, status, fixado, limite_cliques)
values ('municipio-a-que-pertence', 2, 'em_breve', false, 700)
on conflict (municipio_slug, ordem) do nothing;
```
