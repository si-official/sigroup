'use client'
import { useState } from 'react'
import ShopAdminLayout from '@/components/ShopAdminLayout'
import { Save, CheckCircle, Globe, CreditCard, Percent, Mail, AlertTriangle } from 'lucide-react'

const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'commission', label: 'Commission', icon: Percent },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
]

export default function SettingsPage() {
  const [tab, setTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [general, setGeneral] = useState({
    siteName: 'SI Shop',
    tagline: 'Bangladesh\'s #1 Digital Marketplace',
    email: 'support@sigroup.com.bd',
    phone: '+880 1700-000000',
    address: 'Dhaka, Bangladesh',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    language: 'en',
  })
  const [payment, setPayment] = useState({
    bkash: true,
    nagad: true,
    sslcommerz: true,
    bank: false,
    bkashApiKey: 'app_key_***',
    nagadApiKey: 'nagad_key_***',
    sslStore: 'sigroup_store',
  })
  const [commission, setCommission] = useState({
    rate: 15,
    minPayout: 1000,
    payoutCycle: 'monthly',
    autoApprove: false,
  })
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'sioffice2021@gmail.com',
    smtpPass: '••••••••••',
    fromName: 'SI Shop',
    fromEmail: 'noreply@sigroup.com.bd',
    orderConfirmation: true,
    vendorApproval: true,
    payoutAlert: true,
  })
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message: 'We are performing scheduled maintenance. We\'ll be back shortly.',
    allowAdmins: true,
  })

  function handleSave() {
    localStorage.setItem('si_shop_settings', JSON.stringify({ general, payment, commission, emailSettings, maintenance }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#82b541] focus:ring-1 focus:ring-[#82b541]/20 transition-colors"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <ShopAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">Configure your marketplace</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#82b541] hover:bg-[#6ea032] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <div className="w-48 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left border-b border-gray-50 last:border-0 transition-colors ${
                    tab === t.id
                      ? 'bg-[#82b541]/10 text-[#82b541] font-medium border-r-2 border-r-[#82b541]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {/* General */}
          {tab === 'general' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 pb-3 border-b border-gray-100">General Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Site Name</label>
                  <input type="text" value={general.siteName} onChange={e => setGeneral(g => ({ ...g, siteName: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input type="text" value={general.tagline} onChange={e => setGeneral(g => ({ ...g, tagline: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Support Email</label>
                  <input type="email" value={general.email} onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="text" value={general.phone} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <select value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))} className={inputClass + ' bg-white'}>
                    <option value="BDT">BDT (Bangladeshi Taka)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Timezone</label>
                  <select value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))} className={inputClass + ' bg-white'}>
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" value={general.address} onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))} className={inputClass} />
              </div>
            </div>
          )}

          {/* Payment */}
          {tab === 'payment' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800 pb-3 border-b border-gray-100">Payment Methods</h3>
              <div className="space-y-4">
                {[
                  { key: 'bkash', label: 'bKash', desc: 'Mobile financial service — most popular in Bangladesh', color: 'bg-pink-500' },
                  { key: 'nagad', label: 'Nagad', desc: 'Bangladesh Post Office digital financial service', color: 'bg-orange-500' },
                  { key: 'sslcommerz', label: 'SSLCommerz', desc: 'Online payment gateway — cards, net banking, wallets', color: 'bg-blue-500' },
                  { key: 'bank', label: 'Bank Transfer', desc: 'Manual bank transfer with order verification', color: 'bg-green-500' },
                ].map(m => (
                  <div key={m.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center text-white font-bold text-xs`}>
                        {m.label[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{m.label}</div>
                        <div className="text-xs text-gray-400">{m.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPayment(p => ({ ...p, [m.key]: !p[m.key as keyof typeof p] }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        payment[m.key as keyof typeof payment] ? 'bg-[#82b541]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        payment[m.key as keyof typeof payment] ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className={labelClass}>bKash App Key</label>
                  <input type="text" value={payment.bkashApiKey} onChange={e => setPayment(p => ({ ...p, bkashApiKey: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Nagad API Key</label>
                  <input type="text" value={payment.nagadApiKey} onChange={e => setPayment(p => ({ ...p, nagadApiKey: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SSLCommerz Store ID</label>
                  <input type="text" value={payment.sslStore} onChange={e => setPayment(p => ({ ...p, sslStore: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Commission */}
          {tab === 'commission' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800 pb-3 border-b border-gray-100">Commission & Payout Settings</h3>
              <div>
                <label className={labelClass}>Platform Commission Rate: <span className="text-[#82b541] font-bold">{commission.rate}%</span></label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={1}
                  value={commission.rate}
                  onChange={e => setCommission(c => ({ ...c, rate: Number(e.target.value) }))}
                  className="w-full accent-[#82b541]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Vendors receive <strong>{100 - commission.rate}%</strong> of each sale.
                  At current rate: ৳1,000 sale → ৳{commission.rate * 10} platform · ৳{(100 - commission.rate) * 10} vendor.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Minimum Payout (৳)</label>
                  <input
                    type="number"
                    value={commission.minPayout}
                    onChange={e => setCommission(c => ({ ...c, minPayout: Number(e.target.value) }))}
                    className={inputClass}
                    min={100}
                  />
                </div>
                <div>
                  <label className={labelClass}>Payout Cycle</label>
                  <select value={commission.payoutCycle} onChange={e => setCommission(c => ({ ...c, payoutCycle: e.target.value }))} className={inputClass + ' bg-white'}>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800 text-sm">Auto-approve payouts</div>
                  <div className="text-xs text-gray-400">Automatically approve payout requests under minimum threshold</div>
                </div>
                <button
                  onClick={() => setCommission(c => ({ ...c, autoApprove: !c.autoApprove }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${commission.autoApprove ? 'bg-[#82b541]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${commission.autoApprove ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          {tab === 'email' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800 pb-3 border-b border-gray-100">Email / SMTP Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>SMTP Host</label>
                  <input type="text" value={emailSettings.smtpHost} onChange={e => setEmailSettings(s => ({ ...s, smtpHost: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SMTP Port</label>
                  <input type="text" value={emailSettings.smtpPort} onChange={e => setEmailSettings(s => ({ ...s, smtpPort: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SMTP Username</label>
                  <input type="text" value={emailSettings.smtpUser} onChange={e => setEmailSettings(s => ({ ...s, smtpUser: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SMTP Password</label>
                  <input type="password" value={emailSettings.smtpPass} onChange={e => setEmailSettings(s => ({ ...s, smtpPass: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>From Name</label>
                  <input type="text" value={emailSettings.fromName} onChange={e => setEmailSettings(s => ({ ...s, fromName: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>From Email</label>
                  <input type="email" value={emailSettings.fromEmail} onChange={e => setEmailSettings(s => ({ ...s, fromEmail: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold text-gray-700">Notification Triggers</h4>
                {[
                  { key: 'orderConfirmation', label: 'Order Confirmation', desc: 'Send email when an order is placed' },
                  { key: 'vendorApproval', label: 'Vendor Approval', desc: 'Notify vendor when their account is approved' },
                  { key: 'payoutAlert', label: 'Payout Alert', desc: 'Notify vendor when payout is processed' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{n.label}</div>
                      <div className="text-xs text-gray-400">{n.desc}</div>
                    </div>
                    <button
                      onClick={() => setEmailSettings(s => ({ ...s, [n.key]: !s[n.key as keyof typeof s] }))}
                      className={`w-10 h-5 rounded-full transition-colors relative ${emailSettings[n.key as keyof typeof emailSettings] ? 'bg-[#82b541]' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailSettings[n.key as keyof typeof emailSettings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance */}
          {tab === 'maintenance' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800 pb-3 border-b border-gray-100">Maintenance Mode</h3>
              <div className={`p-4 rounded-xl border ${maintenance.enabled ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className={maintenance.enabled ? 'text-red-500' : 'text-gray-400'} />
                    <span className="font-semibold text-gray-800">Maintenance Mode</span>
                    {maintenance.enabled && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">ACTIVE</span>
                    )}
                  </div>
                  <button
                    onClick={() => setMaintenance(m => ({ ...m, enabled: !m.enabled }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${maintenance.enabled ? 'bg-red-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${maintenance.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, the shop shows a maintenance page to visitors.
                  {maintenance.enabled && ' ⚠️ Your shop is currently offline for customers.'}
                </p>
              </div>
              <div>
                <label className={labelClass}>Maintenance Message</label>
                <textarea
                  value={maintenance.message}
                  onChange={e => setMaintenance(m => ({ ...m, message: e.target.value }))}
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800 text-sm">Allow admin access during maintenance</div>
                  <div className="text-xs text-gray-400">Admins can still browse and manage the shop</div>
                </div>
                <button
                  onClick={() => setMaintenance(m => ({ ...m, allowAdmins: !m.allowAdmins }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${maintenance.allowAdmins ? 'bg-[#82b541]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${maintenance.allowAdmins ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShopAdminLayout>
  )
}
