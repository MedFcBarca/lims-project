import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, FlaskConical, Users, Search, Bell, CheckCircle2, History } from 'lucide-react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const nav = [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Samples', path: '/samples', icon: FlaskConical },
    { label: 'Audit Trail', path: '/audit-trail', icon: History },

  ]

  return (
    <div className="min-h-screen bg-[#f7f7fb] p-6 text-[#090b2f]">
      <div className="grid min-h-[calc(100vh-48px)] grid-cols-[280px_1fr] overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-200">
        <aside className="m-0 rounded-[28px] bg-[#34348b] p-8 text-white">
          <div className="mb-12 text-center text-2xl font-black tracking-tight">
            limsberry™
          </div>

          <div className="mb-12 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300 text-xl font-bold text-[#34348b]">
              M
            </div>
            <div>
              <p className="font-semibold">Mohamed Abbad</p>
              <p className="text-xs text-white/70">LIMS Developer</p>
            </div>
          </div>

          <nav className="space-y-3">
            {nav.map(item => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-2xl px-4 py-4 transition ${
                      isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="flex items-center gap-4">
                    <Icon size={18} />
                    {item.label}
                  </span>
                  <span>›</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <main className="p-10">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <p className="text-lg text-slate-400">Hello Mohamed, welcome back</p>
              <h1 className="text-4xl font-black tracking-tight">Your LIMS dashboard is updated</h1>
            </div>

            <div className="flex items-center gap-5">
              <Bell size={24} />
              <CheckCircle2 size={24} />
              <Search size={26} />
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  )
}