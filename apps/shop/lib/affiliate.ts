export interface AffiliateUser {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  refCode: string
  status: 'pending' | 'active' | 'suspended'
  joinedAt: string
  commissionRate: number // percent e.g. 10
  totalClicks: number
  totalConversions: number
  totalEarned: number
  availableBalance: number
  pendingBalance: number
  paymentMethod: 'bkash' | 'nagad' | 'bank' | ''
  paymentAccount: string
}

export interface AffiliateClick {
  id: string
  affiliateId: string
  refCode: string
  page: string
  ip: string
  timestamp: string
  converted: boolean
  orderId?: string
  commission?: number
}

export interface AffiliateWithdrawal {
  id: string
  affiliateId: string
  amount: number
  method: string
  account: string
  status: 'pending' | 'paid' | 'rejected'
  requestedAt: string
  processedAt?: string
}

const AFF_KEY = 'si_affiliates'
const CLICK_KEY = 'si_aff_clicks'
const WD_KEY = 'si_aff_withdrawals'

export function getAffiliates(): AffiliateUser[] {
  try {
    const raw = localStorage.getItem(AFF_KEY)
    if (!raw) return getDemoAffiliates()
    return JSON.parse(raw)
  } catch { return getDemoAffiliates() }
}

function getDemoAffiliates(): AffiliateUser[] {
  return [
    {
      id: 'aff1', userId: 'u_demo_aff1', name: 'Rahim Hossain', email: 'rahim@demo.com', phone: '01700111111',
      refCode: 'RAHIM2025', status: 'active', joinedAt: '2025-01-15', commissionRate: 10,
      totalClicks: 342, totalConversions: 28, totalEarned: 14200, availableBalance: 8500, pendingBalance: 2100,
      paymentMethod: 'bkash', paymentAccount: '01700111111',
    },
    {
      id: 'aff2', userId: 'u_demo_aff2', name: 'Fatema Begum', email: 'fatema@demo.com', phone: '01800222222',
      refCode: 'FATEMA25', status: 'active', joinedAt: '2025-02-10', commissionRate: 10,
      totalClicks: 189, totalConversions: 15, totalEarned: 7800, availableBalance: 5200, pendingBalance: 900,
      paymentMethod: 'nagad', paymentAccount: '01800222222',
    },
    {
      id: 'aff3', userId: 'u_demo_aff3', name: 'Karim Ahmed', email: 'karim@demo.com', phone: '01900333333',
      refCode: 'KARIM007', status: 'pending', joinedAt: '2025-06-28', commissionRate: 10,
      totalClicks: 0, totalConversions: 0, totalEarned: 0, availableBalance: 0, pendingBalance: 0,
      paymentMethod: '', paymentAccount: '',
    },
  ]
}

export function saveAffiliates(list: AffiliateUser[]) {
  localStorage.setItem(AFF_KEY, JSON.stringify(list))
}

export function getMyAffiliate(userId: string): AffiliateUser | null {
  return getAffiliates().find(a => a.userId === userId) || null
}

export function registerAffiliate(userId: string, name: string, email: string, phone: string): AffiliateUser {
  const list = getAffiliates()
  const code = (name.split(' ')[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000)).replace(/[^A-Z0-9]/g, '')
  const aff: AffiliateUser = {
    id: 'aff_' + Date.now(),
    userId, name, email, phone,
    refCode: code,
    status: 'pending',
    joinedAt: new Date().toISOString().split('T')[0],
    commissionRate: 10,
    totalClicks: 0, totalConversions: 0, totalEarned: 0,
    availableBalance: 0, pendingBalance: 0,
    paymentMethod: '', paymentAccount: '',
  }
  saveAffiliates([...list, aff])
  return aff
}

export function getWithdrawals(affiliateId: string): AffiliateWithdrawal[] {
  try {
    const raw = localStorage.getItem(WD_KEY)
    const all: AffiliateWithdrawal[] = raw ? JSON.parse(raw) : []
    return all.filter(w => w.affiliateId === affiliateId)
  } catch { return [] }
}

export function getAllWithdrawals(): AffiliateWithdrawal[] {
  try {
    const raw = localStorage.getItem(WD_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function requestWithdrawal(affiliateId: string, amount: number, method: string, account: string): AffiliateWithdrawal {
  const wd: AffiliateWithdrawal = {
    id: 'wd_' + Date.now(), affiliateId, amount, method, account,
    status: 'pending', requestedAt: new Date().toISOString(),
  }
  const all = getAllWithdrawals()
  localStorage.setItem(WD_KEY, JSON.stringify([...all, wd]))
  // deduct from affiliate balance
  const affs = getAffiliates()
  const updated = affs.map(a => a.id === affiliateId ? { ...a, availableBalance: a.availableBalance - amount, pendingBalance: a.pendingBalance + amount } : a)
  saveAffiliates(updated)
  return wd
}

export function getAffiliateStats(affiliateId: string) {
  return {
    clicksToday: Math.floor(Math.random() * 20),
    clicksMonth: Math.floor(Math.random() * 200),
    conversionRate: '8.2%',
    avgCommission: '৳507',
  }
}
