import type {
  CatalogGenre,
  CatalogItem,
  CatalogItemType,
  CatalogPage,
  MovieCollection,
  SearchFilters,
  SeriesCollection,
} from '../types/catalog'

const apiBaseUrl = '/api/tmdb/3'
const imageBaseUrl = 'https://image.tmdb.org/t/p'
const cacheDurationMs = 5 * 60 * 1000
const maxRetries = 2
const responseCache = new Map<string, { expiresAt: number; value: unknown }>()
const genreCache = new Map<CatalogItemType, Map<number, string>>()
const inFlightRequests = new Map<string, {
  controller: AbortController
  consumers: number
  promise: Promise<unknown>
}>()

export class TmdbApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryAfterSeconds?: number,
    readonly statusCode?: number,
    readonly statusMessage?: string,
    readonly responseBody?: string,
  ) {
    super(message)
    this.name = 'TmdbApiError'
  }
}

interface TmdbResult {
  id: number
  media_type?: 'movie' | 'tv' | 'person'
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  genre_ids?: number[]
  genres?: Array<{ id: number; name: string }>
  vote_average?: number
  release_date?: string
  first_air_date?: string
  runtime?: number
  episode_run_time?: number[]
  status?: string
  tagline?: string
  original_language?: string
  popularity?: number
  number_of_seasons?: number
  number_of_episodes?: number
  created_by?: Array<{ name: string }>
  credits?: {
    cast?: Array<{ name: string }>
    crew?: Array<{ name: string; job: string }>
  }
  videos?: {
    results?: Array<{
      key: string
      site: string
      type: string
      official?: boolean
    }>
  }
  similar?: {
    results?: TmdbResult[]
  }
}

interface TmdbPage {
  page: number
  total_pages: number
  total_results: number
  results: TmdbResult[]
}

interface TmdbGenrePage {
  genres: Array<{ id: number; name: string }>
}

interface TmdbErrorBody {
  status_code?: number
  status_message?: string
}

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError')
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError()
}

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(abortError())

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, milliseconds)
    const onAbort = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      reject(abortError())
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function retryAfterSeconds(response: Response): number | undefined {
  const value = response.headers.get('Retry-After')
  if (!value) return undefined

  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) return seconds

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? undefined : Math.max(0, Math.ceil((timestamp - Date.now()) / 1000))
}

async function fetchWithRetry(url: string, signal: AbortSignal): Promise<Response> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal,
      })
      if (![500, 502, 503, 504].includes(response.status) || attempt >= maxRetries) {
        return response
      }

      await response.body?.cancel()
      await wait(300 * (2 ** attempt), signal)
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        throw abortError()
      }
      if (attempt >= maxRetries) {
        throw new TmdbApiError(
          'Não foi possível conectar ao TMDB após novas tentativas. Verifique a conexão e tente novamente.',
        )
      }
      await wait(300 * (2 ** attempt), signal)
    }
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const responseBody = await response.text()
  try {
    return JSON.parse(responseBody) as T
  } catch {
    throw new TmdbApiError('O TMDB retornou uma resposta inválida.', response.status, undefined, undefined, undefined, responseBody)
  }
}

async function createApiError(response: Response): Promise<TmdbApiError> {
  const responseBody = await response.text()
  let body: TmdbErrorBody | undefined
  try {
    body = JSON.parse(responseBody) as TmdbErrorBody
  } catch {
    body = undefined
  }

  const statusCode = typeof body?.status_code === 'number' ? body.status_code : undefined
  const statusMessage = typeof body?.status_message === 'string' ? body.status_message : undefined
  const retryAfter = retryAfterSeconds(response)
  const messages: Record<number, string> = {
    401: 'Autenticação recusada pelo TMDB. Confira se TMDB_ACCESS_TOKEN contém um API Read Access Token válido.',
    403: 'O TMDB recusou o acesso. Verifique as permissões do token e da conta.',
    429: retryAfter !== undefined
      ? `O limite de requisições do TMDB foi atingido. Retry-After: ${retryAfter} segundos.`
      : 'O limite de requisições do TMDB foi atingido. Aguarde antes de tentar novamente.',
    500: 'O TMDB retornou um erro interno (HTTP 500).',
    503: 'O TMDB está temporariamente indisponível (HTTP 503).',
  }
  const bodySummary = responseBody || '(corpo vazio)'
  const apiFields = [
    statusCode === undefined ? undefined : `status_code=${statusCode}`,
    statusMessage === undefined ? undefined : `status_message=${statusMessage}`,
  ].filter(Boolean).join('; ')
  const message = [
    messages[response.status] ?? `O TMDB respondeu com HTTP ${response.status}.`,
    apiFields,
    `Resposta completa: ${bodySummary}`,
  ].filter(Boolean).join(' ')

  return new TmdbApiError(
    message,
    response.status,
    retryAfter,
    statusCode,
    statusMessage,
    responseBody,
  )
}

export function getPosterUrl(path?: string | null): string {
  return path ? `${imageBaseUrl}/w500${path}` : '/poster-placeholder.svg'
}

export function getBackdropUrl(path?: string | null): string {
  return path ? `${imageBaseUrl}/original${path}` : '/poster-placeholder.svg'
}

async function tmdbGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  signal?: AbortSignal,
): Promise<T> {
  const search = new URLSearchParams({ language: 'pt-BR' })
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).trim()) search.set(key, String(value))
  }

  const url = `${apiBaseUrl}${path}?${search.toString()}`
  throwIfAborted(signal)
  const cached = responseCache.get(url)
  if (cached && cached.expiresAt > Date.now()) return cached.value as T
  if (cached) responseCache.delete(url)

  let request = inFlightRequests.get(url)
  if (!request) {
    const controller = new AbortController()
    const promise = (async () => {
      const response = await fetchWithRetry(url, controller.signal)
      if (!response.ok) throw await createApiError(response)
      const data = await parseResponse<T>(response)
      responseCache.set(url, { expiresAt: Date.now() + cacheDurationMs, value: data })
      return data
    })()
    request = { controller, consumers: 0, promise }
    inFlightRequests.set(url, request)
    const currentRequest = request
    void promise.then(
      () => {
        if (inFlightRequests.get(url) === currentRequest) inFlightRequests.delete(url)
      },
      () => {
        if (inFlightRequests.get(url) === currentRequest) inFlightRequests.delete(url)
      },
    )
  }

  const activeRequest = request
  activeRequest.consumers += 1

  return new Promise<T>((resolve, reject) => {
    let released = false
    const release = () => {
      if (released) return
      released = true
      signal?.removeEventListener('abort', onAbort)
      activeRequest.consumers -= 1
      if (activeRequest.consumers === 0 && inFlightRequests.get(url) === activeRequest) {
        inFlightRequests.delete(url)
        activeRequest.controller.abort()
      }
    }
    const onAbort = () => {
      release()
      reject(abortError())
    }

    signal?.addEventListener('abort', onAbort, { once: true })
    activeRequest.promise.then(
      (data) => {
        if (released) return
        release()
        resolve(data as T)
      },
      (error: unknown) => {
        if (released) return
        release()
        reject(error)
      },
    )
  })
}

async function getGenreMap(type: CatalogItemType, signal?: AbortSignal): Promise<Map<number, string>> {
  const cached = genreCache.get(type)
  if (cached) return cached

  const mediaType = type === 'movie' ? 'movie' : 'tv'
  const { genres } = await tmdbGet<TmdbGenrePage>(`/genre/${mediaType}/list`, {}, signal)
  const genreMap = new Map(genres.map(({ id, name }) => [id, name]))
  genreCache.set(type, genreMap)
  return genreMap
}

export async function getGenres(signal?: AbortSignal): Promise<CatalogGenre[]> {
  const [movieGenres, seriesGenres] = await Promise.all([
    getGenreMap('movie', signal),
    getGenreMap('series', signal),
  ])
  const genres = new Map<string, CatalogGenre>()

  for (const [id, name] of movieGenres) {
    genres.set(name, { name, movieId: id })
  }
  for (const [id, name] of seriesGenres) {
    const existing = genres.get(name)
    genres.set(name, { ...existing, name, seriesId: id })
  }

  return [...genres.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export async function getCatalogCollection(
  type: CatalogItemType,
  collection: MovieCollection | SeriesCollection,
  page = 1,
  signal?: AbortSignal,
): Promise<CatalogPage> {
  const category = collection === 'trending'
    ? '/trending'
    : type === 'movie' ? '/movie' : '/tv'
  const suffix = collection === 'trending' ? `/${type === 'movie' ? 'movie' : 'tv'}/week` : `/${collection}`
  const [result, genres] = await Promise.all([
    tmdbGet<TmdbPage>(`${category}${suffix}`, { page }, signal),
    getGenreMap(type, signal),
  ])
  return mapPage(result, type, genres)
}

export async function searchSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<CatalogItem[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []

  const [result, movieGenres, seriesGenres] = await Promise.all([
    tmdbGet<TmdbPage>('/search/multi', { query: normalizedQuery, include_adult: 'false' }, signal),
    getGenreMap('movie', signal),
    getGenreMap('series', signal),
  ])

  return result.results
    .filter((entry) => entry.media_type === 'movie' || entry.media_type === 'tv')
    .map((entry) =>
      mapResult(entry, entry.media_type === 'movie' ? 'movie' : 'series',
        entry.media_type === 'movie' ? movieGenres : seriesGenres),
    )
    .slice(0, 6)
}

export async function searchCatalog(
  filters: SearchFilters,
  signal?: AbortSignal,
): Promise<CatalogPage> {
  const query = filters.query.trim()
  const types: CatalogItemType[] = filters.type
    ? [filters.type]
    : ['movie', 'series']
  const [pages, genreMaps] = await Promise.all([
    Promise.all(types.map((type) => searchType(type, filters, signal))),
    Promise.all(types.map((type) => getGenreMap(type, signal))),
  ])

  const items = pages.flatMap((page, index) => {
    const type = types[index]
    const genreMap = genreMaps[index]
    if (!type || !genreMap) return []

    return page.results
      .filter((entry) => matchesFilters(entry, type, filters, genreMap))
      .map((entry) => mapResult(entry, type, genreMap))
  })

  return {
    items: items.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)),
    page: filters.page,
    totalPages: Math.max(1, ...pages.map((page) => page.total_pages)),
    totalResults: pages.reduce((total, page) => total + page.total_results, 0),
  }
}

async function searchType(
  type: CatalogItemType,
  filters: SearchFilters,
  signal?: AbortSignal,
): Promise<TmdbPage> {
  const mediaType = type === 'movie' ? 'movie' : 'tv'
  const params: Record<string, string | number | undefined> = { page: filters.page }
  const shouldDiscover = !filters.query.trim()
  if (shouldDiscover) {
    if (filters.genre) {
      const genreMap = await getGenreMap(type, signal)
      const genreId = [...genreMap].find(([, name]) => name === filters.genre)?.[0]
      params.with_genres = genreId
    }
    if (filters.rating) params['vote_average.gte'] = Number(filters.rating)
    if (filters.year) {
      params[type === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = Number(filters.year)
    }
  }
  if (filters.query.trim()) params.query = filters.query.trim()
  if (filters.query.trim() && filters.year) {
    params[type === 'movie' ? 'year' : 'first_air_date_year'] = Number(filters.year)
  }

  const hasDiscoverFilters = shouldDiscover && (filters.genre || filters.rating || filters.year)
  const endpoint = hasDiscoverFilters
    ? `/discover/${mediaType}`
    : filters.query.trim() ? `/search/${mediaType}` : `/${mediaType}/popular`
  return tmdbGet<TmdbPage>(endpoint, params, signal)
}

export async function getCatalogItem(
  id: string | number,
  type: CatalogItemType,
  signal?: AbortSignal,
): Promise<CatalogItem | undefined> {
  if (!/^\d+$/.test(String(id))) return undefined

  const mediaType = type === 'movie' ? 'movie' : 'tv'
  try {
    const [result, genres] = await Promise.all([
      tmdbGet<TmdbResult>(
        `/${mediaType}/${id}`,
        { append_to_response: 'credits,videos,similar' },
        signal,
      ),
      getGenreMap(type, signal),
    ])
    const item = mapResult(result, type, genres)
    const director = result.credits?.crew?.find(({ job }) => job === 'Director')?.name
    item.cast = result.credits?.cast?.slice(0, 10).map(({ name }) => name) ?? []
    item.director = director ?? result.created_by?.map(({ name }) => name).join(', ')
    item.durationMinutes = type === 'movie'
      ? result.runtime
      : result.episode_run_time?.[0]
    item.status = result.status
    item.tagline = result.tagline
    item.originalLanguage = result.original_language
    item.seasons = result.number_of_seasons
    item.episodes = result.number_of_episodes
    const trailer = result.videos?.results?.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official,
    ) ?? result.videos?.results?.find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer',
    )
    item.trailerUrl = trailer
      ? `https://www.youtube-nocookie.com/embed/${trailer.key}`
      : undefined
    item.relatedItems = (result.similar?.results ?? [])
      .slice(0, 12)
      .map((related) => mapResult(related, type, genres))
    return item
  } catch (error) {
    if (error instanceof TmdbApiError && error.status === 404) return undefined
    throw error
  }
}

function mapPage(page: TmdbPage, type: CatalogItemType, genres: Map<number, string>): CatalogPage {
  return {
    items: page.results.map((entry) => mapResult(entry, type, genres)),
    page: page.page,
    totalPages: page.total_pages,
    totalResults: page.total_results,
  }
}

function mapResult(
  result: TmdbResult,
  type: CatalogItemType,
  genreMap: Map<number, string>,
): CatalogItem {
  const title = result.title ?? result.name ?? ''
  const originalTitle = result.original_title ?? result.original_name ?? title
  const genreIds = result.genres?.map(({ id }) => id) ?? result.genre_ids ?? []
  const genres = result.genres?.map(({ name }) => name) ??
    genreIds.flatMap((id) => genreMap.has(id) ? [genreMap.get(id)!] : [])
  const date = result.release_date ?? result.first_air_date
  const year = date ? Number(date.slice(0, 4)) : undefined

  return {
    id: `${type === 'movie' ? 'movie' : 'series'}:${result.id}`,
    tmdbId: result.id,
    title,
    originalTitle,
    caption: [genres.join(' • '), type === 'movie' ? undefined : 'Série', year]
      .filter(Boolean)
      .join(' • '),
    poster: getPosterUrl(result.poster_path),
    backdrop: getBackdropUrl(result.backdrop_path),
    type,
    description: result.overview ?? '',
    rating: result.vote_average,
    releaseYear: year,
    releaseDate: date,
    genres,
    genreIds,
    durationMinutes: result.runtime ?? result.episode_run_time?.[0],
    cast: [],
    status: result.status,
    tagline: result.tagline,
    originalLanguage: result.original_language,
    popularity: result.popularity,
    seasons: result.number_of_seasons,
    episodes: result.number_of_episodes,
    relatedItems: [],
  }
}

function matchesFilters(
  result: TmdbResult,
  type: CatalogItemType,
  filters: SearchFilters,
  genreMap: Map<number, string> | undefined,
): boolean {
  if (filters.year) {
    const releaseDate = result.release_date ?? result.first_air_date
    if (!releaseDate?.startsWith(filters.year)) return false
  }
  if (filters.genre && genreMap) {
    const genreIds = result.genre_ids ?? result.genres?.map(({ id }) => id) ?? []
    const genreId = [...genreMap].find(([, name]) => name === filters.genre)?.[0]
    if (genreId && !genreIds.includes(genreId)) return false
  }
  if (filters.rating && (result.vote_average ?? 0) < Number(filters.rating)) return false
  return type === 'movie' || type === 'series'
}
