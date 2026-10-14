'use client'
import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { useAdmin } from '@/context/AdminContext'

export default function ProfilePage() {
  const { currentAdmin, updateProfile } = useAdmin()
  const [form, setForm] = useState({
    name: currentAdmin?.name || '',
    phone: currentAdmin?.phone || '',
    department: currentAdmin?.department || '',
    bio: currentAdmin?.bio || '',
  })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [saved, setSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const initials = form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const handleSave = () => {
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePasswordChange = () => {
    setPwError('')
    if (passwords.newPass.length < 6) { setPwError('Password must be at least 6 characters'); return }
    if (passwords.newPass !== passwords.confirm) { setPwError('Passwords do not match'); return }
    setPwSuccess(true)
    setPasswords({ current: '', newPass: '', confirm: '' })
    setTimeout(() => setPwSuccess(false), 2000)
  }

  return (
    <AdminLayout title="Profile" breadcrumb={[{ label: 'Profile' }]}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">👤 My Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your admin account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar + info */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-3xl mb-4 shadow-lg shadow-purple-900/30">
            {initials}
          </div>
          <p className="text-gray-900 dark:text-white font-black text-lg">{currentAdmin?.name}</p>
          <p className="text-gray-500 text-sm">{currentAdmin?.email}</p>
          <span className="mt-2 text-xs px-3 py-1 rounded-full font-bold bg-red-900/60 text-red-300 border border-red-800">
            {currentAdmin?.role?.replace('_', ' ')}
          </span>

          <div className="w-full mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Department</span>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">{currentAdmin?.department || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Last Login</span>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                {currentAdmin?.lastLogin ? new Date(currentAdmin.lastLogin).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Active</span>
            </div>
          </div>
        </div>

        {/* Right: Edit form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile form */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-900 dark:text-white font-bold mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-gray-500 text-xs mb-1 block font-medium">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-500 text-xs mb-1 block font-medium">Email Address</label>
                <input
                  value={currentAdmin?.email || ''}
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-500 rounded-xl px-3 py-2.5 text-sm cursor-not-allowed"
                />
                <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block font-medium">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01700000000"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block font-medium">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Management"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-500 text-xs mb-1 block font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              className={`mt-4 px-6 py-2.5 rounded-xl font-bold text-sm transition ${saved ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
            >
              {saved ? '✓ Profile Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Change password */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-900 dark:text-white font-bold mb-4">Change Password</h3>
            <div className="space-y-3">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'newPass', label: 'New Password' },
                { key: 'confirm', label: 'Confirm New Password' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-gray-500 text-xs mb-1 block font-medium">{f.label}</label>
                  <input
                    type="password"
                    value={(passwords as Record<string, string>)[f.key]}
                    onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
              {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
              {pwSuccess && <p className="text-emerald-500 text-xs">✓ Password updated successfully</p>}
              <button
                onClick={handlePasswordChange}
                className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
