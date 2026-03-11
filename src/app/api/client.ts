// Direct Supabase query layer — no Spring Boot backend needed
import { supabase } from '../../lib/supabase'
import type { Product, Category, Brand, Store } from './types'

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCT_SELECT = `
  id, name, description, image_url, sizes, colors,
  brand:brands(id, name, logo_url),
  category:categories(id, name, slug),
  prices:product_prices(
    id, price, original_price, currency, product_url, in_stock,
    store:stores(id, name, website, logo_url)
  )
`

export async function searchProducts(params: {
  query?: string
  categoryId?: string
  brandId?: string
  storeId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  page?: number
  size?: number
}): Promise<Product[]> {
  let q = supabase.from('products').select(PRODUCT_SELECT)

  if (params.query)      q = q.ilike('name', `%${params.query}%`)
  if (params.categoryId) q = q.eq('category_id', params.categoryId)
  if (params.brandId)    q = q.eq('brand_id', params.brandId)

  const { data, error } = await q.limit(params.size ?? 40)
  if (error) throw error

  let results = (data ?? []).map(mapProduct)

  if (params.storeId)    results = results.filter(p => p.prices?.some(pr => pr.store?.id === params.storeId))
  if (params.minPrice != null) results = results.filter(p => (p.lowestPrice ?? 0) >= params.minPrice!)
  if (params.maxPrice != null) results = results.filter(p => (p.lowestPrice ?? 0) <= params.maxPrice!)

  if      (params.sortBy === 'price_asc')  results.sort((a, b) => (a.lowestPrice ?? 0) - (b.lowestPrice ?? 0))
  else if (params.sortBy === 'price_desc') results.sort((a, b) => (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0))
  else if (params.sortBy === 'name_asc')   results.sort((a, b) => a.name.localeCompare(b.name))

  return results
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return data ? mapProduct(data) : null
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapProduct)
}

export async function getSimilarProducts(productId: string, limit = 4): Promise<Product[]> {
  const { data: current } = await supabase
    .from('products').select('category_id').eq('id', productId).single()
  if (!current) return []

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', current.category_id)
    .neq('id', productId)
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(mapProduct)
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('id, name, slug').order('name')
  if (error) throw error
  return data ?? []
}

export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from('brands').select('id, name, logo_url').order('name')
  if (error) throw error
  return data ?? []
}

export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase.from('stores').select('id, name, website, logo_url').order('name')
  if (error) throw error
  return data ?? []
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function getFavorites(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`product:products(${PRODUCT_SELECT})`)
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((r: any) => r.product).filter(Boolean).map(mapProduct)
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites').select('product_id').eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((r: any) => r.product_id)
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({ user_id: userId, product_id: productId })
  if (error) throw error
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete()
    .eq('user_id', userId).eq('product_id', productId)
  if (error) throw error
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapProduct(raw: any): Product {
  const prices = (raw.prices ?? []).map((p: any) => ({
    id: p.id,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    currency: p.currency ?? '€',
    productUrl: p.product_url,
    inStock: p.in_stock,
    store: p.store
      ? { id: p.store.id, name: p.store.name, website: p.store.website, logoUrl: p.store.logo_url }
      : undefined,
  }))

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    imageUrl: raw.image_url,
    sizes: raw.sizes ?? [],
    colors: raw.colors ?? [],
    brand: raw.brand ? { id: raw.brand.id, name: raw.brand.name, logoUrl: raw.brand.logo_url } : undefined,
    category: raw.category ? { id: raw.category.id, name: raw.category.name, slug: raw.category.slug } : undefined,
    prices,
    storeCount: prices.length,
    lowestPrice: prices.length > 0 ? Math.min(...prices.map((p: any) => p.price)) : 0,
  }
}
