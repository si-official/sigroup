export interface PortalUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'client' | 'partner' | 'employee'
  avatar?: string
  company?: string
}

export interface AuthToken {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  user: PortalUser
}

export interface LoginCredentials {
  email: string
  password: string
}
