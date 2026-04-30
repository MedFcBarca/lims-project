import { useState } from 'react'
import { Lock, Mail, FlaskConical } from 'lucide-react'
import { api } from '../api/api'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@lims.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    if (!email || !password) return

    try {
      setLoading(true)

      const res = await api.post('/auth/login', {
        email,
        password,
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`

      window.location.href = '/'
    } catch {
      alert('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] p-6 text-[#090b2f]">
      <div className="grid min-h-[calc(100vh-48px)] grid-cols-1 overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-200 lg:grid-cols-2">
        <div className="relative hidden bg-[#34348b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-16 text-3xl font-black tracking-tight">limsberry™</div>

            <div className="max-w-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-300 text-[#34348b]">
                <FlaskConical size={32} />
              </div>

              <h1 className="text-5xl font-black leading-tight">
                Secure laboratory workflow management
              </h1>

              <p className="mt-6 text-lg leading-8 text-white/70">
                Manage clients, batches, samples, analyses, reports and audit trails with role-based access.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-2xl font-black">LIMS</p>
              <p className="mt-1 text-white/60">Business workflow</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-2xl font-black">JWT</p>
              <p className="mt-1 text-white/60">Secure access</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-2xl font-black">Audit</p>
              <p className="mt-1 text-white/60">Traceability</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#34348b]">
                Welcome back
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">
                Sign in to limsberry
              </h2>
              <p className="mt-3 text-slate-400">
                Use your laboratory account to access the dashboard.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Email address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 focus-within:border-[#34348b]">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    placeholder="admin@lims.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 focus-within:border-[#34348b]">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') login()
                    }}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <button
                onClick={login}
                disabled={loading}
                className="w-full rounded-2xl bg-[#34348b] px-6 py-4 font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-[#292976] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              <p className="font-bold text-slate-700">Demo account</p>
              <p className="mt-1">admin@lims.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}