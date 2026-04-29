import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Clock,
  User,
  FlaskConical,
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  Trash2,
} from 'lucide-react'
import { api } from '../api/api'
import type { Analysis, AuditLog, Sample } from '../types/lims'

export default function AuditTrailPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [allLogs, setAllLogs] = useState<AuditLog[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])

  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null)
  const [selectedDeletedEntityId, setSelectedDeletedEntityId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const selectedSample = samples.find(s => s.id === selectedSampleId)
  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId)

  const sampleAnalyses = useMemo(() => {
    if (!selectedSampleId) return []
    return analyses.filter(a => a.sampleId === selectedSampleId)
  }, [analyses, selectedSampleId])

  const deletedAnalyses = useMemo(() => {
    if (!selectedSampleId) return []

    const deletedLogs = allLogs.filter(
      log =>
        log.sampleId === selectedSampleId &&
        log.entityName === 'Analysis' &&
        log.action === 'AnalysisDeleted'
    )

    return deletedLogs
  }, [allLogs, selectedSampleId])

  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      const text = `${sample.code} ${sample.type} ${sample.status} ${sample.client?.name}`.toLowerCase()
      return text.includes(search.toLowerCase())
    })
  }, [samples, search])

  const loadData = async () => {
    const [samplesRes, analysesRes, logsRes] = await Promise.all([
      api.get('/samples'),
      api.get('/analyses'),
      api.get('/auditlogs'),
    ])

    setSamples(samplesRes.data)
    setAnalyses(analysesRes.data)
    setAllLogs(logsRes.data)

    if (!selectedSampleId && samplesRes.data.length > 0) {
      setSelectedSampleId(samplesRes.data[0].id)
    }
  }

  const loadAnalysisHistory = async (analysisId: number) => {
    setSelectedAnalysisId(analysisId)
    setSelectedDeletedEntityId(null)

    const res = await api.get(`/auditlogs/entity/Analysis/${analysisId}`)
    setLogs(res.data)
  }

  const loadDeletedAnalysisHistory = async (entityId: number) => {
    setSelectedAnalysisId(null)
    setSelectedDeletedEntityId(entityId)

    const res = await api.get(`/auditlogs/entity/Analysis/${entityId}`)
    setLogs(res.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (sampleAnalyses.length > 0 && !selectedAnalysisId && !selectedDeletedEntityId) {
      loadAnalysisHistory(sampleAnalyses[0].id)
    }

    if (sampleAnalyses.length === 0 && deletedAnalyses.length === 0) {
      setSelectedAnalysisId(null)
      setSelectedDeletedEntityId(null)
      setLogs([])
    }
  }, [sampleAnalyses, deletedAnalyses])

  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">Traceability by sample and analysis</p>
        <h2 className="text-4xl font-black tracking-tight">Audit Trail</h2>
      </div>

      <div className="mb-8 rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">LIMS traceability explorer</h3>
            <p className="text-sm text-slate-400">
              Select a sample, choose an analysis, then review its full history.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34348b] text-white">
            <Activity />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sample by code, client, status..."
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-8">
        <div className="col-span-4 space-y-4">
          <h3 className="text-xl font-black">Samples</h3>

          {filteredSamples.map(sample => (
            <button
              key={sample.id}
              onClick={() => {
                setSelectedSampleId(sample.id)
                setSelectedAnalysisId(null)
                setSelectedDeletedEntityId(null)
                setLogs([])
              }}
              className={`w-full rounded-[24px] bg-white p-5 text-left shadow-xl shadow-slate-100 transition hover:-translate-y-1 ${
                selectedSampleId === sample.id ? 'ring-4 ring-[#34348b]/20' : ''
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-[#34348b]">
                  <FlaskConical size={22} />
                </div>

                <StatusBadge status={sample.status} />
              </div>

              <h4 className="text-xl font-black">{sample.code}</h4>
              <p className="mt-1 text-sm text-slate-400">{sample.type} sample</p>

              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Building2 size={15} /> {sample.client?.name}
              </p>
            </button>
          ))}
        </div>

        <div className="col-span-4 rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100">
          <div className="mb-6">
            <p className="text-sm text-slate-400">Selected sample</p>
            <h3 className="text-2xl font-black">
              {selectedSample ? selectedSample.code : 'No sample selected'}
            </h3>
          </div>

          <div className="space-y-3">
            {sampleAnalyses.map(analysis => (
              <button
                key={analysis.id}
                onClick={() => loadAnalysisHistory(analysis.id)}
                className={`w-full rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 ${
                  selectedAnalysisId === analysis.id ? 'ring-2 ring-[#34348b]/30' : ''
                }`}
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="font-black">{analysis.parameter}</p>
                    <p className="text-sm text-slate-400">
                      {analysis.value} {analysis.unit} / seuil {analysis.threshold}
                    </p>
                  </div>

                  {analysis.isCompliant ? (
                    <span className="flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700">
                      <CheckCircle2 size={14} /> Conforme
                    </span>
                  ) : (
                    <span className="flex w-fit items-center gap-2 rounded-full bg-rose-100 px-3 py-2 text-xs font-black text-rose-700">
                      <XCircle size={14} /> Non conforme
                    </span>
                  )}
                </div>
              </button>
            ))}

            {deletedAnalyses.length > 0 && (
              <div className="pt-4">
                <p className="mb-3 text-sm font-black text-slate-400">Deleted analyses</p>

                <div className="space-y-3">
                  {deletedAnalyses.map(log => (
                    <button
                      key={log.id}
                      onClick={() => loadDeletedAnalysisHistory(log.entityId)}
                      className={`w-full rounded-2xl bg-rose-50 p-4 text-left transition hover:bg-rose-100 ${
                        selectedDeletedEntityId === log.entityId ? 'ring-2 ring-rose-300' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-rose-700">
                            {log.displayName || `Analysis #${log.entityId}`}
                          </p>
                          <p className="text-sm text-rose-400">
                            Deleted analysis · old value: {log.oldValue}
                          </p>
                        </div>

                        <Trash2 size={18} className="text-rose-500" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sampleAnalyses.length === 0 && deletedAnalyses.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-400">
                No analyses for this sample.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-4 rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100">
          <div className="mb-6">
            <p className="text-sm text-slate-400">Analysis history</p>
            <h3 className="text-2xl font-black">
              {selectedAnalysis?.parameter ||
                logs[0]?.displayName ||
                (selectedDeletedEntityId ? `Deleted analysis #${selectedDeletedEntityId}` : 'No analysis selected')}
            </h3>
          </div>

          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="rounded-2xl bg-slate-50 p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <ActionBadge action={log.action} />
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                    AuditLog #{log.id}
                  </span>
                </div>

                <p className="font-black">{log.comment || log.action}</p>

                <div className="mt-3 grid gap-2 text-sm text-slate-500">
                  {log.oldValue && (
                    <p>
                      <span className="font-bold text-slate-800">Old:</span> {log.oldValue}
                    </p>
                  )}

                  {log.newValue && (
                    <p>
                      <span className="font-bold text-slate-800">New:</span> {log.newValue}
                    </p>
                  )}

                  <p className="flex items-center gap-2">
                    <User size={15} /> {log.user}
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock size={15} /> {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-400">
                No history found for this analysis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    'In Analysis': 'bg-blue-100 text-blue-700',
    Validated: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
  }

  return (
    <span className={`rounded-full px-3 py-2 text-xs font-black ${styles[status]}`}>
      {status}
    </span>
  )
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    AnalysisCreated: 'bg-emerald-100 text-emerald-700',
    AnalysisUpdated: 'bg-blue-100 text-blue-700',
    AnalysisDeleted: 'bg-rose-100 text-rose-700',
    SampleValidated: 'bg-purple-100 text-purple-700',
    OCRImport: 'bg-amber-100 text-amber-700',
  }

  return (
    <span className={`rounded-full px-3 py-2 text-xs font-black ${styles[action] || 'bg-slate-100 text-slate-700'}`}>
      {action}
    </span>
  )
}