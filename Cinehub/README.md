# CineHub

Aplicação de descoberta de filmes e séries com Vue 3, Vite, Vue Router e dados do TMDB.

## Configuração da API

1. Crie uma conta no [TMDB](https://www.themoviedb.org/) e solicite o **API Read Access Token** nas configurações de API.
2. Crie `.env.local` na raiz do projeto (use `.env.example` como modelo) e configure:

   ```env
   TMDB_ACCESS_TOKEN=
   ```

3. Execute `npm run dev`. O comando inicia o proxy Node local e o Vite; o token só é lido pelo servidor intermediário.

Preencha `TMDB_ACCESS_TOKEN` com o API Read Access Token e reinicie o servidor. O frontend usa somente `/api/tmdb/3`; o proxy mantém a credencial no processo Node. Não configure o token com prefixo `VITE_`.

Os arquivos `.env`, `.env.local` e `.env.*.local` são ignorados pelo Git. Não configure o token como `VITE_TMDB_ACCESS_TOKEN`: variáveis com prefixo `VITE_` ficam expostas no navegador. O proxy lê `TMDB_ACCESS_TOKEN` somente no processo Node.

`.env.local` é ignorado pelo Git. Nunca use o prefixo `VITE_` no token: variáveis com esse prefixo são incluídas no bundle do navegador. O proxy em `server/tmdbProxy.js` encaminha somente requisições GET para o host fixo do TMDB e mantém o Bearer token no processo Node. Em produção, implante esse proxy em um backend e configure o servidor web para encaminhar `/api/tmdb/3` para ele; não publique o token no frontend.

`src/services/tmdb.ts` centraliza autenticação Bearer, idioma `pt-BR`, URLs de imagem, cache de respostas, paginação e tratamento de erros de conexão, autenticação e limite de requisições.

## Executar

Com as dependências do projeto instaladas e o token configurado:

```sh
npm run dev
```

Para validar tipos e gerar a versão de produção:

```sh
npm run build
```

Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
