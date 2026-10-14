export interface DemoLink {
  label: string
  url: string
}

export interface DemoCredential {
  role: string
  url: string
  username: string
  password: string
}

export interface HostedFile {
  name: string
  size: string
  type: 'zip' | 'pdf' | 'psd' | 'ai' | 'figma' | 'apk' | 'other'
  hosting: 'direct' | 'drive' | 'dropbox'
  url: string
}

export interface Seller {
  id: string
  name: string
  shopName: string
  email: string
  avatar?: string
  bio: string
  totalProducts: number
  totalSales: number
  rating: number
  joinedDate: string
  verified: boolean
  categories: string[]
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  image: string
  previewImages: string[]
  downloadFile?: string
  demoUrl?: string
  demoLinks?: DemoLink[]
  demoCredentials?: DemoCredential[]
  hostedFiles?: HostedFile[]
  features: string[]
  rating: number
  reviews: number
  sales: number
  badge?: 'Best Seller' | 'New' | 'Featured' | 'Hot' | 'Free'
  tags: string[]
  sellerId: string
  seller?: Seller
  license: 'Regular' | 'Extended'
  version?: string
  lastUpdated: string
  compatible?: string[]
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  avatar?: string
  rating: number
  comment: string
  date: string
}

export interface CartItem {
  product: Product
  quantity: number
  license: 'Regular' | 'Extended'
}

export interface Order {
  id: string
  customerId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  transactionId?: string
  createdAt: string
  downloadToken?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'seller' | 'admin'
  avatar?: string
  joinedDate: string
  seller?: Seller
}
