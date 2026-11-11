export type CatalogItemType = 'movie' | 'series'

export type MovieCollection =
  | 'popular'
  | 'now_playing'
  | 'upcoming'
  | 'top_rated'
  | 'trending'

export type SeriesCollection = 'popular' | 'top_rated' | 'trending' | 'on_the_air'

export interface CatalogItem {
  id: string
  tmdbId: number
  title: string
  originalTitle: string
  caption: string
  poster: string
  backdrop: string
  type: CatalogItemType
  description: string
  rating?: number
  releaseYear?: number
  releaseDate?: string
  genres: string[]
  genreIds: number[]
  durationMinutes?: number
  cast: string[]
  director?: string
  trailerUrl?: string
  status?: string
  tagline?: string
  originalLanguage?: string
  popularity?: number
  seasons?: number
  episodes?: number
  relatedItems: CatalogItem[]
}

export interface CatalogPage {
  items: CatalogItem[]
  page: number
  totalPages: number
  totalResults: number
}

export interface CatalogGenre {
  name: string
  movieId?: number
  seriesId?: number
}

export interface SearchFilters {
  query: string
  type: CatalogItemType | ''
  genre: string
  year: string
  rating: string
  page: number
}
