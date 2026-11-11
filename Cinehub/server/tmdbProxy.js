import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envFilePath = resolve(projectRoot, '.env.local')
const port = Number(process.env.TMDB_PROXY_PORT || 4175)
let tokenFileHasWhitespace = false

if (existsSync(envFilePath)) {
  console.info('Arquivo .env.local encontrado.')
  try {
    const tokenLine = readFileSync(envFilePath, 'utf8')
      .split(/\r?\n/)
      .find((line) => /^\s*TMDB_ACCESS_TOKEN\s*=/.test(line))
    if (tokenLine) {
      const rawValue = tokenLine.slice(tokenLine.indexOf('=') + 1)
      const value = rawValue.trim().replace(/^(['"])(.*)\1$/, '$2')
      tokenFileHasWhitespace = rawValue !== rawValue.trim() || /\s/.test(value)
    }
    process.loadEnvFile(envFilePath)
  } catch {
    console.error('Não foi possível carregar .env.local. Verifique a sintaxe do arquivo.')
  }
} else {
  console.warn('Arquivo .env.local não encontrado na raiz do projeto.')
}

const configuredToken = process.env.TMDB_ACCESS_TOKEN
const hasWhitespace = tokenFileHasWhitespace ||
  (typeof configuredToken === 'string' && /\s/.test(configuredToken))
const token = configuredToken && configuredToken.trim() && !hasWhitespace
  ? configuredToken
  : undefined

if (token) {
  console.info('Variável TMDB_ACCESS_TOKEN carregada.')
} else if (hasWhitespace) {
  console.error('TMDB_ACCESS_TOKEN contém espaços ou quebras de linha; revise .env.local sem compartilhar a credencial.')
} else {
  console.warn('TMDB_ACCESS_TOKEN não configurado. Adicione o API Read Access Token em .env.local.')
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost')

  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' }).end()
    return
  }

  if (!/^\/api\/tmdb\/3\/[a-zA-Z0-9/_-]+$/.test(requestUrl.pathname) ||
      requestUrl.pathname.split('/').includes('..')) {
    response.writeHead(404).end()
    return
  }

  if (!token) {
    response.writeHead(503, {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    })
    response.end(JSON.stringify({
      source: 'cinehub-proxy',
      status_message: hasWhitespace
        ? 'TMDB_ACCESS_TOKEN contém espaços ou quebras de linha. Corrija .env.local e reinicie npm run dev.'
        : 'TMDB_ACCESS_TOKEN não está configurado. Adicione o API Read Access Token em .env.local e reinicie npm run dev.',
    }))
    return
  }

  const apiPath = requestUrl.pathname.replace(/^\/api\/tmdb/, '')
  const targetUrl = new URL(`https://api.themoviedb.org${apiPath}`)
  targetUrl.search = requestUrl.search
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const apiResponse = await fetch(targetUrl, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
    const body = Buffer.from(await apiResponse.arrayBuffer())
    const headers = {
      'Cache-Control': 'no-store',
      'Content-Type': apiResponse.headers.get('Content-Type') || 'application/json',
    }
    const retryAfter = apiResponse.headers.get('Retry-After')
    if (retryAfter) headers['Retry-After'] = retryAfter
    response.writeHead(apiResponse.status, headers)
    response.end(body)
  } catch {
    console.error('Falha ao encaminhar requisição ao TMDB.')
    if (!response.destroyed && !response.headersSent) {
      response.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      response.end(JSON.stringify({ status_message: 'O serviço TMDB está temporariamente indisponível.' }))
    } else if (!response.destroyed) {
      response.destroy()
    }
  } finally {
    clearTimeout(timeout)
  }
})

server.listen(port, '127.0.0.1', () => {
  console.info(`Proxy TMDB ativo em http://127.0.0.1:${port}`)
})

server.on('error', () => {
  console.error(`Não foi possível iniciar o proxy TMDB na porta ${port}. Verifique se a porta já está em uso.`)
  process.exit(1)
})
