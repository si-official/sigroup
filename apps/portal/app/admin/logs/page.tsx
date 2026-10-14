'use client'
import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

type LogLevel = 'info' | 'warning' | 'error'

interface LogEntry {
  id: string; timestamp: string; level: LogLevel; module: string; message: string
}

const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2026-07-04 10:45:22', level: 'info', module: 'Auth', message: 'Admin login: sioffice2021@gmail.com from 192.168.1.1' },
  { id: 'l2', timestamp: '2026-07-04 10:30:15', level: 'info', module: 'Shop', message: 'New order #1042 created — ৳4,299 via bKash' },
  { id: 'l3', timestamp: '2026-07-04 10:15:03', level: 'warning', module: 'SMS', message: 'SMS gateway Alpha Net returned timeout after 30s' },
  { id: 'l4', timestamp: '2026-07-04 09:58:44', level: 'info', module: 'School', message: 'New enrollment: Rahim Uddin in Full-Stack Web Dev' },
  { id: 'l5', timestamp: '2026-07-04 09:40:12', level: 'error', module: 'Payment', message: 'bKash payment failed for order #1041 — invalid API key' },
  { id: 'l6', timestamp: '2026-07-04 09:22:31', level: 'info', module: 'Software', message: 'ISP Billing Suite Pro downloaded by Delta ISP Ltd' },
  { id: 'l7', timestamp: '2026-07-04 09:05:19', level: 'info', module: 'Auth', message: 'Manager login: manager@demo.com' },
  { id: 'l8', timestamp: '2026-07-03 18:45:00', level: 'warning', module: 'System', message: 'High memory usage detected: 87% of available RAM' },
  { id: 'l9', timestamp: '2026-07-03 18:30:22', level: 'info', module: 'Employees', message: 'New employee added: Sumaiya Begum (Support)' },
  { id: 'l10', timestamp: '2026-07-03 17:10:55', level: 'error', module: 'Database', message: 'Connection timeout to MySQL — retried 3 times, restored' },
  { id: 'l11', timestamp: '2026-07-03 16:00:14', level: 'info', module: 'Settings', message: 'System settings updated by SI Admin' },
  { id: 'l12', timestamp: '2026-07-03 15:30:42', level: 'info', module: 'Shop', message: 'Order #1040 status updated to shipped' },
  { id: 'l13', timestamp: '2026-07-03 14:22:08', level: 'warning', module: 'Auth', message: 'Failed login attempt for unknown@example.com' },
  { id: 'l14', timestamp: '2026-07-03 13:15:33', level: 'info', module: 'Platforms', message: 'Platform "SI Mart" updated by SI Admin' },
  { id: 'l15', timestamp: '2026-07-03 12:00:00', level: 'info', module: 'Backup', message: 'Automatic daily backup completed successfully' },
  { id: 'l16', timestamp: '2026-07-03 11:45:19', level: 'info', module: 'Payment', message: 'Nagad gateway enabled successfully' },
  { id: 'l17', timestamp: '2026-07-03 10:30:55', level: 'error', module: 'School', message: 'Certificate generation failed for student #SIS-0094' },
  { id: 'l18', timestamp: '2026-07-03 09:15:22', level: 'info', module: 'DevServices', message: 'New dev enquiry: Mobile App — ৳65,000 budget' },
  { id: 'l19', timestamp: '2026-07-02 18:00:11', level: 'warning', module: 'System', message: 'Scheduled task "send_daily_report" took 45s (limit: 30s)' },
  { id: 'l20', timestamp: '2026-07-02 17:00:00', level: 'info', module: 'Auth', message: 'Admin session expired for manager@demo.com' },
]

const levelStyles: Record<LogLevel, string> = {
  info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  warning: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
  error: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
}

const modules = Array.from(new Set(mockLogs.map(l => l.module)))

export default function LogsPage() {
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<'' | LogLevel>('')
  const [filterModule, setFilterModule] = useState('')

  const filtered = mockLogs.filter((l) => {
    const q = search.toLowerCase()
    return (
      (!q || l.message.toLowerCase().includes(q) || l.module.toLowerCase().includes(q)) &&
      (!filterLevel || l.level === filterLevel) &&
      (!filterModule || l.module === filterModule)
    )
  })

  const counts = { info: mockLogs.filter(l => l.level === 'info').length, warning: mockLogs.filter(l => l.level === 'warning').length, error: mockLogs.filter(l => l.level === 'error').length }

  return (
    <AdminLayout title="Logs" breadcrumb={[{ label: 'System Logs' }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">📋 System Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{mockLogs.length} total log entries</p>
        </div>
        <button
          onClick={() => {
            const csv = ['Timestamp,Level,Module,Message', ...mockLogs.map(l => `${l.timestamp},${l.level},${l.module},"${l.message}"`)].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = 'si_admin_logs.csv'; a.click()
          }}
          className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-xl text-sm transition"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Level summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {([['info', '🔵', 'blue'], ['warning', '🟡', 'amber'], ['error', '🔴', 'red']] as const).map(([level, icon, color]) => (
          <button
            key={level}
            onClick={() => setFilterLevel(filterLevel === level ? '' : level)}
            className={`bg-white dark:bg-gray-900 border rounded-xl p-4 text-left transition ${filterLevel === level ? `border-${color}-500` : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
          >
            <p className="text-2xl font-black text-gray-900 dark:text-white">{counts[level]}</p>
            <p className="text-gray-500 text-xs capitalize">{icon} {level} events</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs..."
          className="flex-1 min-w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-400"
        />
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value as '' | LogLevel)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Levels</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Modules</option>
          {modules.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Logs table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Level</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Module</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${levelStyles[log.level]}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-semibold">{log.module}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">{log.message}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">No logs match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
