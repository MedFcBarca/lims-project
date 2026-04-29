import { useEffect, useState } from 'react'
import { Plus, Building2, Mail, Layers } from 'lucide-react'
import { api } from '../api/api'
import type { Client } from '../types/lims'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [domain, setDomain] = useState('')

  const loadClients = async () => {
    const res = await api.get('/clients')
    setClients(res.data)
  }

  const createClient = async () => {
    if (!name || !email || !domain) return

    await api.post('/clients', { name, email, domain })

    setName('')
    setEmail('')
    setDomain('')

    await loadClients()
  }

  useEffect(() => {
    loadClients()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">Customer requests & laboratory accounts</p>
        <h2 className="text-4xl font-black tracking-tight">Clients</h2>
      </div>

      <div className="mb-8 rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Create new client</h3>
            <p className="text-sm text-slate-400">Register a laboratory customer account</p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34348b] text-white">
            <Plus />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <input
            placeholder="Client name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          />

          <input
            placeholder="Domain"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          />
        </div>

        <button
          onClick={createClient}
          className="mt-6 rounded-2xl bg-[#34348b] px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#292976]"
        >
          Create client
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {clients.map(client => (
          <div
            key={client.id}
            className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100 transition hover:-translate-y-1"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-[#34348b]">
                <Building2 />
              </div>

              <span className="rounded-full bg-[#34348b] px-4 py-2 text-sm font-bold text-white">
                {client.domain}
              </span>
            </div>

            <h3 className="text-xl font-black">{client.name}</h3>

            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Mail size={16} /> {client.email}
              </p>
              <p className="flex items-center gap-2">
                <Layers size={16} /> Laboratory account
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}