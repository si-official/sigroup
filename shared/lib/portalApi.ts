/**
 * SI Portal API Client
 * Connects all sigroup apps to portal.sigroup.com.bd (Laravel backend)
 */

const PORTAL_API = process.env.NEXT_PUBLIC_PORTAL_API_URL || 'https://portal.sigroup.com.bd/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${PORTAL_API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

// ─── Auth ──────────────────────────────────────────────
export const portalAuth = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: import('../types/auth').PortalUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: (token: string) =>
    request('/auth/logout', { method: 'POST' }, token),

  me: (token: string) =>
    request<import('../types/auth').PortalUser>('/auth/me', {}, token),

  refresh: (token: string) =>
    request<{ access_token: string }>('/auth/refresh', { method: 'POST' }, token),
}

// ─── Client dashboard ──────────────────────────────────
export const portalClient = {
  getProjects: (token: string) =>
    request<Project[]>('/client/projects', {}, token),

  getProject: (id: number, token: string) =>
    request<Project>(`/client/projects/${id}`, {}, token),

  getInvoices: (token: string) =>
    request<Invoice[]>('/client/invoices', {}, token),

  payInvoice: (invoiceId: number, token: string) =>
    request<{ payment_url: string }>(`/client/invoices/${invoiceId}/pay`, { method: 'POST' }, token),

  getTickets: (token: string) =>
    request<Ticket[]>('/client/tickets', {}, token),

  createTicket: (data: CreateTicketInput, token: string) =>
    request<Ticket>('/client/tickets', { method: 'POST', body: JSON.stringify(data) }, token),

  replyTicket: (id: number, message: string, token: string) =>
    request<TicketReply>(`/client/tickets/${id}/reply`, {
      method: 'POST', body: JSON.stringify({ message }),
    }, token),
}

// ─── Partner dashboard ─────────────────────────────────
export const portalPartner = {
  getStats: (token: string) =>
    request<PartnerStats>('/partner/stats', {}, token),

  getReferrals: (token: string) =>
    request<Referral[]>('/partner/referrals', {}, token),

  getCommissions: (token: string) =>
    request<Commission[]>('/partner/commissions', {}, token),
}

// ─── Admin ─────────────────────────────────────────────
export const portalAdmin = {
  getUsers: (token: string) =>
    request<import('../types/auth').PortalUser[]>('/admin/users', {}, token),

  getStats: (token: string) =>
    request<AdminStats>('/admin/stats', {}, token),
}

// ─── Types ─────────────────────────────────────────────
export interface Project {
  id: number
  title: string
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'on_hold'
  progress: number
  deadline: string
  budget: number
  manager: string
  description: string
  milestones: Milestone[]
}

export interface Milestone {
  id: number
  title: string
  completed: boolean
  due_date: string
}

export interface Invoice {
  id: number
  invoice_number: string
  amount: number
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_at?: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Ticket {
  id: number
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  replies: TicketReply[]
}

export interface TicketReply {
  id: number
  message: string
  sender: string
  is_staff: boolean
  created_at: string
}

export interface CreateTicketInput {
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface PartnerStats {
  total_referrals: number
  active_clients: number
  total_commission: number
  pending_commission: number
  tier: 'silver' | 'gold' | 'platinum'
}

export interface Referral {
  id: number
  client_name: string
  status: 'pending' | 'converted' | 'lost'
  commission: number
  referred_at: string
}

export interface Commission {
  id: number
  amount: number
  status: 'pending' | 'paid'
  description: string
  created_at: string
}

export interface AdminStats {
  total_users: number
  total_clients: number
  total_partners: number
  monthly_revenue: number
  open_tickets: number
  active_projects: number
}
