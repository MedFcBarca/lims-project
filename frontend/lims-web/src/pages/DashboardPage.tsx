import { useEffect, useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Activity,
  Search,
  Building2,
} from 'lucide-react'
import { api } from '../api/api'
import type { Analysis, Sample } from '../types/lims'

export default function DashboardPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [samplesRes, analysesRes] = await Promise.all([
      api.get('/samples'),
      api.get('/analyses'),
    ])

    setSamples(samplesRes.data)
    setAnalyses(analysesRes.data)
  }

  const totalSamples = samples.length
  const inProgress = samples.filter(s => s.status === 'InProgress').length
  const completed = samples.filter(s => s.status === 'Completed').length
  const validated = samples.filter(s => s.status === 'Validated').length
  const rejected = samples.filter(s => s.status === 'Rejected').length

  const compliantAnalyses = analyses.filter(a => a.isCompliant).length
  const nonCompliantAnalyses = analyses.filter(a => !a.isCompliant).length

  const complianceRate =
    analyses.length === 0 ? 0 : Math.round((compliantAnalyses / analyses.length) * 100)

  const statusChart = [
  { name: 'InProgress', value: inProgress },
  { name: 'Completed', value: completed },
  { name: 'Validated', value: validated },
  { name: 'Rejected', value: rejected },
]

  const analysisChart = [
    { name: 'Conforme', value: compliantAnalyses },
    { name: 'Non conforme', value: nonCompliantAnalyses },
  ]

  const activityData = [
    { day: 'Mon', samples: Math.max(1, totalSamples - 4) },
    { day: 'Tue', samples: Math.max(1, totalSamples - 3) },
    { day: 'Wed', samples: Math.max(1, totalSamples - 2) },
    { day: 'Thu', samples: Math.max(1, totalSamples - 1) },
    { day: 'Fri', samples: totalSamples },
  ]

  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      const text = `${sample.code} ${sample.type} ${sample.status} ${sample.client?.name ?? ''}`
      return text.toLowerCase().includes(search.toLowerCase())
    })
  }, [samples, search])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-slate-400">Laboratory intelligence overview</p>
          <h2 className="text-4xl font-black tracking-tight">Dashboard</h2>
        </div>

        <div className="flex w-96 items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-slate-100">
          <Search size={20} className="text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sample, client, status..."
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <KpiCard icon={<FlaskConical />} title="Total samples" value={totalSamples} color="bg-cyan-100" />
        <KpiCard icon={<Activity />} title="In progress" value={inProgress} color="bg-blue-100" />
        <KpiCard icon={<CheckCircle2 />} title="Validated" value={validated} color="bg-emerald-100" />
        <KpiCard icon={<XCircle />} title="Rejected" value={rejected} color="bg-rose-100" />

        <div className="col-span-4 rounded-[28px] bg-gradient-to-br from-[#0b2545] to-[#1c4b73] p-10 text-white shadow-xl shadow-blue-100">
          <p className="text-xl font-semibold">Compliance rate</p>
          <p className="mt-6 text-7xl font-black">{complianceRate}%</p>
          <p className="mt-3 text-white/70">
            {compliantAnalyses} compliant / {analyses.length} analyses
          </p>
        </div>

        <div className="col-span-4 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          <h3 className="mb-6 text-xl font-black">Samples status</h3>
          <Chart data={statusChart} colors={['#3b82f6', '#8b5cf6', '#10b981', '#ef4444']} />
        </div>

        <div className="col-span-4 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          <h3 className="mb-6 text-xl font-black">Analyses quality</h3>
          <Chart data={analysisChart} colors={['#10b981', '#ef4444']} />
        </div>

        <div className="col-span-7 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          <h3 className="mb-6 text-2xl font-black">Weekly sample activity</h3>

          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="samplesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34348b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#34348b" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="samples"
                  stroke="#34348b"
                  strokeWidth={3}
                  fill="url(#samplesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-5 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          <h3 className="mb-6 text-2xl font-black">Latest samples</h3>

          {filteredSamples.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-400">
              No samples found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSamples.slice(0, 5).map(sample => (
                <div key={sample.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black">{sample.code}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <Building2 size={15} /> {sample.client?.name ?? 'No client'}
                      </p>
                    </div>

                    <StatusBadge status={sample.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: number
  color: string
}) {
  return (
    <div className="col-span-3 rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100 transition hover:-translate-y-1">
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-[#34348b] ${color}`}>
        {icon}
      </div>

      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  )
}

function Chart({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  const hasData = data.some(item => item.value > 0)

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        No chart data yet
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" outerRadius={85}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
  Received: 'bg-slate-100 text-slate-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Completed: 'bg-purple-100 text-purple-700',
  Validated: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
}

  return (
    <span className={`rounded-full px-4 py-2 text-xs font-black ${styles[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}