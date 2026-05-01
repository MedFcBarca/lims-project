import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  MapPin,
  Plus,
  User,
  FlaskConical,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { api } from '../api/api'
import type { Client } from '../types/lims'

type SamplingRequest = {
  id: number
  code: string
  sampleType: string
  location: string
  requestedDate: string
  plannedDate?: string | null
  assignedTechnician?: string | null
  status: string
  clientId: number
  client?: Client
  sampleId?: number | null
}

type Batch = {
  id: number
  code: string
}

export default function SamplingRequestsPage() {
  const [requests, setRequests] = useState<SamplingRequest[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [batches, setBatches] = useState<Batch[]>([])

  const [statusFilter, setStatusFilter] = useState('')

  const [code, setCode] = useState('')
  const [sampleType, setSampleType] = useState('Eau')
  const [location, setLocation] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [clientId, setClientId] = useState('')

  const [plannedDate, setPlannedDate] = useState('')
  const [assignedTechnician, setAssignedTechnician] = useState('Mohamed Abbad')

  const [sampleCode, setSampleCode] = useState('')
  const [batchId, setBatchId] = useState('')

  const filteredRequests = useMemo(() => {
    if (!statusFilter) return requests
    return requests.filter(request => request.status === statusFilter)
  }, [requests, statusFilter])

  const plannedRequestsByDate = useMemo(() => {
    return requests
      .filter(request => request.plannedDate)
      .reduce((groups, request) => {
        const date = new Date(request.plannedDate!).toLocaleDateString()

        if (!groups[date]) {
          groups[date] = []
        }

        groups[date].push(request)

        return groups
      }, {} as Record<string, SamplingRequest[]>)
  }, [requests])

  const loadData = async () => {
    const [requestsRes, clientsRes, batchesRes] = await Promise.all([
      api.get('/samplingrequests'),
      api.get('/clients'),
      api.get('/batches'),
    ])

    setRequests(requestsRes.data)
    setClients(clientsRes.data)
    setBatches(batchesRes.data)
  }

  const createRequest = async () => {
    if (!code || !sampleType || !location || !requestedDate || !clientId) return

    await api.post('/samplingrequests', {
      code,
      sampleType,
      location,
      requestedDate: new Date(requestedDate).toISOString(),
      clientId: Number(clientId),
    })

    setCode('')
    setSampleType('Eau')
    setLocation('')
    setRequestedDate('')
    setClientId('')

    await loadData()
  }

  const planRequest = async (id: number) => {
    if (!plannedDate || !assignedTechnician) return

    await api.post(`/samplingrequests/${id}/plan`, {
      plannedDate: new Date(plannedDate).toISOString(),
      assignedTechnician,
    })

    setPlannedDate('')
    await loadData()
  }

  const collectRequest = async (id: number) => {
    await api.post(`/samplingrequests/${id}/collect`)
    await loadData()
  }

  const createSample = async (id: number) => {
    if (!sampleCode || !batchId) return

    await api.post(`/samplingrequests/${id}/create-sample`, {
      sampleCode,
      batchId: Number(batchId),
    })

    setSampleCode('')
    setBatchId('')
    await loadData()
  }

  const cancelRequest = async (id: number) => {
    try {
      await api.post(`/samplingrequests/${id}/cancel`)
      await loadData()
    } catch (error: any) {
      alert(error.response?.data || 'Cancel request failed')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">
          Field sampling planning before laboratory reception
        </p>
        <h2 className="text-4xl font-black tracking-tight">Planning</h2>
      </div>

      <div className="mb-8 rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Create sampling request</h3>
            <p className="text-sm text-slate-400">
              Register a client field sampling request before creating the sample.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34348b] text-white">
            <Plus />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <input
            placeholder="Request code, example REQ-001"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          />

          <select
            value={sampleType}
            onChange={e => setSampleType(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          >
            <option value="Eau">Eau</option>
            <option value="Sol">Sol</option>
            <option value="Alimentaire">Alimentaire</option>
            <option value="Santé animale">Santé animale</option>
          </select>

          <input
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          />

          <input
            type="date"
            value={requestedDate}
            onChange={e => setRequestedDate(e.target.value)}
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
          onClick={createRequest}
          className="mt-6 rounded-2xl bg-[#34348b] px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#292976]"
        >
          Create request
        </button>
      </div>

      <div className="mb-8 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
        <h3 className="mb-6 text-2xl font-black">Planning by date</h3>

        {Object.keys(plannedRequestsByDate).length === 0 ? (
          <p className="text-slate-400">No planned sampling yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(plannedRequestsByDate).map(([date, items]) => (
              <div key={date} className="rounded-2xl bg-slate-50 p-5">
                <h4 className="mb-4 text-xl font-black">{date}</h4>

                <div className="space-y-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl bg-white p-4"
                    >
                      <div>
                        <p className="font-black">{item.code}</p>
                        <p className="text-sm text-slate-400">
                          {item.client?.name} · {item.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#34348b]">
                          {item.assignedTechnician || 'No technician'}
                        </p>
                        <p className="text-sm text-slate-400">{item.sampleType}</p>
                        <div className="mt-2 flex justify-end">
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8 rounded-[24px] bg-white p-5 shadow-xl shadow-slate-100">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
        >
          <option value="">All statuses</option>
          <option value="Requested">Requested</option>
          <option value="Planned">Planned</option>
          <option value="Collected">Collected</option>
          <option value="SampleCreated">SampleCreated</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredRequests.map(request => (
          <div
            key={request.id}
            className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-[#34348b]">
                <FlaskConical />
              </div>

              <StatusBadge status={request.status} />
            </div>

            <h3 className="text-2xl font-black">{request.code}</h3>
            <p className="mt-1 text-slate-400">
              {request.sampleType} sampling request
            </p>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <User size={16} /> {request.client?.name}
              </p>

              <p className="flex items-center gap-2">
                <MapPin size={16} /> {request.location}
              </p>

              <p className="flex items-center gap-2">
                <Calendar size={16} /> Requested:{' '}
                {new Date(request.requestedDate).toLocaleDateString()}
              </p>

              {request.plannedDate && (
                <p className="flex items-center gap-2">
                  <Calendar size={16} /> Planned:{' '}
                  {new Date(request.plannedDate).toLocaleDateString()}
                </p>
              )}

              {request.assignedTechnician && (
                <p className="flex items-center gap-2">
                  <User size={16} /> Technician: {request.assignedTechnician}
                </p>
              )}
            </div>

            {request.status === 'Requested' && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="mb-3 font-black">Plan sampling</p>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={plannedDate}
                    onChange={e => setPlannedDate(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  />

                  <input
                    placeholder="Technician"
                    value={assignedTechnician}
                    onChange={e => setAssignedTechnician(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  />
                </div>

                <button
                  onClick={() => planRequest(request.id)}
                  className="mt-3 w-full rounded-2xl bg-blue-100 px-5 py-3 font-black text-blue-700 hover:bg-blue-200"
                >
                  Plan request
                </button>
              </div>
            )}

            {request.status === 'Planned' && (
              <button
                onClick={() => collectRequest(request.id)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 font-black text-emerald-700 hover:bg-emerald-200"
              >
                <CheckCircle2 size={18} />
                Mark as collected
              </button>
            )}

            {request.status === 'Collected' && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="mb-3 font-black">Create sample from request</p>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Sample code"
                    value={sampleCode}
                    onChange={e => setSampleCode(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  />

                  <select
                    value={batchId}
                    onChange={e => setBatchId(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Select batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.code}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => createSample(request.id)}
                  className="mt-3 w-full rounded-2xl bg-[#34348b] px-5 py-3 font-black text-white hover:bg-[#292976]"
                >
                  Create sample
                </button>
              </div>
            )}

            {request.status === 'SampleCreated' && (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                Sample created successfully.
                <br />
                Linked sample ID: {request.sampleId}
              </div>
            )}

            {request.status !== 'SampleCreated' && request.status !== 'Cancelled' && (
              <button
                onClick={() => cancelRequest(request.id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-100 px-5 py-3 font-black text-rose-700 hover:bg-rose-200"
              >
                <XCircle size={18} />
                Cancel request
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Requested: 'bg-slate-100 text-slate-700',
    Planned: 'bg-blue-100 text-blue-700',
    Collected: 'bg-amber-100 text-amber-700',
    SampleCreated: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-rose-100 text-rose-700',
  }

  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-black ${
        styles[status] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  )
}