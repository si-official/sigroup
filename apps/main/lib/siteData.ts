'use client'

export interface PortfolioItem {
  id: string
  title: string
  category: string
  description: string
  image: string
  liveUrl: string
  techStack: string[]
  featured: boolean
}

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
}

export interface Testimonial {
  id: string
  name: string
  company: string
  role: string
  message: string
  rating: number
  avatar: string
}

export interface DevPackage {
  id: string
  name: string
  price: string
  features: string[]
  popular: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: string
  photo: string
  bio: string
}

export interface AboutContent {
  description: string
  mission: string
  vision: string
  stats: { years: number; clients: number; projects: number; teamSize: number }
  teamMembers: TeamMember[]
  countries: string[]
}

export interface PartnershipContent {
  heading: string
  subheading: string
  description: string
  benefits: string[]
  inquiries: PartnershipInquiry[]
}

export interface PartnershipInquiry {
  id: string
  name: string
  company: string
  email: string
  date: string
  status: 'pending' | 'reviewed' | 'contacted'
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  date: string
  read: boolean
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
  mapEmbed: string
  messages: ContactMessage[]
}

export interface SiteSetting {
  siteName: string
  tagline: string
  logoUrl: string
  email: string
  phone: string
  address: string
  facebook: string
  linkedin: string
  github: string
  whatsapp: string
  primaryColor: string
  font: string
  maintenanceMode: boolean
}

export interface SeoSetting {
  metaTitle: string
  metaDescription: string
  keywords: string
  ogImage: string
  gaId: string
  robots: string
}

// --- Default data ---

const defaultPortfolio: PortfolioItem[] = [
  { id: '1', title: 'SI School LMS', category: 'Web', description: 'Full-featured learning management system with course management, quizzes, and student tracking.', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=80', liveUrl: 'https://school.sigroup.com.bd', techStack: ['Next.js', 'TypeScript', 'Tailwind', 'PHP'], featured: true },
  { id: '2', title: 'SI Shop E-Commerce', category: 'Web', description: 'Modern e-commerce platform with cart, checkout, and product management.', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', liveUrl: 'https://shop.sigroup.com.bd', techStack: ['Next.js', 'TypeScript', 'Tailwind', 'MySQL'], featured: true },
  { id: '3', title: 'SI Portal', category: 'Web', description: 'Internal business portal for employee management, invoicing, and analytics.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', liveUrl: 'https://portal.sigroup.com.bd', techStack: ['Next.js', 'Tailwind', 'PHP REST API'], featured: false },
  { id: '4', title: 'Mobile Banking App', category: 'Mobile', description: 'Cross-platform mobile banking application with biometric auth and real-time transactions.', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80', liveUrl: '#', techStack: ['React Native', 'Node.js', 'PostgreSQL'], featured: true },
  { id: '5', title: 'Brand Identity System', category: 'Design', description: 'Complete brand identity design including logo, color palette, typography and guidelines.', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', liveUrl: '#', techStack: ['Figma', 'Illustrator', 'Photoshop'], featured: false },
  { id: '6', title: 'Inventory Management Software', category: 'Software', description: 'Desktop inventory management system with barcode scanning, reports and multi-branch support.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', liveUrl: '#', techStack: ['Electron', 'React', 'SQLite'], featured: false },
]

const defaultServices: Service[] = [
  { id: '1', title: 'Web Development', description: 'Modern, fast, and scalable web applications built with the latest technologies.', icon: '🌐', features: ['Next.js & React', 'TypeScript', 'Responsive Design', 'SEO Optimized', 'Performance First'] },
  { id: '2', title: 'Mobile App Development', description: 'Cross-platform mobile apps for iOS and Android with native performance.', icon: '📱', features: ['React Native', 'iOS & Android', 'Push Notifications', 'Offline Support', 'App Store Deployment'] },
  { id: '3', title: 'UI/UX Design', description: 'Beautiful, intuitive designs that delight users and drive conversions.', icon: '🎨', features: ['Figma Design', 'Prototyping', 'User Research', 'Design Systems', 'Brand Identity'] },
  { id: '4', title: 'Backend & API', description: 'Robust backend systems and REST APIs that power your applications.', icon: '⚙️', features: ['PHP & Laravel', 'Node.js', 'MySQL & PostgreSQL', 'REST APIs', 'Authentication'] },
  { id: '5', title: 'Digital Marketing', description: 'Data-driven marketing strategies to grow your online presence.', icon: '📈', features: ['SEO & SEM', 'Social Media', 'Content Strategy', 'Email Marketing', 'Analytics'] },
]

const defaultTestimonials: Testimonial[] = [
  { id: '1', name: 'Rahman Ahmed', company: 'TechBD Ltd', role: 'CEO', message: 'SI Group delivered our project on time and exceeded expectations. Their team is professional and highly skilled. Highly recommended!', rating: 5, avatar: 'RA' },
  { id: '2', name: 'Fatima Khan', company: 'EduStar BD', role: 'Director', message: 'The LMS they built for us transformed how we deliver education. Students love it and management is easy. Outstanding work!', rating: 5, avatar: 'FK' },
  { id: '3', name: 'Karim Hossain', company: 'ShopNow BD', role: 'Founder', message: 'Our e-commerce platform has been rock solid. Sales increased 3x after launch. The team was a pleasure to work with.', rating: 5, avatar: 'KH' },
  { id: '4', name: 'Sarah Islam', company: 'GlobalTech', role: 'CTO', message: 'Excellent technical expertise and communication. They understood our requirements perfectly and delivered a great product.', rating: 4, avatar: 'SI' },
]

const defaultPackages: DevPackage[] = [
  { id: '1', name: 'Starter', price: '৳15,000', features: ['1-5 Page Website', 'Responsive Design', 'Contact Form', 'Basic SEO', '1 Month Support'], popular: false },
  { id: '2', name: 'Professional', price: '৳35,000', features: ['Up to 15 Pages', 'Custom Design', 'CMS Integration', 'SEO Optimized', 'E-commerce Ready', '3 Months Support', 'Analytics Setup'], popular: true },
  { id: '3', name: 'Enterprise', price: 'Custom', features: ['Unlimited Pages', 'Full Custom Development', 'Advanced Features', 'API Integration', 'Mobile App', 'Priority Support', 'SLA Guarantee'], popular: false },
]

const defaultAbout: AboutContent = {
  description: 'SI Group is Bangladesh\'s leading technology conglomerate, delivering cutting-edge digital solutions across web, mobile, education, and e-commerce. Founded with a vision to transform businesses through technology, we serve clients in 12+ countries.',
  mission: 'To empower businesses with innovative technology solutions that drive growth, efficiency, and digital transformation.',
  vision: 'To be the most trusted technology partner in South Asia, known for excellence, reliability, and innovation.',
  stats: { years: 5, clients: 150, projects: 300, teamSize: 25 },
  teamMembers: [
    { id: '1', name: 'Shahidul Islam', role: 'Founder & CEO', photo: '', bio: 'Technology entrepreneur with 10+ years of experience in software development and business management.' },
    { id: '2', name: 'Arafat Hossain', role: 'Lead Developer', photo: '', bio: 'Full-stack developer specializing in React, Next.js and PHP backend systems.' },
  ],
  countries: ['Bangladesh', 'USA', 'UK', 'Canada', 'Australia', 'UAE', 'Saudi Arabia', 'Malaysia', 'Singapore', 'India', 'Pakistan', 'Qatar'],
}

const defaultPartnership: PartnershipContent = {
  heading: 'Partner With Us',
  subheading: 'Grow Together',
  description: 'Join our growing network of technology partners. We offer revenue sharing, co-marketing opportunities, and technical support to help you succeed.',
  benefits: ['Revenue Sharing Program', 'Co-Marketing Support', 'Technical Training', 'Dedicated Partner Manager', 'Priority Support', 'Partner Portal Access'],
  inquiries: [
    { id: '1', name: 'Ali Hassan', company: 'TechStart BD', email: 'ali@techstart.bd', date: '2024-12-01', status: 'pending' },
    { id: '2', name: 'Rania Begum', company: 'Digital Hub', email: 'rania@digitalhub.com', date: '2024-11-28', status: 'reviewed' },
    { id: '3', name: 'Jahangir Alam', company: 'SoftPro', email: 'jahangir@softpro.bd', date: '2024-11-20', status: 'contacted' },
    { id: '4', name: 'Nasrin Sultana', company: 'Web Agency BD', email: 'nasrin@webagency.bd', date: '2024-11-15', status: 'pending' },
    { id: '5', name: 'Tariq Rahman', company: 'AppMakers', email: 'tariq@appmakers.io', date: '2024-11-10', status: 'reviewed' },
  ],
}

const defaultContactInfo: ContactInfo = {
  email: 'sioffice2021@gmail.com',
  phone: '+880 1XXX-XXXXXX',
  address: 'Dhaka, Bangladesh',
  mapEmbed: '',
  messages: [
    { id: '1', name: 'Kamal Uddin', email: 'kamal@email.com', subject: 'Website Development Query', message: 'I need a website for my restaurant business. Can you provide a quote?', date: '2024-12-05', read: false },
    { id: '2', name: 'Nadia Islam', email: 'nadia@business.com', subject: 'Mobile App Inquiry', message: 'We need a mobile app for our delivery service. What is your timeline and pricing?', date: '2024-12-04', read: true },
    { id: '3', name: 'Rahim Chowdhury', email: 'rahim@corp.bd', subject: 'Enterprise Solution', message: 'Looking for a complete ERP solution for our company with 50+ employees.', date: '2024-12-03', read: false },
    { id: '4', name: 'Sadia Ahmed', email: 'sadia@startup.io', subject: 'Partnership Opportunity', message: 'Interested in partnering with SI Group for a joint project. Can we schedule a call?', date: '2024-12-02', read: true },
    { id: '5', name: 'Milon Hasan', email: 'milon@shop.com', subject: 'E-commerce Platform', message: 'Need an e-commerce solution for my clothing brand. Please share your portfolio and pricing.', date: '2024-12-01', read: false },
    { id: '6', name: 'Tania Khatun', email: 'tania@edu.bd', subject: 'LMS Development', message: 'Our school needs an LMS. Can you customize your existing solution for us?', date: '2024-11-30', read: true },
    { id: '7', name: 'Faruk Ahmed', email: 'faruk@tech.com', subject: 'API Integration', message: 'Need help integrating payment gateway and SMS API into our existing system.', date: '2024-11-29', read: false },
    { id: '8', name: 'Roksana Begum', email: 'roksana@ngo.org', subject: 'Non-profit Website', message: 'We are an NGO looking for an affordable website solution with donation system.', date: '2024-11-28', read: true },
  ],
}

const defaultSiteSettings: SiteSetting = {
  siteName: 'SI Group',
  tagline: 'Leading Technology Conglomerate in Bangladesh',
  logoUrl: '',
  email: 'sioffice2021@gmail.com',
  phone: '+880 1XXX-XXXXXX',
  address: 'Dhaka, Bangladesh',
  facebook: 'https://facebook.com/sigroup',
  linkedin: 'https://linkedin.com/company/sigroup',
  github: 'https://github.com/sigroup',
  whatsapp: '+8801XXXXXXXXX',
  primaryColor: '#7c3aed',
  font: 'Inter',
  maintenanceMode: false,
}

const defaultSeoSettings: SeoSetting = {
  metaTitle: 'SI Group | Leading Technology Conglomerate in Bangladesh',
  metaDescription: 'SI Group – Bangladesh\'s most trusted technology conglomerate. Web development, mobile apps, education, e-commerce and more. Serving 12+ countries.',
  keywords: 'SI Group, web development Bangladesh, mobile app development, software company Bangladesh, technology conglomerate',
  ogImage: '/og-image.jpg',
  gaId: '',
  robots: 'User-agent: *\nAllow: /',
}

// --- Storage helpers ---

function get<T>(key: string, def: T): T {
  if (typeof window === 'undefined') return def
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : def
  } catch { return def }
}

function save<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export const getPortfolioItems = () => get<PortfolioItem[]>('si_portfolio', defaultPortfolio)
export const savePortfolioItems = (d: PortfolioItem[]) => save('si_portfolio', d)

export const getServices = () => get<Service[]>('si_services', defaultServices)
export const saveServices = (d: Service[]) => save('si_services', d)

export const getTestimonials = () => get<Testimonial[]>('si_testimonials', defaultTestimonials)
export const saveTestimonials = (d: Testimonial[]) => save('si_testimonials', d)

export const getDevPackages = () => get<DevPackage[]>('si_packages', defaultPackages)
export const saveDevPackages = (d: DevPackage[]) => save('si_packages', d)

export const getAboutContent = () => get<AboutContent>('si_about', defaultAbout)
export const saveAboutContent = (d: AboutContent) => save('si_about', d)

export const getPartnershipContent = () => get<PartnershipContent>('si_partnership', defaultPartnership)
export const savePartnershipContent = (d: PartnershipContent) => save('si_partnership', d)

export const getContactInfo = () => get<ContactInfo>('si_contact', defaultContactInfo)
export const saveContactInfo = (d: ContactInfo) => save('si_contact', d)

export const getSiteSettings = () => get<SiteSetting>('si_settings', defaultSiteSettings)
export const saveSiteSettings = (d: SiteSetting) => save('si_settings', d)

export const getSeoSettings = () => get<SeoSetting>('si_seo', defaultSeoSettings)
export const saveSeoSettings = (d: SeoSetting) => save('si_seo', d)
