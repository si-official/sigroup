export const DOMAIN = 'sigroup.com.bd'

export const SUBDOMAINS = {
  main:   { host: `www.${DOMAIN}`,    path: '/main' },
  shop:   { host: `shop.${DOMAIN}`,   path: '/shop' },
  school: { host: `school.${DOMAIN}`, path: '/school' },
  portal: { host: `portal.${DOMAIN}`, path: '/portal' },
} as const

export type SubdomainKey = keyof typeof SUBDOMAINS

export function getSubdomainFromHost(host: string): SubdomainKey {
  const sub = host.split('.')[0]
  if (sub in SUBDOMAINS) return sub as SubdomainKey
  return 'main'
}
