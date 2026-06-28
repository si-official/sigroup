export interface Product {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string
  price: number
  originalPrice?: number
  category: string
  image: string
  previewImages: string[]
  downloadFile?: string
  features: string[]
  rating: number
  reviews: number
  badge?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  transactionId?: string
  createdAt: string
  downloadToken?: string
}
