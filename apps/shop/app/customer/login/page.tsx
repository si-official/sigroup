'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { getUsers, saveUsers, DEFAULT_USERS } from '@/lib/auth'
import type { User } from '@/lib/auth'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white"/>
    </svg>
  )
}

type SocialModal = null | 'google' | 'facebook' | 'whatsapp'

export default function CustomerLogin() {
  const { login, user } = useAuth()
  const [tab, setTab] = useState<'login' | 'register' | 'phone'>('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', whatsapp: '', sameAsPhone: false })
  const [error, setError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  // Social modal state
  const [socialModal, setSocialModal] = useState<SocialModal>(null)
  const [socialEmail, setSocialEmail] = useState('')
  const [socialOtp, setSocialOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [waPhone, setWaPhone] = useState('')
  const [waOtp, setWaOtp] = useState('')
  const [waOtpSent, setWaOtpSent] = useState(false)

  // Phone login state
  const [phoneNum, setPhoneNum] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  // Redirect if already logged in
  if (typeof window !== 'undefined' && user) {
    if (user.role === 'super_admin' || user.role === 'admin') {
      window.location.href = '/admin'
    } else if (user.role === 'vendor') {
      window.location.href = '/seller/dashboard'
    } else {
      window.location.href = '/customer/dashboard'
    }
  }

  const redirectAfterLogin = (u: User) => {
    if (u.role === 'super_admin' || u.role === 'admin') window.location.href = '/admin'
    else if (u.role === 'vendor') window.location.href = '/seller/dashboard'
    else window.location.href = '/customer/dashboard'
  }

  const handleLogin = () => {
    setError('')
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return }
    const success = login(form.email, form.password)
    if (success) {
      const stored = localStorage.getItem('si_shop_current_user')
      if (stored) redirectAfterLogin(JSON.parse(stored))
    } else {
      setError('Invalid email or password. Please try again.')
    }
  }

  const handleRegister = () => {
    setError('')
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    const users = getUsers()
    if (users.find(u => u.email === form.email)) { setError('An account with this email already exists.'); return }
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: form.name,
      email: form.email,
      password: form.password,
      role: 'customer',
      avatar: form.name.charAt(0).toUpperCase(),
      verified: false,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    }
    saveUsers([...users, newUser])
    setRegisterSuccess(true)
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    const demoEmail = provider === 'google' ? 'google@demo.com' : 'facebook@demo.com'
    const users = getUsers()
    let user = users.find(u => u.email === demoEmail)
    if (!user) {
      user = {
        id: `u_social_${provider}_${Date.now()}`,
        name: provider === 'google' ? 'Google User' : 'Facebook User',
        email: demoEmail,
        password: '',
        role: 'customer',
        avatar: provider === 'google' ? 'G' : 'F',
        verified: true,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      }
      saveUsers([...users, user])
    }
    localStorage.setItem('si_shop_current_user', JSON.stringify(user))
    window.location.href = '/customer/dashboard'
  }

  const handleWhatsAppLogin = () => {
    if (!waOtpSent) { setWaOtpSent(true); return }
    if (waOtp !== '1234') { return }
    const users = getUsers()
    const demoEmail = `wa_${waPhone}@demo.com`
    let user = users.find(u => u.email === demoEmail)
    if (!user) {
      user = {
        id: `u_wa_${Date.now()}`,
        name: `WhatsApp User (${waPhone})`,
        email: demoEmail,
        password: '',
        role: 'customer',
        avatar: 'W',
        verified: true,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      }
      saveUsers([...users, user])
    }
    localStorage.setItem('si_shop_current_user', JSON.stringify(user))
    window.location.href = '/customer/dashboard'
  }

  const handlePhoneLogin = () => {
    setPhoneError('')
    if (!phoneOtpSent) {
      if (!phoneNum || phoneNum.length < 10) { setPhoneError('Enter a valid phone number.'); return }
      setPhoneOtpSent(true); return
    }
    if (phoneOtp !== '1234') { setPhoneError('Invalid OTP. Use 1234 for demo.'); return }
    const users = getUsers()
    const demoEmail = `phone_${phoneNum}@demo.com`
    let user = users.find(u => u.email === demoEmail)
    if (!user) {
      user = {
        id: `u_phone_${Date.now()}`,
        name: `User (${phoneNum})`,
        email: demoEmail,
        password: '',
        role: 'customer',
        avatar: 'P',
        verified: true,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      }
      saveUsers([...users, user])
    }
    localStorage.setItem('si_shop_current_user', JSON.stringify(user))
    window.location.href = '/customer/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Social login modal */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm">
            {socialModal === 'whatsapp' ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center"><WhatsAppIcon /></div>
                  <div>
                    <h3 className="font-black text-gray-900">WhatsApp Login</h3>
                    <p className="text-xs text-gray-500">Enter your WhatsApp number</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-600 bg-gray-50 flex-shrink-0">
                      🇧🇩 +880
                    </div>
                    <input value={waPhone} onChange={e => setWaPhone(e.target.value)} placeholder="01XXXXXXXXX"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25D366]" />
                  </div>
                  {waOtpSent && (
                    <div>
                      <input value={waOtp} onChange={e => setWaOtp(e.target.value)} placeholder="Enter OTP (demo: 1234)"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] text-center font-mono text-lg tracking-widest" />
                      <p className="text-xs text-gray-400 mt-1.5 text-center">OTP sent to +880{waPhone} — use <strong>1234</strong> for demo</p>
                    </div>
                  )}
                  <button onClick={handleWhatsAppLogin} className="w-full bg-[#25D366] hover:bg-[#1ea855] text-white font-black py-3.5 rounded-2xl transition">
                    {waOtpSent ? 'Verify OTP' : 'Send OTP'}
                  </button>
                  <button onClick={() => { setSocialModal(null); setWaOtpSent(false); setWaPhone(''); setWaOtp('') }}
                    className="w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-2xl hover:bg-gray-50 transition text-sm">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${socialModal === 'google' ? 'bg-white border border-gray-200' : 'bg-[#1877F2]'}`}>
                    {socialModal === 'google' ? <GoogleIcon /> : <FacebookIcon />}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{socialModal === 'google' ? 'Google' : 'Facebook'} Sign-In</h3>
                    <p className="text-xs text-gray-500">Demo mode — pre-filled credentials</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                    <input value={socialModal === 'google' ? 'google@demo.com' : 'facebook@demo.com'} readOnly
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-600" />
                  </div>
                  <button onClick={() => { handleSocialLogin(socialModal); setSocialModal(null) }}
                    className={`w-full text-white font-black py-3.5 rounded-2xl transition ${socialModal === 'google' ? 'bg-[#4285F4] hover:bg-[#3367d6]' : 'bg-[#1877F2] hover:bg-[#1464d2]'}`}>
                    Sign in as Demo {socialModal === 'google' ? 'Google' : 'Facebook'} User
                  </button>
                  <button onClick={() => setSocialModal(null)}
                    className="w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-2xl hover:bg-gray-50 transition text-sm">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
            <span className="text-white font-black text-xl">SI</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">SI Shop</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Demo accounts */}
        <div className="bg-gray-800 text-gray-100 rounded-2xl p-4 mb-5 text-xs space-y-1.5">
          <p className="font-bold text-gray-300 mb-2 text-[11px] uppercase tracking-wider">Demo Accounts</p>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" /><span className="text-gray-400">Super Admin:</span><span className="font-mono text-gray-200">sioffice2021@gmail.com / Ikshahid9</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-blue-400 rounded-full flex-shrink-0" /><span className="text-gray-400">Vendor:</span><span className="font-mono text-gray-200">vendor@demo.com / Vendor@123</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-green-400 rounded-full flex-shrink-0" /><span className="text-gray-400">Customer:</span><span className="font-mono text-gray-200">customer@demo.com / Customer@123</span></div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
          <button onClick={() => setTab('login')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Login</button>
          <button onClick={() => setTab('phone')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Phone</button>
          <button onClick={() => setTab('register')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Register</button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
          {/* ── LOGIN TAB ── */}
          {tab === 'login' && (
            <div className="space-y-4">
              {/* Social buttons — one line, 3 icons */}
              <div>
                <p className="text-xs text-gray-400 text-center mb-2.5">Continue with</p>
                <div className="grid grid-cols-3 gap-2.5">
                  <button onClick={() => setSocialModal('google')}
                    className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition">
                    <GoogleIcon />
                  </button>
                  <button onClick={() => setSocialModal('facebook')}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1464d2] text-white font-semibold py-3 rounded-xl transition">
                    <FacebookIcon />
                  </button>
                  <button onClick={() => setSocialModal('whatsapp')}
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ea855] text-white font-semibold py-3 rounded-xl transition">
                    <WhatsAppIcon />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mt-1 text-center">
                  <p className="text-[10px] text-gray-400">Google</p>
                  <p className="text-[10px] text-gray-400">Facebook</p>
                  <p className="text-[10px] text-gray-400">WhatsApp</p>
                </div>
              </div>

              <div className="relative text-center py-1">
                <span className="relative bg-white px-3 text-gray-400 text-sm z-10">— or sign in with email —</span>
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Your password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="accent-red-600" /> Remember me
                </label>
                <button className="text-red-600 hover:underline font-medium">Forgot password?</button>
              </div>

              {/* Login button */}
              <button onClick={handleLogin} className="block w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition shadow-sm text-center">
                Login to Account
              </button>

              {/* Register link */}
              <p className="text-center text-sm text-gray-500 pt-1">
                New to SI Shop?{' '}
                <button onClick={() => setTab('register')} className="text-red-600 font-semibold hover:underline">
                  Create account
                </button>
              </p>
            </div>
          )}

          {/* ── PHONE TAB ── */}
          {tab === 'phone' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-sm text-gray-500">Login with your phone number via OTP</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-600 bg-gray-50 flex-shrink-0">
                    🇧🇩 +880
                  </div>
                  <input value={phoneNum} onChange={e => setPhoneNum(e.target.value)} placeholder="01XXXXXXXXX" disabled={phoneOtpSent}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 disabled:bg-gray-50" />
                </div>
              </div>
              {phoneOtpSent && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter OTP</label>
                  <input value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 text-center text-xl font-mono tracking-widest" />
                  <p className="text-xs text-gray-400 mt-1.5 text-center">OTP sent to +880{phoneNum} — use <strong>1234</strong> for demo</p>
                </div>
              )}
              {phoneError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{phoneError}</div>}
              <button onClick={handlePhoneLogin} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition">
                {phoneOtpSent ? 'Verify OTP & Login' : 'Send OTP'}
              </button>
              {phoneOtpSent && (
                <button onClick={() => { setPhoneOtpSent(false); setPhoneOtp(''); setPhoneError('') }}
                  className="w-full text-gray-500 text-sm hover:underline">
                  Change number
                </button>
              )}
            </div>
          )}

          {/* ── REGISTER TAB ── */}
          {tab === 'register' && (
            registerSuccess ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="font-black text-gray-900 text-xl mb-2">Account Created!</h3>
                <p className="text-gray-500 text-sm mb-5">Your account has been created successfully.</p>
                <button onClick={() => { setTab('login'); setRegisterSuccess(false) }} className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-2xl transition">
                  Login Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Social signup */}
                <div className="space-y-2">
                  <button onClick={() => setSocialModal('google')}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition text-sm">
                    <GoogleIcon /> Sign up with Google
                  </button>
                  <button onClick={() => setSocialModal('facebook')}
                    className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1464d2] text-white font-semibold py-3 rounded-xl transition text-sm">
                    <FacebookIcon /> Sign up with Facebook
                  </button>
                </div>
                <div className="relative text-center py-1">
                  <span className="relative bg-white px-3 text-gray-400 text-sm z-10">— or register with email —</span>
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-600 bg-gray-50 flex-shrink-0">🇧🇩 +880</div>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01XXXXXXXXX"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox" checked={form.sameAsPhone} onChange={e => { set('sameAsPhone', e.target.checked); if (e.target.checked) set('whatsapp', form.phone) }} className="accent-red-600" />
                      Same as phone
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-600 bg-gray-50 flex-shrink-0">🇧🇩 +880</div>
                    <input value={form.sameAsPhone ? form.phone : form.whatsapp} onChange={e => set('whatsapp', e.target.value)} disabled={form.sameAsPhone} placeholder="01XXXXXXXXX"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 disabled:bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                </div>
                {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>}
                <p className="text-xs text-gray-400">Registration creates a customer account. To sell, use the seller registration page.</p>
                <button onClick={handleRegister} className="block w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl transition shadow-sm text-center">
                  Create Account →
                </button>
              </div>
            )
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Want to sell? <Link href="/seller/register" className="text-red-600 font-semibold hover:underline">Register as Seller</Link>
        </p>
      </div>
    </div>
  )
}
