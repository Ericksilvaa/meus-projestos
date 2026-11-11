import type {
  CatalogItem,
  CatalogItemType,
  MovieCollection,
  SeriesCollection,
} from '../types/catalog'
import { getCatalogCollection, getCatalogItem as loadTmdbItem } from './tmdb'

export function getCatalogItems(
  type: CatalogItemType,
  collection: MovieCollection | SeriesCollection,
  page = 1,
  signal?: AbortSignal,
) {
  return getCatalogCollection(type, collection, page, signal)
}

export function getCatalogItem(
  id: string | number,
  type: CatalogItemType,
  signal?: AbortSignal,
): Promise<CatalogItem | undefined> {
  return loadTmdbItem(id, type, signal)
}

export async function loadCatalogItem(
  id: string | number,
  type: CatalogItemType,
  signal?: AbortSignal,
): Promise<CatalogItem | undefined> {
  return loadTmdbItem(id, type, signal)
}

export function getRelatedCatalogItems(item: CatalogItem): CatalogItem[] {
  return item.relatedItems
}
