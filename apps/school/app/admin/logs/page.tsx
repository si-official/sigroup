'use client'
import { useState } from 'react'
import SchoolAdminLayout from '@/components/SchoolAdminLayout'

interface LogEntry {
  id: number; timestamp: string; level: 'info' | 'warning' | 'error'; module: string; message: string
}

const mockLogs: LogEntry[] = [
  { id: 1, timestamp: '২০২৬-০৭-০৫ ১০:৩২:১৫', level: 'info', module: 'Auth', message: 'অ্যাডমিন লগইন সফল: sioffice2021@gmail.com' },
  { id: 2, timestamp: '২০২৬-০৭-০৫ ১০:১৫:০০', level: 'info', module: 'Course', message: 'নতুন কোর্স জমা দেওয়া হয়েছে: Python বাংলায়' },
  { id: 3, timestamp: '২০২৬-০৭-০৫ ০৯:৫৮:৪২', level: 'warning', module: 'Payment', message: 'পেমেন্ট যাচাই ব্যর্থ: TXN006 — bKash timeout' },
  { id: 4, timestamp: '২০২৬-০৭-০৫ ০৯:৪৫:১১', level: 'info', module: 'Enrollment', message: '৫টি নতুন ভর্তি প্রক্রিয়া সম্পন্ন' },
  { id: 5, timestamp: '২০২৬-০৭-০৫ ০৯:৩০:০০', level: 'error', module: 'Storage', message: 'localStorage সীমা অতিক্রম করেছে — পুরনো ডেটা মুছে ফেলা হয়েছে' },
  { id: 6, timestamp: '২০২৬-০৭-০৪ ১৮:২২:৩৩', level: 'info', module: 'Withdrawal', message: 'উত্তোলন অনুরোধ অনুমোদিত: ৳১৫,০০০ — bKash' },
  { id: 7, timestamp: '২০২৬-০৭-০৪ ১৬:১০:০০', level: 'warning', module: 'Course', message: 'কোর্স প্রত্যাখ্যান — অপর্যাপ্ত বিষয়বস্তু: CSE101' },
  { id: 8, timestamp: '২০২৬-০৭-০৪ ১৪:৫৫:২০', level: 'info', module: 'Auth', message: 'নতুন শিক্ষক নিবন্ধন: আহমেদ আলী' },
  { id: 9, timestamp: '২০২৬-০৭-০৪ ১২:৩০:০০', level: 'info', module: 'System', message: 'ক্যাশ পরিষ্কার করা হয়েছে' },
  { id: 10, timestamp: '২০২৬-০৭-০৪ ১০:০০:০০', level: 'error', module: 'Payment', message: 'Nagad API সংযোগ ব্যর্থ — retry 3x' },
  { id: 11, timestamp: '২০২৬-০৭-০৩ ২২:১৫:০০', level: 'info', module: 'Enrollment', message: 'ব্যাচ ভর্তি প্রক্রিয়া: ৩২টি এন্ট্রি' },
  { id: 12, timestamp: '২০২৬-০৭-০৩ ১৯:৪৫:০০', level: 'warning', module: 'Auth', message: 'ব্যর্থ লগইন চেষ্টা: ৫টি ভুল পাসওয়ার্ড — IP: 192.168.1.45' },
  { id: 13, timestamp: '২০২৬-০৭-০৩ ১৭:০০:০০', level: 'info', module: 'Course', message: 'কোর্স অনুমোদিত: SSC গণিত বিশেষ কোর্স' },
  { id: 14, timestamp: '২০২৬-০৭-০৩ ১৫:৩০:০০', level: 'info', module: 'System', message: 'সিস্টেম ব্যাকআপ সম্পন্ন' },
  { id: 15, timestamp: '২০২৬-০৭-০৩ ১৩:০০:০০', level: 'error', module: 'Email', message: 'ইমেইল পাঠানো ব্যর্থ: SMTP সংযোগ সমস্যা' },
  { id: 16, timestamp: '২০২৬-০৭-০৩ ১১:২০:০০', level: 'info', module: 'Commission', message: 'কমিশন রেট আপডেট: Academic → ১৫%' },
  { id: 17, timestamp: '২০২৬-০৭-০৩ ০৯:০০:০০', level: 'info', module: 'System', message: 'সিস্টেম চালু হয়েছে' },
  { id: 18, timestamp: '২০২৬-০৭-০২ ২০:০০:০০', level: 'warning', module: 'Storage', message: 'ডিস্ক ব্যবহার ৮০% ছাড়িয়েছে' },
  { id: 19, timestamp: '২০২৬-০৭-০২ ১৬:৪৫:০০', level: 'info', module: 'Enrollment', message: 'রিফান্ড প্রক্রিয়া: TXN005 — ৳৯০০' },
  { id: 20, timestamp: '২০২৬-০৭-০২ ১২:০০:০০', level: 'info', module: 'Auth', message: 'কোচিং সেন্টার নিবন্ধন: Dhaka Coaching Hub' },
]

const levelStyle = (l: string) => ({
  info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  warning: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  error: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
}[l] || '')

const levelIcon = (l: string) => ({ info: 'ℹ', warning: '⚠', error: '✗' }[l] || '')

export default function LogsPage() {
  const [filterLevel, setFilterLevel] = useState('all')

  const filtered = mockLogs.filter(log => filterLevel === 'all' || log.level === filterLevel)

  return (
    <SchoolAdminLayout breadcrumb="সিস্টেম লগ">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">সিস্টেম লগ</h1>
          <span className="text-xs text-gray-400 dark:text-white/40">{filtered.length}টি এন্ট্রি</span>
        </div>

        <div className="flex gap-2">
          {[['all', 'সব'], ['info', 'তথ্য'], ['warning', 'সতর্কতা'], ['error', 'ত্রুটি']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterLevel(val)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${filterLevel === val ? 'bg-[#1CAB87] text-white' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">সময়</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">স্তর</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">মডিউল</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-white/60">বার্তা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                  <td className="px-5 py-3 text-gray-400 dark:text-white/40 text-xs font-mono whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelStyle(log.level)}`}>
                      {levelIcon(log.level)} {log.level}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-white/50 text-xs font-semibold">{log.module}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-white/70 text-xs">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 dark:text-white/30">কোনো লগ পাওয়া যায়নি</div>}
        </div>
      </div>
    </SchoolAdminLayout>
  )
}
