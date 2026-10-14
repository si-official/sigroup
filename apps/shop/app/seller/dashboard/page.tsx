'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'

const mockProducts = [
  { id: 'p1', name: 'Restaurant POS System', slug: 'restaurant-pos-system', price: 4500, sales: 324, views: 8240, revenue: 1236600, status: 'active', rating: 4.9, category: 'Software', thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=70' },
  { id: 'p4', name: 'School ERP System — Bangladesh Edition', slug: 'school-erp-system', price: 7500, sales: 145, views: 3920, revenue: 924750, status: 'active', rating: 4.9, category: 'Software', thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=80&q=70' },
  { id: 'p7', name: 'Inventory Management + POS PHP Script', slug: 'inventory-pos-php-script', price: 2200, sales: 234, views: 5100, revenue: 436260, status: 'active', rating: 4.4, category: 'PHP Scripts', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=80&q=70' },
  { id: 'p11', name: 'Hospital Management System — Complete', slug: 'hospital-management-system', price: 12000, sales: 67, views: 2860, revenue: 684000, status: 'pending', rating: 4.9, category: 'Software', thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=80&q=70' },
]

const mockOrders = [
  { id: 'ORD-2025-001', product: 'Restaurant POS System', customer: 'Alam Khan', email: 'alam@example.com', amount: 4500, date: '2025-07-02', license: 'Regular', status: 'completed' },
  { id: 'ORD-2025-002', product: 'School ERP System', customer: 'Ritu Sharma', email: 'ritu@example.com', amount: 7500, date: '2025-07-01', license: 'Regular', status: 'completed' },
  { id: 'ORD-2025-003', product: 'Inventory + POS Script', customer: 'Faruk Ahmed', email: 'faruk@example.com', amount: 2200, date: '2025-06-30', license: 'Regular', status: 'completed' },
  { id: 'ORD-2025-004', product: 'Restaurant POS System', customer: 'Sadia Islam', email: 'sadia@example.com', amount: 4500, date: '2025-06-29', license: 'Extended', status: 'pending' },
  { id: 'ORD-2025-005', product: 'Hospital Management System', customer: 'Dr. Kamal Hossain', email: 'kamal@hospital.com', amount: 12000, date: '2025-06-28', license: 'Extended', status: 'completed' },
]

const earningsHistory = [
  { month: 'Jan', gross: 124000, fee: 18600, net: 105400 },
  { month: 'Feb', gross: 98000, fee: 14700, net: 83300 },
  { month: 'Mar', gross: 215000, fee: 32250, net: 182750 },
  { month: 'Apr', gross: 187000, fee: 28050, net: 158950 },
  { month: 'May', gross: 302000, fee: 45300, net: 256700 },
  { month: 'Jun', gross: 256000, fee: 38400, net: 217600 },
  { month: 'Jul', gross: 95000, fee: 14250, net: 80750 },
]

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
}

const subCategories: Record<string, string[]> = {
  'Software': ['Business ERP', 'Point of Sale', 'Accounting', 'HR System', 'CRM', 'Healthcare', 'Education', 'Other'],
  'Mobile Apps': ['E-Commerce', 'Food Delivery', 'Healthcare', 'Education', 'Social', 'Finance', 'News', 'Other'],
  'HTML Templates': ['Landing Page', 'Portfolio', 'Blog', 'Admin Dashboard', 'E-Commerce', 'Other'],
  'WordPress Plugins': ['Payment Gateway', 'WooCommerce', 'SEO', 'Security', 'Forms', 'Other'],
  'UI Kits': ['Landing Page', 'Admin', 'Mobile', 'E-Commerce', 'Other'],
  'PHP Scripts': ['Business', 'CMS', 'Social', 'Forum', 'Other'],
  'Themes': ['WordPress', 'Shopify', 'Ghost', 'Other'],
  'JavaScript': ['Node.js', 'React', 'Vue', 'Angular', 'jQuery', 'Other'],
}

type Tab = 'overview' | 'products' | 'add' | 'orders' | 'earnings' | 'analytics' | 'settings'

interface VendorProduct {
  id: string
  title: string
  slug: string
  shortDesc: string
  fullDesc: string
  category: string
  subcategory: string
  tags: string
  livePreviewUrl: string
  regularPrice: number
  extendedPrice: number
  comparePrice: number
  isFree: boolean
  thumbnail: string
  screenshots: { url: string; caption: string }[]
  demoLinks: { label: string; url: string }[]
  demoCreds: { role: string; url: string; username: string; password: string }[]
  hostedFiles: { name: string; size: string; hosting: 'direct' | 'drive' | 'dropbox'; link: string }[]
  metaTitle: string
  metaDesc: string
  status: 'draft' | 'pending' | 'active' | 'rejected'
  createdAt: string
}

interface Withdrawal {
  id: string
  amount: number
  method: string
  account: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`${color} rounded-xl p-5 border`}>
      <p className="font-black text-2xl leading-none mb-1">{value}</p>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function SellerDashboard() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // ── Vendor products from localStorage ──
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('si_vendor_products')
      if (stored) setVendorProducts(JSON.parse(stored))
      const wStored = localStorage.getItem('si_vendor_withdrawals')
      if (wStored) setWithdrawals(JSON.parse(wStored))
    } catch {}
  }, [])

  const saveVendorProducts = (products: VendorProduct[]) => {
    setVendorProducts(products)
    localStorage.setItem('si_vendor_products', JSON.stringify(products))
  }

  const saveWithdrawals = (wds: Withdrawal[]) => {
    setWithdrawals(wds)
    localStorage.setItem('si_vendor_withdrawals', JSON.stringify(wds))
  }

  // ── Add Product form state ──
  const [productTitle, setProductTitle] = useState('')
  const [productCat, setProductCat] = useState('Software')
  const [productSubCat, setProductSubCat] = useState('Business ERP')
  const [shortDesc, setShortDesc] = useState('')
  const [fullDesc, setFullDesc] = useState('')
  const [tags, setTags] = useState('')
  const [livePreviewUrl, setLivePreviewUrl] = useState('')
  const [regularPrice, setRegularPrice] = useState('')
  const [extendedPrice, setExtendedPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [enableExtended, setEnableExtended] = useState(false)
  const [thumbnail, setThumbnail] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [productStatus, setProductStatus] = useState<'draft' | 'pending' | 'active'>('draft')
  const [submitted, setSubmitted] = useState(false)

  const [screenshots, setScreenshots] = useState<{ url: string; caption: string }[]>([])
  const addScreenshot = () => { if (screenshots.length < 5) setScreenshots([...screenshots, { url: '', caption: '' }]) }
  const removeScreenshot = (i: number) => setScreenshots(screenshots.filter((_, idx) => idx !== i))
  const updateScreenshot = (i: number, field: 'url' | 'caption', val: string) =>
    setScreenshots(screenshots.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const [demoLinks, setDemoLinks] = useState([{ label: '', url: '' }])
  const addDemoLink = () => { if (demoLinks.length < 5) setDemoLinks([...demoLinks, { label: '', url: '' }]) }
  const removeDemoLink = (i: number) => setDemoLinks(demoLinks.filter((_, idx) => idx !== i))
  const updateDemoLink = (i: number, field: 'label' | 'url', val: string) =>
    setDemoLinks(demoLinks.map((l, idx) => idx === i ? { ...l, [field]: val } : l))

  const [demoCreds, setDemoCreds] = useState([{ role: '', url: '', username: '', password: '' }])
  const addCred = () => { if (demoCreds.length < 3) setDemoCreds([...demoCreds, { role: '', url: '', username: '', password: '' }]) }
  const removeCred = (i: number) => setDemoCreds(demoCreds.filter((_, idx) => idx !== i))
  const updateCred = (i: number, field: 'role' | 'url' | 'username' | 'password', val: string) =>
    setDemoCreds(demoCreds.map((c, idx) => idx === i ? { ...c, [field]: val } : c))

  type FileEntry = { name: string; size: string; hosting: 'direct' | 'drive' | 'dropbox'; link: string }
  const [hostedFiles, setHostedFiles] = useState<FileEntry[]>([])
  const [fileHostingMode, setFileHostingMode] = useState<'direct' | 'drive' | 'dropbox'>('drive')
  const [fileLink, setFileLink] = useState('')
  const addFileLink = () => {
    if (!fileLink) return
    setHostedFiles([...hostedFiles, { name: fileLink.split('/').pop() || 'file', size: '—', hosting: fileHostingMode, link: fileLink }])
    setFileLink('')
  }
  const removeFile = (i: number) => setHostedFiles(hostedFiles.filter((_, idx) => idx !== i))

  const slug = productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const resetForm = () => {
    setProductTitle(''); setShortDesc(''); setFullDesc(''); setProductCat('Software')
    setProductSubCat('Business ERP'); setTags(''); setLivePreviewUrl('')
    setRegularPrice(''); setExtendedPrice(''); setComparePrice(''); setIsFree(false)
    setEnableExtended(false); setThumbnail(''); setMetaTitle(''); setMetaDesc('')
    setProductStatus('draft'); setScreenshots([]); setDemoLinks([{ label: '', url: '' }])
    setDemoCreds([{ role: '', url: '', username: '', password: '' }]); setHostedFiles([])
    setEditingProduct(null)
  }

  const loadProductIntoForm = (p: VendorProduct) => {
    setProductTitle(p.title); setShortDesc(p.shortDesc); setFullDesc(p.fullDesc)
    setProductCat(p.category); setProductSubCat(p.subcategory); setTags(p.tags)
    setLivePreviewUrl(p.livePreviewUrl); setRegularPrice(String(p.regularPrice))
    setExtendedPrice(String(p.extendedPrice)); setComparePrice(String(p.comparePrice))
    setIsFree(p.isFree); setEnableExtended(p.extendedPrice > 0)
    setThumbnail(p.thumbnail); setMetaTitle(p.metaTitle); setMetaDesc(p.metaDesc)
    setProductStatus(p.status === 'rejected' ? 'draft' : p.status as 'draft' | 'pending' | 'active')
    setScreenshots(p.screenshots); setDemoLinks(p.demoLinks.length ? p.demoLinks : [{ label: '', url: '' }])
    setDemoCreds(p.demoCreds.length ? p.demoCreds : [{ role: '', url: '', username: '', password: '' }])
    setHostedFiles(p.hostedFiles); setEditingProduct(p)
    setActiveTab('add')
  }

  const saveProduct = (status: 'draft' | 'pending') => {
    if (!productTitle.trim()) return
    const newProduct: VendorProduct = {
      id: editingProduct?.id || `vp_${Date.now()}`,
      title: productTitle, slug, shortDesc, fullDesc,
      category: productCat, subcategory: productSubCat, tags, livePreviewUrl,
      regularPrice: isFree ? 0 : Number(regularPrice) || 0,
      extendedPrice: enableExtended ? Number(extendedPrice) || 0 : 0,
      comparePrice: Number(comparePrice) || 0,
      isFree, thumbnail, screenshots, demoLinks, demoCreds, hostedFiles,
      metaTitle: metaTitle || productTitle, metaDesc,
      status, createdAt: editingProduct?.createdAt || new Date().toISOString(),
    }
    if (editingProduct) {
      saveVendorProducts(vendorProducts.map(p => p.id === editingProduct.id ? newProduct : p))
    } else {
      saveVendorProducts([...vendorProducts, newProduct])
    }
    setSubmitted(true)
    resetForm()
  }

  const deleteProduct = (id: string) => {
    saveVendorProducts(vendorProducts.filter(p => p.id !== id))
    setDeleteConfirm(null)
  }

  // ── Earnings & Withdrawal state ──
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash')
  const [withdrawAccount, setWithdrawAccount] = useState('')
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountName: '', accountNumber: '', branch: '', routing: '' })
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  const totalRevenue = mockProducts.reduce((s, p) => s + p.revenue, 0)
  const myEarnings = Math.round(totalRevenue * 0.85)
  const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + w.amount, 0)
  const pendingClearance = Math.round(myEarnings * 0.05)
  const availableBalance = Math.max(0, myEarnings - totalWithdrawn - pendingClearance)
  const thisMonthRevenue = 95000
  const thisMonthEarnings = Math.round(thisMonthRevenue * 0.85)
  const maxBar = Math.max(...earningsHistory.map(e => e.gross))

  const submitWithdrawal = () => {
    setWithdrawError('')
    const amt = Number(withdrawAmount)
    if (!amt || amt < 500) { setWithdrawError('Minimum withdrawal amount is ৳500.'); return }
    if (amt > availableBalance) { setWithdrawError(`Cannot exceed available balance of ৳${availableBalance.toLocaleString()}.`); return }
    const account = withdrawMethod === 'bank'
      ? `${bankDetails.bankName} — ${bankDetails.accountNumber}`
      : withdrawAccount
    if (!account.trim()) { setWithdrawError('Please enter account details.'); return }
    const wd: Withdrawal = {
      id: `WD-${Date.now()}`,
      amount: amt,
      method: withdrawMethod === 'bkash' ? 'bKash' : withdrawMethod === 'nagad' ? 'Nagad' : withdrawMethod === 'rocket' ? 'Rocket' : 'Bank Transfer',
      account,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    }
    saveWithdrawals([wd, ...withdrawals])
    setWithdrawSuccess(true)
    setWithdrawAmount('')
    setWithdrawAccount('')
  }

  const allProductsList = [
    ...mockProducts.map(p => ({ ...p, thumbnail: (p as typeof mockProducts[0]).thumbnail, title: p.name, source: 'mock' as const })),
    ...vendorProducts.map(p => ({ id: p.id, name: p.title, title: p.title, slug: p.slug, price: p.regularPrice, sales: 0, views: 0, revenue: 0, status: p.status, rating: 0, category: p.category, thumbnail: p.thumbnail, source: 'local' as const })),
  ].filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))

  const navItems: { tab: Tab; label: string; icon: string }[] = [
    { tab: 'overview', label: 'Overview', icon: '📊' },
    { tab: 'products', label: 'My Products', icon: '📦' },
    { tab: 'add', label: 'Add Product', icon: '➕' },
    { tab: 'orders', label: 'Orders', icon: '🛒' },
    { tab: 'earnings', label: 'Earnings & Balance', icon: '💰' },
    { tab: 'analytics', label: 'Analytics', icon: '📈' },
    { tab: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  if (!isLoading && !user) {
    if (typeof window !== 'undefined') window.location.href = '/customer/login'
    return null
  }
  if (!isLoading && user && user.role !== 'vendor' && user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">Only verified vendors can access the seller dashboard.</p>
          <Link href="/customer/dashboard" className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition">
            Go to My Account
          </Link>
        </div>
      </div>
    )
  }

  const vendorName = user?.name || 'Rahim Uddin'
  const vendorShop = user?.shopName || 'TechBD Solutions'
  const vendorInitial = vendorName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-[100px]">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">{vendorInitial}</div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{vendorName}</p>
                  <p className="text-xs text-gray-500 truncate">{vendorShop}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#82b541]/10 text-[#82b541] px-2 py-0.5 rounded-full font-bold mt-0.5">
                    ✓ Power Elite Author
                  </span>
                </div>
              </div>
              <div className="bg-[#1d2129] rounded-lg p-3 mb-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Available Balance</p>
                <p className="text-white font-black text-xl">৳{availableBalance.toLocaleString()}</p>
                <button onClick={() => setActiveTab('earnings')} className="mt-2 text-[10px] text-[#82b541] hover:underline font-semibold">
                  Withdraw Funds →
                </button>
              </div>
              <nav className="space-y-0.5">
                {navItems.map(item => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === item.tab ? 'bg-[#1d2129] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {item.tab === 'orders' && <span className="ml-auto bg-[#82b541] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">1</span>}
                  </button>
                ))}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition">
                    ← Back to Shop
                  </Link>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-black text-gray-900">Seller Overview</h1>
                  <span className="text-sm text-gray-500">July 2025</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Total Revenue" value={`৳${(totalRevenue / 100000).toFixed(1)}L`} sub="All time" color="bg-green-50 border-green-200 text-green-800" />
                  <StatCard label="My Earnings (85%)" value={`৳${(myEarnings / 100000).toFixed(1)}L`} sub="After platform fee" color="bg-blue-50 border-blue-200 text-blue-800" />
                  <StatCard label="Total Sales" value={mockProducts.reduce((s, p) => s + p.sales, 0).toString()} sub="All products" color="bg-purple-50 border-purple-200 text-purple-800" />
                  <StatCard label="Active Products" value={mockProducts.filter(p => p.status === 'active').length.toString()} sub={`${mockProducts.length + vendorProducts.length} total`} color="bg-orange-50 border-orange-200 text-orange-800" />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue (2025)</h3>
                  <div className="flex items-end gap-2 h-40">
                    {earningsHistory.map(e => (
                      <div key={e.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-gray-500 font-medium">৳{(e.gross / 1000).toFixed(0)}k</span>
                        <div className="w-full">
                          <div className="w-full bg-[#82b541] rounded-t-sm hover:bg-[#6fa033] transition-all" style={{ height: `${(e.gross / maxBar) * 100}px` }} title={`৳${e.gross.toLocaleString()}`} />
                        </div>
                        <span className="text-[9px] text-gray-400">{e.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[#82b541] text-sm font-semibold hover:underline">View all →</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>{['Order ID', 'Product', 'Customer', 'Amount', 'Status'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-gray-500 font-semibold text-xs">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {mockOrders.slice(0, 4).map(o => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-xs text-gray-400">{o.id}</td>
                            <td className="py-3 px-4 font-medium text-gray-900 max-w-[140px] truncate">{o.product}</td>
                            <td className="py-3 px-4 text-gray-600">{o.customer}</td>
                            <td className="py-3 px-4 font-bold text-gray-900">৳{o.amount.toLocaleString()}</td>
                            <td className="py-3 px-4"><span className={`${statusColors[o.status]} text-xs font-semibold px-2.5 py-1 rounded-full`}>{o.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── MY PRODUCTS ── */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-black text-gray-900">My Products</h1>
                  <button onClick={() => { resetForm(); setSubmitted(false); setActiveTab('add') }} className="bg-[#82b541] hover:bg-[#6fa033] text-white font-bold px-5 py-2.5 rounded-lg transition text-sm">
                    + Add Product
                  </button>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Total Products', value: allProductsList.length, color: 'bg-blue-50 border-blue-200 text-blue-800' },
                    { label: 'Active', value: allProductsList.filter(p => p.status === 'active').length, color: 'bg-green-50 border-green-200 text-green-800' },
                    { label: 'Pending', value: allProductsList.filter(p => p.status === 'pending').length, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                    { label: 'Total Sales', value: mockProducts.reduce((s, p) => s + p.sales, 0), color: 'bg-purple-50 border-purple-200 text-purple-800' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} border rounded-xl p-4`}>
                      <p className="font-black text-xl">{s.value}</p>
                      <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Search */}
                <div className="mb-4">
                  <input
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full sm:w-72 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#82b541]"
                  />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>{['', 'Product', 'Price', 'Sales', 'Revenue', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left py-3 px-3 text-gray-500 font-semibold text-xs">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {allProductsList.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-3 px-3">
                              {p.thumbnail ? (
                                <img src={p.thumbnail} alt="" className="w-12 h-9 rounded object-cover" />
                              ) : (
                                <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center text-xl">📦</div>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-gray-900 max-w-[180px] truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.category}</p>
                            </td>
                            <td className="py-3 px-3 font-bold text-gray-900">৳{p.price.toLocaleString()}</td>
                            <td className="py-3 px-3 text-gray-700">{p.sales}</td>
                            <td className="py-3 px-3 font-bold text-[#82b541]">{p.revenue > 0 ? `৳${p.revenue.toLocaleString()}` : '—'}</td>
                            <td className="py-3 px-3">
                              <span className={`${statusColors[p.status] || 'bg-gray-100 text-gray-600'} text-xs font-semibold px-2.5 py-1 rounded-full capitalize`}>{p.status}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                {p.source === 'local' && (
                                  <button
                                    onClick={() => loadProductIntoForm(vendorProducts.find(vp => vp.id === p.id)!)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition text-sm"
                                    title="Edit"
                                  >✏️</button>
                                )}
                                <Link href={`/item/${p.slug}`} className="p-1.5 text-gray-400 hover:text-[#82b541] hover:bg-green-50 rounded transition text-sm" title="View">👁️</Link>
                                {p.source === 'local' && (
                                  <>
                                    {deleteConfirm === p.id ? (
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => deleteProduct(p.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">Del</button>
                                        <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 px-1">✕</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition text-sm" title="Delete">🗑️</button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {allProductsList.length === 0 && (
                          <tr><td colSpan={7} className="py-12 text-center text-gray-400">No products found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ADD PRODUCT ── */}
            {activeTab === 'add' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h1>
                  {editingProduct && (
                    <button onClick={() => { resetForm(); setSubmitted(false) }} className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                      + New Product
                    </button>
                  )}
                </div>
                {submitted ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Product Saved!</h2>
                    <p className="text-gray-500 mb-6">Your product has been saved. Go to My Products to manage it.</p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => { setSubmitted(false); resetForm() }} className="bg-[#82b541] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#6fa033] transition">
                        Add Another
                      </button>
                      <button onClick={() => setActiveTab('products')} className="border border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition">
                        View My Products
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                      <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">Basic Information</h3>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Title *</label>
                        <input
                          value={productTitle}
                          onChange={e => { setProductTitle(e.target.value); if (!metaTitle || metaTitle === productTitle) setMetaTitle(e.target.value) }}
                          placeholder="e.g., Restaurant POS System with Inventory"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541] focus:ring-2 focus:ring-[#82b541]/20"
                        />
                        {slug && (
                          <p className="text-xs text-gray-400 mt-1.5 font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                            URL: <span className="text-[#82b541]">shop.sigroup.com.bd/item/<strong>{slug}</strong></span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Short Description * <span className="text-gray-400 font-normal">({shortDesc.length}/150 chars)</span></label>
                        <input
                          value={shortDesc}
                          onChange={e => e.target.value.length <= 150 && setShortDesc(e.target.value)}
                          placeholder="One-line summary shown on product cards"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541] focus:ring-2 focus:ring-[#82b541]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Description * <span className="text-gray-400 font-normal">(Markdown supported)</span></label>
                        <textarea
                          value={fullDesc}
                          onChange={e => setFullDesc(e.target.value)}
                          rows={7}
                          placeholder={"## Features\n- Feature 1\n- Feature 2\n\n## Requirements\n- PHP 8.1+\n- MySQL 8"}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541] focus:ring-2 focus:ring-[#82b541]/20 resize-none font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Category *</label>
                          <select value={productCat} onChange={e => { setProductCat(e.target.value); setProductSubCat(subCategories[e.target.value]?.[0] || '') }}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541] bg-white">
                            {Object.keys(subCategories).map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Subcategory *</label>
                          <select value={productSubCat} onChange={e => setProductSubCat(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541] bg-white">
                            {(subCategories[productCat] || []).map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="laravel, pos, restaurant, billing"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Live Preview URL</label>
                          <input value={livePreviewUrl} onChange={e => setLivePreviewUrl(e.target.value)} placeholder="https://demo.yourproduct.com"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                      <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">Pricing</h3>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div onClick={() => setIsFree(!isFree)} className={`w-11 h-6 rounded-full transition-colors relative ${isFree ? 'bg-[#82b541]' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isFree ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Free Product <span className="text-gray-400 font-normal">(sets price to ৳0)</span></span>
                      </label>
                      {!isFree && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Regular License Price (৳) *</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">৳</span>
                              <input type="number" min="0" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} placeholder="4500"
                                className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Original / Compare Price (৳)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">৳</span>
                              <input type="number" min="0" value={comparePrice} onChange={e => setComparePrice(e.target.value)} placeholder="6000 (strikethrough)"
                                className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                            </div>
                          </div>
                        </div>
                      )}
                      {!isFree && (
                        <>
                          {comparePrice && regularPrice && Number(comparePrice) > Number(regularPrice) && (
                            <p className="text-xs text-[#82b541] font-semibold">Discount: {Math.round((1 - Number(regularPrice) / Number(comparePrice)) * 100)}% off</p>
                          )}
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={enableExtended} onChange={e => setEnableExtended(e.target.checked)} className="w-4 h-4 accent-[#82b541]" />
                            <span className="text-sm font-semibold text-gray-700">Enable Extended License</span>
                          </label>
                          {enableExtended && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1.5">Extended License Price (৳)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">৳</span>
                                <input type="number" min="0" value={extendedPrice} onChange={e => setExtendedPrice(e.target.value)} placeholder="15000"
                                  className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Product Images */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                      <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">Product Images</h3>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Main Thumbnail URL * <span className="text-gray-400 font-normal">(16:9, min 800×450px)</span></label>
                        <input value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://example.com/thumbnail.jpg"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                        {thumbnail && (
                          <div className="mt-2 w-48 h-28 rounded-lg overflow-hidden border border-gray-200">
                            <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-bold text-gray-700">Screenshots <span className="text-gray-400 font-normal">(up to 5)</span></label>
                          {screenshots.length < 5 && (
                            <button type="button" onClick={addScreenshot} className="text-xs font-bold text-[#82b541] hover:underline">+ Add Screenshot</button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {screenshots.map((s, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 w-16">Shot #{i + 1}</span>
                                <button type="button" onClick={() => removeScreenshot(i)} className="ml-auto text-red-400 hover:text-red-600 text-sm font-bold">× Remove</button>
                              </div>
                              <input value={s.url} onChange={e => updateScreenshot(i, 'url', e.target.value)} placeholder="Screenshot URL"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" />
                              <input value={s.caption} onChange={e => updateScreenshot(i, 'caption', e.target.value)} placeholder="Caption (optional)"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" />
                              {s.url && (
                                <div className="w-32 h-20 rounded overflow-hidden border border-gray-100">
                                  <img src={s.url} alt="shot" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                                </div>
                              )}
                            </div>
                          ))}
                          {screenshots.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm">
                              Click "+ Add Screenshot" to add preview images
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Demo System */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                      <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">Demo System</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700">Demo Links <span className="text-gray-400 font-normal">(up to 5)</span></label>
                          {demoLinks.length < 5 && <button type="button" onClick={addDemoLink} className="text-xs font-bold text-[#82b541] hover:underline">+ Add Link</button>}
                        </div>
                        {demoLinks.map((link, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input placeholder="Label (e.g. Frontend Demo)" value={link.label} onChange={e => updateDemoLink(i, 'label', e.target.value)}
                              className="w-1/3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" />
                            <input placeholder="URL" value={link.url} onChange={e => updateDemoLink(i, 'url', e.target.value)}
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" />
                            {demoLinks.length > 1 && <button type="button" onClick={() => removeDemoLink(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700">Demo Credentials <span className="text-gray-400 font-normal">(up to 3 roles)</span></label>
                          {demoCreds.length < 3 && <button type="button" onClick={addCred} className="text-xs font-bold text-[#82b541] hover:underline">+ Add Credentials</button>}
                        </div>
                        {demoCreds.map((cred, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <input placeholder="Role label (e.g. Admin)" value={cred.role} onChange={e => updateCred(i, 'role', e.target.value)}
                                className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] bg-white" />
                              {demoCreds.length > 1 && <button type="button" onClick={() => removeCred(i)} className="text-red-400 hover:text-red-600 text-sm font-bold">Remove</button>}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <input placeholder="Demo URL" value={cred.url} onChange={e => updateCred(i, 'url', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] bg-white" />
                              <input placeholder="Username" value={cred.username} onChange={e => updateCred(i, 'username', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] bg-white" />
                              <input placeholder="Password" value={cred.password} onChange={e => updateCred(i, 'password', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541] bg-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* File Hosting */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                      <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">File Delivery</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {(['drive', 'dropbox', 'direct'] as const).map(mode => (
                          <label key={mode} className={`flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg border-2 text-sm font-medium transition ${fileHostingMode === mode ? 'border-[#82b541] bg-[#82b541]/10 text-[#82b541]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            <input type="radio" name="fileHosting" checked={fileHostingMode === mode} onChange={() => setFileHostingMode(mode)} className="sr-only" />
                            {mode === 'drive' ? '🔵 Google Drive' : mode === 'dropbox' ? '📦 Dropbox/OneDrive' : '⬆ Direct Upload'}
                          </label>
                        ))}
                      </div>
                      {fileHostingMode === 'direct' ? (
                        <div className="border-2 border-dashed border-gray-200 hover:border-[#82b541] rounded-lg p-5 text-center cursor-pointer transition">
                          <p className="text-sm text-gray-500">📁 Click to upload file (max 50MB)</p>
                          <p className="text-xs text-gray-400 mt-1">ZIP, RAR, PDF, PSD, AI, APK</p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input placeholder={fileHostingMode === 'drive' ? 'Paste Google Drive sharing link' : 'Paste Dropbox/OneDrive link'}
                            value={fileLink} onChange={e => setFileLink(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#82b541]" />
                          <button type="button" onClick={addFileLink} className="bg-[#82b541] text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#6fa033] transition">Add</button>
                        </div>
                      )}
                      {hostedFiles.length > 0 && (
                        <div className="space-y-1.5">
                          {hostedFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                              <span>{f.hosting === 'drive' ? '🔵' : f.hosting === 'dropbox' ? '📦' : '📁'}</span>
                              <span className="flex-1 truncate text-gray-700">{f.name}</span>
                              <span className="text-gray-400 text-xs capitalize">{f.hosting}</span>
                              <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                      <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">SEO</h3>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Meta Title</label>
                        <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="SEO title (auto-filled from product title)"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Meta Description</label>
                        <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={2} placeholder="Short description for search engines (150-160 chars)"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541] resize-none" />
                      </div>
                    </div>

                    {/* Status & Submit */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Product Status</label>
                        <div className="flex gap-3">
                          {(['draft', 'pending', 'active'] as const).map(s => (
                            <label key={s} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition text-sm font-semibold capitalize ${productStatus === s ? 'border-[#82b541] bg-[#82b541]/10 text-[#82b541]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                              <input type="radio" name="pStatus" checked={productStatus === s} onChange={() => setProductStatus(s)} className="sr-only" />
                              {s === 'draft' ? '📝 Draft' : s === 'pending' ? '🕐 Pending Review' : '✅ Active'}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => saveProduct('draft')} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-lg hover:bg-gray-50 transition">
                          Save Draft
                        </button>
                        <button onClick={() => saveProduct('pending')} className="flex-1 bg-[#82b541] hover:bg-[#6fa033] text-white font-black py-3.5 rounded-lg transition shadow-sm">
                          Submit for Review →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ORDERS ── */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-black text-gray-900">Orders</h1>
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none">
                    <option>All Statuses</option>
                    <option>Completed</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>{['Order ID', 'Product', 'Customer', 'License', 'Date', 'Amount', 'Status'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-gray-500 font-semibold text-xs">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {mockOrders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{o.id}</td>
                            <td className="py-3.5 px-4 font-medium text-gray-900 max-w-[150px] truncate">{o.product}</td>
                            <td className="py-3.5 px-4">
                              <p className="text-gray-900 font-medium">{o.customer}</p>
                              <p className="text-xs text-gray-400">{o.email}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${o.license === 'Extended' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{o.license}</span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 text-xs">{o.date}</td>
                            <td className="py-3.5 px-4 font-bold text-gray-900">৳{o.amount.toLocaleString()}</td>
                            <td className="py-3.5 px-4">
                              <span className={`${statusColors[o.status]} text-xs font-semibold px-2.5 py-1 rounded-full capitalize`}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── EARNINGS & BALANCE ── */}
            {activeTab === 'earnings' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">Earnings & Balance</h1>

                {/* Balance Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#1d2129] rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Available Balance</p>
                    <p className="text-white font-black text-3xl">৳{availableBalance.toLocaleString()}</p>
                    <p className="text-[#82b541] text-xs mt-1 font-semibold">Ready to withdraw</p>
                  </div>
                  <StatCard label="Pending Clearance" value={`৳${pendingClearance.toLocaleString()}`} sub="Orders < 14 days" color="bg-yellow-50 border-yellow-200 text-yellow-800" />
                  <StatCard label="Total Earned" value={`৳${myEarnings.toLocaleString()}`} sub="All time (85% share)" color="bg-blue-50 border-blue-200 text-blue-800" />
                  <StatCard label="Total Withdrawn" value={`৳${totalWithdrawn.toLocaleString()}`} sub="Approved payouts" color="bg-purple-50 border-purple-200 text-purple-800" />
                </div>

                {/* SVG Earnings Chart */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Monthly Earnings Chart (2025)</h3>
                  <svg viewBox="0 0 700 160" className="w-full" style={{ height: 160 }}>
                    {earningsHistory.map((e, i) => {
                      const barW = 28
                      const gap = 72
                      const x = 30 + i * gap
                      const maxG = Math.max(...earningsHistory.map(h => h.gross))
                      const grossH = (e.gross / maxG) * 110
                      const feeH = (e.fee / maxG) * 110
                      const netH = (e.net / maxG) * 110
                      return (
                        <g key={e.month}>
                          <rect x={x} y={130 - grossH} width={barW - 2} height={grossH} rx="3" fill="#82b541" opacity="0.3" />
                          <rect x={x + 2} y={130 - netH} width={barW - 6} height={netH} rx="2" fill="#82b541" />
                          <rect x={x + barW - 8} y={130 - feeH} width={6} height={feeH} rx="2" fill="#ef4444" opacity="0.7" />
                          <text x={x + barW / 2 - 1} y={148} textAnchor="middle" fontSize="9" fill="#9ca3af">{e.month}</text>
                        </g>
                      )
                    })}
                    <line x1="24" y1="130" x2="680" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                    <g transform="translate(530, 10)">
                      <rect x="0" y="0" width="12" height="10" rx="2" fill="#82b541" opacity="0.4" />
                      <text x="15" y="9" fontSize="8" fill="#6b7280">Gross</text>
                      <rect x="55" y="0" width="12" height="10" rx="2" fill="#82b541" />
                      <text x="70" y="9" fontSize="8" fill="#6b7280">Net</text>
                      <rect x="100" y="0" width="12" height="10" rx="2" fill="#ef4444" opacity="0.7" />
                      <text x="115" y="9" fontSize="8" fill="#6b7280">Fee</text>
                    </g>
                  </svg>
                </div>

                {/* Monthly Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Monthly Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>{['Month', 'Gross Revenue', 'Platform Fee (15%)', 'Your Earnings (85%)', 'Status'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-gray-500 font-semibold text-xs">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {earningsHistory.map((e, i) => (
                          <tr key={e.month} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{e.month} 2025</td>
                            <td className="py-3 px-4 text-gray-700">৳{e.gross.toLocaleString()}</td>
                            <td className="py-3 px-4 text-red-500">-৳{e.fee.toLocaleString()}</td>
                            <td className="py-3 px-4 font-bold text-[#82b541]">৳{e.net.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${i < earningsHistory.length - 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {i < earningsHistory.length - 1 ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Withdrawal Request Form */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Request Withdrawal</h3>
                  {withdrawSuccess ? (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-3">✅</div>
                      <p className="font-bold text-gray-900 text-lg">Withdrawal Requested!</p>
                      <p className="text-sm text-gray-500 mt-1">Your request is being processed. Expect payment within 2-3 business days.</p>
                      <button onClick={() => setWithdrawSuccess(false)} className="mt-4 text-[#82b541] text-sm hover:underline font-semibold">Request another</button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                          Amount (৳) <span className="text-gray-400 font-normal">— Min ৳500, Max ৳{availableBalance.toLocaleString()}</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                          <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                            placeholder="Enter amount" min={500} max={availableBalance}
                            className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {([
                            { id: 'bkash' as const, label: 'bKash', icon: '📱', color: 'border-pink-300 bg-pink-50 text-pink-700' },
                            { id: 'nagad' as const, label: 'Nagad', icon: '📱', color: 'border-orange-300 bg-orange-50 text-orange-700' },
                            { id: 'rocket' as const, label: 'Rocket', icon: '📱', color: 'border-purple-300 bg-purple-50 text-purple-700' },
                            { id: 'bank' as const, label: 'Bank Transfer', icon: '🏦', color: 'border-blue-300 bg-blue-50 text-blue-700' },
                          ]).map(m => (
                            <label key={m.id} className={`flex flex-col items-center gap-1.5 p-3 border-2 rounded-xl cursor-pointer transition text-sm font-semibold ${withdrawMethod === m.id ? m.color + ' border-opacity-100' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                              <input type="radio" name="wMethod" checked={withdrawMethod === m.id} onChange={() => setWithdrawMethod(m.id)} className="sr-only" />
                              <span className="text-2xl">{m.icon}</span>
                              {m.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Account details based on method */}
                      {withdrawMethod !== 'bank' && (
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            {withdrawMethod === 'bkash' ? 'bKash' : withdrawMethod === 'nagad' ? 'Nagad' : 'Rocket'} Number
                          </label>
                          <input value={withdrawAccount} onChange={e => setWithdrawAccount(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                        </div>
                      )}
                      {withdrawMethod === 'bank' && (
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { key: 'bankName' as const, label: 'Bank Name', placeholder: 'e.g., Dutch-Bangla Bank' },
                            { key: 'accountName' as const, label: 'Account Name', placeholder: 'Account holder full name' },
                            { key: 'accountNumber' as const, label: 'Account Number', placeholder: '0000000000' },
                            { key: 'branch' as const, label: 'Branch', placeholder: 'e.g., Motijheel Branch' },
                            { key: 'routing' as const, label: 'Routing Number', placeholder: '00000' },
                          ]).map(f => (
                            <div key={f.key}>
                              <label className="block text-xs font-bold text-gray-700 mb-1">{f.label}</label>
                              <input value={bankDetails[f.key]} onChange={e => setBankDetails({ ...bankDetails, [f.key]: e.target.value })}
                                placeholder={f.placeholder}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#82b541]" />
                            </div>
                          ))}
                        </div>
                      )}

                      {withdrawError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-medium">{withdrawError}</div>
                      )}
                      <button onClick={submitWithdrawal} className="bg-[#82b541] hover:bg-[#6fa033] text-white font-black px-8 py-3.5 rounded-lg transition">
                        Submit Withdrawal Request
                      </button>
                      <p className="text-xs text-gray-400">Withdrawals processed within 2-3 business days. Minimum ৳500.</p>
                    </div>
                  )}
                </div>

                {/* Withdrawal History */}
                {withdrawals.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Withdrawal History</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>{['Date', 'Amount', 'Method', 'Account', 'Status'].map(h => (
                            <th key={h} className="text-left py-3 px-4 text-gray-500 font-semibold text-xs">{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {withdrawals.map(w => (
                            <tr key={w.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-500 text-xs">{w.date}</td>
                              <td className="py-3 px-4 font-bold text-gray-900">৳{w.amount.toLocaleString()}</td>
                              <td className="py-3 px-4 text-gray-700">{w.method}</td>
                              <td className="py-3 px-4 text-gray-500 text-xs max-w-[140px] truncate">{w.account}</td>
                              <td className="py-3 px-4">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${w.status === 'approved' ? 'bg-green-100 text-green-700' : w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {w.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">Analytics</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Total Page Views" value="20,120" sub="All products" color="bg-blue-50 border-blue-200 text-blue-800" />
                  <StatCard label="Conversion Rate" value="3.5%" sub="Views → Sales" color="bg-green-50 border-green-200 text-green-800" />
                  <StatCard label="Avg. Rating" value="4.8★" sub="Across products" color="bg-yellow-50 border-yellow-200 text-yellow-800" />
                  <StatCard label="Wishlist Adds" value="1,240" sub="This month" color="bg-purple-50 border-purple-200 text-purple-800" />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Views per Product</h3>
                  <div className="space-y-4">
                    {mockProducts.map(p => (
                      <div key={p.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-800 truncate max-w-xs">{p.name}</span>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            <span className="text-xs text-gray-500">{p.views.toLocaleString()} views</span>
                            <span className="text-xs text-[#82b541] font-bold">{((p.sales / p.views) * 100).toFixed(1)}% CVR</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#82b541] h-2 rounded-full" style={{ width: `${(p.views / Math.max(...mockProducts.map(x => x.views))) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Traffic Sources</h3>
                  <div className="space-y-3">
                    {[
                      { source: 'Organic Search', pct: 45, color: 'bg-blue-500' },
                      { source: 'Direct', pct: 28, color: 'bg-[#82b541]' },
                      { source: 'Social Media', pct: 15, color: 'bg-purple-500' },
                      { source: 'Referral', pct: 12, color: 'bg-orange-500' },
                    ].map(t => (
                      <div key={t.source} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 w-32 flex-shrink-0">{t.source}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`${t.color} h-2 rounded-full`} style={{ width: `${t.pct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-8 text-right">{t.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && (
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-6">Shop Settings</h1>
                <div className="space-y-5">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Profile & Shop Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', placeholder: 'Rahim Uddin', defaultValue: 'Rahim Uddin' },
                        { label: 'Shop Name', placeholder: 'TechBD Solutions', defaultValue: 'TechBD Solutions' },
                        { label: 'Email', placeholder: 'rahim@techbd.com', defaultValue: 'rahim@techbd.com' },
                        { label: 'Phone', placeholder: '01XXXXXXXXX', defaultValue: '01712345678' },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">{f.label}</label>
                          <input defaultValue={f.defaultValue} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Bio</label>
                      <textarea rows={3} defaultValue="5+ years building enterprise software for Bangladeshi businesses. Specialized in Laravel, React, and POS systems." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541] resize-none" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-gray-700 mb-1.5">bKash Number</label><input placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Nagad Number</label><input placeholder="01XXXXXXXXX" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Bank Account Name</label><input placeholder="Account holder name" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Bank Account Number</label><input placeholder="Account number" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#82b541]" /></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Email on new sale', defaultChecked: true },
                        { label: 'Email on new review', defaultChecked: true },
                        { label: 'Email payout confirmation', defaultChecked: true },
                        { label: 'Weekly earnings summary', defaultChecked: false },
                        { label: 'Marketing & promotional emails', defaultChecked: false },
                      ].map(n => (
                        <label key={n.label} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked={n.defaultChecked} className="w-4 h-4 rounded accent-[#82b541]" />
                          <span className="text-sm text-gray-700">{n.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button className="bg-[#82b541] hover:bg-[#6fa033] text-white font-bold px-8 py-3 rounded-lg transition">Save Settings</button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
