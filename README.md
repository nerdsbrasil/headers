# headers

Galeria de headers da comunidade e **API de imagens**: os mesmos headers do site,
gerados sob demanda a partir de parâmetros (ex.: boas-vindas com o nome e a foto
de quem acabou de entrar no Discord).

## Rodando local

```bash
bun install
bun dev        # galeria em /, gradiente em /gradiente, novo header em /novo
bun run export # gera os PNGs fixos em public/exports (botão "Baixar PNG")
```

## O que fica no ar

Em produção **só a API de imagens responde**. Galeria, `/gradiente` e `/novo` são
ferramentas locais (`bun dev`) e devolvem 404 no servidor hospedado, junto com as
rotas que gravam arquivos. Precisa de um header novo? Peça no chat com o Claude,
rodando o projeto local.

| Rota | Local (`bun dev`) | Hospedado |
| --- | --- | --- |
| `/api/render/<header>` | sim | **sim** (com a chave) |
| `/api/headers` | sim | só com a chave |
| `/render/<slug>/<WxH>` | sim | só com a chave (é o que o Chrome fotografa) |
| `/`, `/gradiente`, `/novo` | sim | 404 |
| `/api/gradient`, `/api/export` | sim | 404 |

Quem faz esse corte é o `proxy.ts`.

## API de imagens

```
GET /api/render/<header>?<params>   →  image/png
```

| | |
| --- | --- |
| Autenticação | cabeçalho `x-api-key` (ou `?key=`) igual a `RENDER_API_KEY`. A chave local fica em `.env.local`, que não vai para o Git. |
| Tamanho | `?size=1200x600` (padrão e único tamanho oficial hoje) |
| Erros | JSON com `error`; 401 chave, 400 parâmetro inválido, 404 header inexistente |
| Headers disponíveis | `GET /api/headers` |

### `boas-vindas`

| Parâmetro | Regra |
| --- | --- |
| `username` | texto, até 24 caracteres (nomes maiores são cortados com “…”) |
| `avatar` | URL `https` de `cdn.discordapp.com` ou `media.discordapp.net` |

```bash
curl -H "x-api-key: $RENDER_API_KEY" \
  "https://SEU-DOMINIO/api/render/boas-vindas?username=audibert&avatar=https%3A%2F%2Fcdn.discordapp.com%2Favatars%2F.../a.png%3Fsize%3D256" \
  --output boas-vindas.png
```

Nada é salvo em disco: o PNG volta na resposta.

### No bot (discord.js)

```js
client.on("guildMemberAdd", async (member) => {
  if (member.user.bot) return; // só pessoas

  const url = new URL("https://SEU-DOMINIO/api/render/boas-vindas");
  url.searchParams.set("username", member.displayName);
  url.searchParams.set("avatar", member.displayAvatarURL({ extension: "png", size: 256 }));

  const res = await fetch(url, { headers: { "x-api-key": process.env.RENDER_API_KEY } });
  if (!res.ok) return console.error("header falhou", res.status, await res.text());
  const png = Buffer.from(await res.arrayBuffer());

  const canal = await member.guild.channels.fetch(process.env.CANAL_BOAS_VINDAS);
  await canal.send({
    content: `${member}`, // menciona o membro
    files: [{ attachment: png, name: "boas-vindas.png" }],
  });
});
```

O bot precisa da intent **Server Members** ligada no Developer Portal e das
permissões de enviar mensagens e anexar arquivos no canal.

## Deploy (VPS com Docker)

A imagem é baseada na do Playwright, que já traz o Chromium.

```bash
RENDER_API_KEY=uma-chave-secreta docker compose up -d --build
```

| Variável | Para quê |
| --- | --- |
| `RENDER_API_KEY` | chave que o bot envia; sem ela a API fica aberta |
| `RENDER_ORIGIN` | de onde o Chrome carrega a página (padrão `http://127.0.0.1:3000`, o próprio container) |
| `CHROME_CHANNEL` | vazio usa o Chromium do Playwright; `chrome` usa o Chrome instalado (é o padrão no `bun dev`) |

Recomendado: 1 GB de RAM e um proxy (nginx, Caddy) na frente com HTTPS.

## Criando headers

- `/novo` cria o header com um espaço reservado no meio e registra o pedido em `pedidos/`.
- Um header vira modelo da API declarando `params` e `sample` em `headers/<slug>.tsx`.
- As regras de design e o fluxo completo estão no `CLAUDE.md`.
