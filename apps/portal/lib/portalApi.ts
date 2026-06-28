// Re-export from shared — copy here for standalone deployment
// In production, install as @sigroup/shared package or symlink

const PORTAL_API = process.env.NEXT_PUBLIC_PORTAL_API_URL || 'https://portal.sigroup.com.bd/api'

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${PORTAL_API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  me: (token: string) => apiFetch<User>('/auth/me', {}, token),
  logout: (token: string) => apiFetch('/auth/logout', { method: 'POST' }, token),

  // Client
  projects: (token: string) => apiFetch<Project[]>('/client/projects', {}, token),
  invoices: (token: string) => apiFetch<Invoice[]>('/client/invoices', {}, token),
  tickets: (token: string) => apiFetch<Ticket[]>('/client/tickets', {}, token),
  createTicket: (data: object, token: string) =>
    apiFetch<Ticket>('/client/tickets', { method: 'POST', body: JSON.stringify(data) }, token),
  replyTicket: (id: number, msg: string, token: string) =>
    apiFetch<TicketReply>(`/client/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message: msg }) }, token),
  payInvoice: (id: number, token: string) =>
    apiFetch<{ payment_url: string }>(`/client/invoices/${id}/pay`, { method: 'POST' }, token),

  // Partner
  partnerStats: (token: string) => apiFetch<PartnerStats>('/partner/stats', {}, token),
  referrals: (token: string) => apiFetch<Referral[]>('/partner/referrals', {}, token),
  commissions: (token: string) => apiFetch<Commission[]>('/partner/commissions', {}, token),

  // Admin
  adminStats: (token: string) => apiFetch<AdminStats>('/admin/stats', {}, token),
  users: (token: string) => apiFetch<User[]>('/admin/users', {}, token),
}

// Types
export interface User { id: number; name: string; email: string; role: 'admin'|'client'|'partner'|'employee'; avatar?: string; company?: string }
export interface Project { id: number; title: string; status: string; progress: number; deadline: string; budget: number; manager: string; description: string; milestones: Milestone[] }
export interface Milestone { id: number; title: string; completed: boolean; due_date: string }
export interface Invoice { id: number; invoice_number: string; amount: number; status: string; due_date: string; paid_at?: string; items: InvoiceItem[] }
export interface InvoiceItem { description: string; quantity: number; unit_price: number; total: number }
export interface Ticket { id: number; subject: string; status: string; priority: string; created_at: string; replies: TicketReply[] }
export interface TicketReply { id: number; message: string; sender: string; is_staff: boolean; created_at: string }
export interface PartnerStats { total_referrals: number; active_clients: number; total_commission: number; pending_commission: number; tier: string }
export interface Referral { id: number; client_name: string; status: string; commission: number; referred_at: string }
export interface Commission { id: number; amount: number; status: string; description: string; created_at: string }
export interface AdminStats { total_users: number; total_clients: number; total_partners: number; monthly_revenue: number; open_tickets: number; active_projects: number }
