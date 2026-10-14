const KEY = 'si_shop_site_settings'

export interface SiteSettings {
  navbar: {
    showCategoryStrip: boolean
    showScrollSearch: boolean
    pillButtons: {
      id: string
      label: string
      href: string
      color: string
      show: boolean
    }[]
  }
  header: {
    logoText: string
    logoTagline: string
    bgColor: string
    accentColor: string
    showSearch: boolean
    showSellButton: boolean
    sellButtonText: string
    announcementBar: boolean
    announcementText: string
    announcementBg: string
  }
  footer: {
    companyName: string
    tagline: string
    copyright: string
    col1Title: string
    col1Links: { label: string; href: string }[]
    col2Title: string
    col2Links: { label: string; href: string }[]
    col3Title: string
    col3Links: { label: string; href: string }[]
    showSocial: boolean
    facebook: string
    instagram: string
    youtube: string
    whatsapp: string
  }
  homepage: {
    heroTitle: string
    heroSubtitle: string
    showFlashSales: boolean
    flashSalesTitle: string
    showBannerAds: boolean
    showFeatured: boolean
    featuredTitle: string
    showTrending: boolean
    trendingTitle: string
    showGraphics: boolean
    graphicsTitle: string
    showSoftware: boolean
    softwareTitle: string
    showWebsite: boolean
    websiteTitle: string
    showMobileApp: boolean
    mobileAppTitle: string
    showSellerCta: boolean
    showStats: boolean
  }
  design: {
    primaryColor: string
    accentColor: string
    headerBg: string
    headerSubBg: string
    bodyBg: string
    borderRadius: string
  }
}

export const defaultSettings: SiteSettings = {
  navbar: {
    showCategoryStrip: true,
    showScrollSearch: true,
    pillButtons: [
      { id: 'flash', label: '⚡ Flash Sale', href: '/flash-sales', color: 'bg-red-600', show: true },
      { id: 'affiliate', label: '🤝 Affiliate', href: '/affiliate', color: 'bg-[#82b541]', show: true },
      { id: 'software', label: '💻 Software', href: '/category/software', color: 'bg-white/10', show: true },
      { id: 'mobile', label: '📱 Mobile App', href: '/category/mobile-app', color: 'bg-white/10', show: true },
      { id: 'templates', label: '🌐 Templates', href: '/category/template', color: 'bg-white/10', show: true },
      { id: 'free', label: '🎁 Free Items', href: '/search?price=free', color: 'bg-blue-600/70', show: true },
    ],
  },
  header: {
    logoText: 'SI Shop',
    logoTagline: 'DIGITAL MARKETPLACE',
    bgColor: '#1d2129',
    accentColor: '#82b541',
    showSearch: true,
    showSellButton: true,
    sellButtonText: 'Start Selling',
    announcementBar: false,
    announcementText: '🎉 New items added daily! Browse latest software & apps.',
    announcementBg: '#82b541',
  },
  footer: {
    companyName: 'SI Shop',
    tagline: "Bangladesh's premier digital product marketplace for developers and businesses.",
    copyright: '© 2025 SI Shop — A product of SI Group Bangladesh',
    col1Title: 'Marketplace',
    col1Links: [
      { label: 'Browse Items', href: '/' },
      { label: 'Free Items', href: '/search?price=free' },
      { label: 'New Items', href: '/search?sort=newest' },
      { label: 'Top Sellers', href: '/search?sort=bestseller' },
    ],
    col2Title: 'Sell',
    col2Links: [
      { label: 'Become an Author', href: '/seller/register' },
      { label: 'Author Dashboard', href: '/seller/dashboard' },
      { label: 'Earnings', href: '/seller/dashboard' },
      { label: 'Author Terms', href: '#' },
    ],
    col3Title: 'Support',
    col3Links: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Report an Item', href: '#' },
      { label: 'SI Group ↗', href: '/' },
    ],
    showSocial: true,
    facebook: 'https://facebook.com/sigroup',
    instagram: 'https://instagram.com/sigroup',
    youtube: '',
    whatsapp: '',
  },
  homepage: {
    heroTitle: 'Buy & Sell Digital Products',
    heroSubtitle: 'Software, Flutter apps, templates, plugins — by verified Bangladeshi developers',
    showFlashSales: true,
    flashSalesTitle: 'Flash Sales',
    showBannerAds: true,
    showFeatured: true,
    featuredTitle: 'Featured Items',
    showTrending: true,
    trendingTitle: 'Trending All Items',
    showGraphics: true,
    graphicsTitle: 'Graphics Items',
    showSoftware: true,
    softwareTitle: 'Software Items',
    showWebsite: true,
    websiteTitle: 'Website Items',
    showMobileApp: true,
    mobileAppTitle: 'Mobile App Items',
    showSellerCta: true,
    showStats: true,
  },
  design: {
    primaryColor: '#82b541',
    accentColor: '#6fa033',
    headerBg: '#1d2129',
    headerSubBg: '#2d333f',
    bodyBg: '#f5f5f0',
    borderRadius: 'rounded-xl',
  },
}

export function getSettings(): SiteSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultSettings
    const saved = JSON.parse(raw)
    return {
      navbar: { ...defaultSettings.navbar, ...saved.navbar },
      header: { ...defaultSettings.header, ...saved.header },
      footer: { ...defaultSettings.footer, ...saved.footer },
      homepage: { ...defaultSettings.homepage, ...saved.homepage },
      design: { ...defaultSettings.design, ...saved.design },
    }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(s: SiteSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
  window.dispatchEvent(new Event('si_settings_updated'))
}
