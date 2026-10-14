'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getPortfolioItems, getServices, getTestimonials, getDevPackages } from '@/lib/siteData'

const mockActivity = [
  { action: 'Portfolio item added', detail: 'SI Shop E-Commerce', time: '2 hours ago', icon: '🖼️' },
  { action: 'Service updated', detail: 'Web Development', time: '5 hours ago', icon: '⚙️' },
  { action: 'New message received', detail: 'From: kamal@email.com', time: '1 day ago', icon: '✉️' },
  { action: 'Testimonial added', detail: 'Rahman Ahmed, TechBD', time: '2 days ago', icon: '💬' },
  { action: 'Settings updated', detail: 'Social media links', time: '3 days ago', icon: '🔧' },
]

export default function DashboardPage() {
  const [counts, setCounts] = useState({ portfolio: 0, services: 0, testimonials: 0, packages: 0 })

  useEffect(() => {
    setCounts({
      portfolio: getPortfolioItems().length,
      services: getServices().length,
      testimonials: getTestimonials().length,
      packages: getDevPackages().length,
    })
  }, [])

  const stats = [
    { label: 'Portfolio Items', value: counts.portfolio, icon: '🖼️', color: 'bg-purple-600', href: '/admin/portfolio' },
    { label: 'Services', value: counts.services, icon: '⚙️', color: 'bg-blue-600', href: '/admin/services' },
    { label: 'Unread Messages', value: 5, icon: '✉️', color: 'bg-green-600', href: '/admin/contact' },
    { label: 'Monthly Visitors', value: '8,450', icon: '👥', color: 'bg-orange-500', href: '#' },
  ]

  const quickActions = [
    { label: 'Add Portfolio Item', icon: '➕', href: '/admin/portfolio', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Edit Services', icon: '✏️', href: '/admin/services', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'View Messages', icon: '✉️', href: '/admin/contact', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Site Settings', icon: '🔧', href: '/admin/settings', color: 'bg-gray-700 hover:bg-gray-600' },
  ]

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening on your site.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(stat => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-lg mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-0.5">{stat.label}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map(action => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm font-medium transition-colors ${action.color}`}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {mockActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-gray-400 truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Website preview card */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Live Website</h2>
            <p className="text-gray-400 text-sm mt-0.5">sigroup.com.bd — Last updated today</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-400 text-sm">Online</span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Visit Site →
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
