import { useEffect, useState } from 'react'
import { Boxes, Building2, Calendar, Plus, FlaskConical } from 'lucide-react'
import { api } from '../api/api'
import type { Client, Sample } from '../types/lims'

type Batch = {
  id: number
  code: string
  clientId: number
  client?: Client
  receivedAt: string
  status: string
  samplesCount: number
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [code, setCode] = useState('')
  const [clientId, setClientId] = useState('')

  const [samples, setSamples] = useState<Sample[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)

  const loadData = async () => {
    const [batchesRes, clientsRes, samplesRes] = await Promise.all([
    api.get('/batches'),
    api.get('/clients'),
    api.get('/samples'),
    ])

    setBatches(batchesRes.data)
    setClients(clientsRes.data)
    setSamples(samplesRes.data)
  }

  const createBatch = async () => {
    if (!code || !clientId) return

    await api.post('/batches', {
      code,
      clientId: Number(clientId),
    })

    setCode('')
    setClientId('')
    await loadData()
  }
  const selectedBatchSamples = samples.filter(s => s.batchId === selectedBatchId)

  const validateBatch = async (id: number) => {
  try {
    await api.post(`/batches/${id}/validate`)
    await loadData()
  } catch (error: any) {
    alert(error.response?.data || 'Batch validation failed')
  }
}

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">Group multiple samples under the same laboratory reception</p>
        <h2 className="text-4xl font-black tracking-tight">Batches</h2>
      </div>

      <div className="mb-8 rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Create new batch</h3>
            <p className="text-sm text-slate-400">Create a lot before attaching samples to it</p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34348b] text-white">
            <Plus />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <input
            placeholder="Batch code, example LOT-001"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          />

          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          >
            <option value="">Select client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={createBatch}
          className="mt-6 rounded-2xl bg-[#34348b] px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#292976]"
        >
          Create batch
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {batches.map(batch => (
          <div
            key={batch.id}
            onClick={() => setSelectedBatchId(batch.id)}
            className={`rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100 transition hover:-translate-y-1 ${
                selectedBatchId === batch.id ? 'ring-4 ring-[#34348b]/20' : ''
            }`}
            >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-[#34348b]">
                <Boxes />
              </div>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                {batch.status}
              </span>
            </div>

            <h3 className="text-2xl font-black">{batch.code}</h3>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <Building2 size={16} /> {batch.client?.name ?? 'No client'}
              </p>

              <p className="flex items-center gap-2">
                {batch.samplesCount} samples
              </p>

              <p className="flex items-center gap-2">
                <Calendar size={16} /> {new Date(batch.receivedAt).toLocaleDateString()}
              </p>
            </div>
                <button
                    onClick={e => {
                        e.stopPropagation()
                        validateBatch(batch.id)
                        }}
                    disabled={batch.samplesCount === 0}
                    className="mt-6 w-full rounded-2xl bg-emerald-100 px-5 py-3 font-black text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                    Validate batch
                </button>
            </div>
        ))}
      </div>
      {selectedBatchId && (
  <div className="mt-8 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
    <h3 className="mb-6 text-2xl font-black">Samples in selected batch</h3>

    {selectedBatchSamples.length === 0 ? (
      <p className="text-slate-400">No samples in this batch.</p>
    ) : (
      <div className="space-y-3">
        {selectedBatchSamples.map(sample => (
          <div key={sample.id} className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black">{sample.code}</p>
                <p className="text-sm text-slate-400">{sample.type} sample</p>
              </div>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">
                {sample.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
    
  )
}