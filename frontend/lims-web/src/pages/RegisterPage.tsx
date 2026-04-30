import { useState } from 'react'
import { User, Mail, Lock, ShieldCheck } from 'lucide-react'
import { api } from '../api/api'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Technician')
  const [loading, setLoading] = useState(false)

  const register = async () => {
    if (!fullName || !email || !password || !role) return

    try {
      setLoading(true)

      await api.post('/auth/register', {
        fullName,
        email,
        password,
        role,
      })

      alert('User created successfully')

      setFullName('')
      setEmail('')
      setPassword('')
      setRole('Technician')
    } catch (error: any) {
      alert(error.response?.data || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] p-6 text-[#090b2f]">
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center rounded-[28px] bg-white shadow-2xl shadow-slate-200">
        <div className="w-full max-w-md rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#34348b]">
              Admin panel
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Create user
            </h1>
            <p className="mt-3 text-slate-400">
              Add a laboratory user and assign a role.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <User size={18} className="text-slate-400" />
              <input
                placeholder="Full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <Mail size={18} className="text-slate-400" />
              <input
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <Lock size={18} className="text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <ShieldCheck size={18} className="text-slate-400" />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-transparent outline-none"
              >
                <option value="Technician">Technician</option>
                <option value="Validator">Validator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button
              onClick={register}
              disabled={loading}
              className="w-full rounded-2xl bg-[#34348b] px-6 py-4 font-black text-white shadow-lg shadow-indigo-200 hover:bg-[#292976] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create user'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}