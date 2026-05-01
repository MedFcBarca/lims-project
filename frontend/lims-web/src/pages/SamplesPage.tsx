import { useEffect, useMemo, useState } from 'react'
import {
  FlaskConical,
  Calendar,
  Building2,
  Plus,
  CheckCircle2,
  XCircle,
  Activity,
  Pencil,
  FileDown,
  Upload,
  Boxes,
  ClipboardList
} from 'lucide-react'
import { api } from '../api/api'
import type { Analysis, Client, Sample } from '../types/lims'

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])

  const [code, setCode] = useState('')
  const [type, setType] = useState('Eau')
  const [status, setStatus] = useState('Received')
  const [clientId, setClientId] = useState('')

  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null)

  const [parameter, setParameter] = useState('pH')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('')
  const [threshold, setThreshold] = useState('')
  const [editingAnalysisId, setEditingAnalysisId] = useState<number | null>(null)
  const [analysisToDelete, setAnalysisToDelete] = useState<Analysis | null>(null)

  const [pdfLanguage, setPdfLanguage] = useState('fr')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const selectedSample = samples.find(s => s.id === selectedSampleId)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const canWorkOnSamples = user.role === 'Admin' || user.role === 'Technician'
  const canValidate = user.role === 'Admin' || user.role === 'Validator'

  const [batchId, setBatchId] = useState('')
  const [batches, setBatches] = useState<any[]>([])
  const [filterBatchId, setFilterBatchId] = useState('')

  const [stockItems, setStockItems] = useState<any[]>([])
  const [stockItemId, setStockItemId] = useState('')

  const selectedAnalyses = useMemo(() => {
    if (!selectedSampleId) return []
    return analyses.filter(a => a.sampleId === selectedSampleId)
  }, [analyses, selectedSampleId])

  const filteredSamples = useMemo(() => {
    if (!filterBatchId) return samples
    return samples.filter(s => s.batchId === Number(filterBatchId))
  }, [samples, filterBatchId])

  const loadData = async () => {
    const [samplesRes, clientsRes, analysesRes, batchesRes,stockRes] = await Promise.all([
    api.get('/samples'),
    api.get('/clients'),
    api.get('/analyses'),
    api.get('/batches'),
    api.get('/stock'),
    ])

    setBatches(batchesRes.data)
    setStockItems(stockRes.data)

    setSamples(samplesRes.data)
    setClients(clientsRes.data)
    setAnalyses(analysesRes.data)

    if (!selectedSampleId && samplesRes.data.length > 0) {
      setSelectedSampleId(samplesRes.data[0].id)
    }
  }

  const createSample = async () => {
    if (!code || !type || !clientId || !batchId) return

    await api.post('/samples', {
      code,
      type,
      status,
      clientId: Number(clientId),
      batchId: Number(batchId),
    })
    setBatchId('')
    setCode('')
    setType('Eau')
    setStatus('Received')
    setClientId('')

    await loadData()
  }

  const saveAnalysis = async () => {
  if (!selectedSampleId || !parameter || !value || !threshold) return

  const payload = {
    parameter,
    value: Number(value),
    unit,
    threshold: Number(threshold),
    sampleId: selectedSampleId,
    stockItemId: stockItemId ? Number(stockItemId) : null,
  }

  try {
    if (editingAnalysisId) {
      await api.put(`/analyses/${editingAnalysisId}`, payload)
    } else {
      await api.post('/analyses', payload)
    }

    setEditingAnalysisId(null)
    setParameter('pH')
    setValue('')
    setUnit('')
    setThreshold('')
    setStockItemId('')

    await loadData()
  } catch (error: any) {
    alert(error.response?.data || 'Analysis save failed')
  }
}

  const cancelEdit = () => {
    setEditingAnalysisId(null)
    setParameter('pH')
    setValue('')
    setUnit('')
    setThreshold('')
  }

  const completeSample = async (id: number) => {
    await api.post(`/samples/${id}/complete`)
    await loadData()
  }

  const validateSample = async (id: number) => {
    await api.post(`/samples/${id}/validate`)
    await loadData()
  }

  const deleteAnalysis = async () => {
    if (!analysisToDelete) return

    await api.delete(`/analyses/${analysisToDelete.id}`)
    setAnalysisToDelete(null)
    await loadData()
  }

  const downloadPdf = () => {
    if (!selectedSample) return

    window.open(
      `http://localhost:5112/api/Samples/${selectedSample.id}/report?language=${pdfLanguage}`,
      '_blank'
    )
  }

  const uploadOcr = async () => {
    if (!file || !selectedSampleId) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      setIsUploading(true)

      await api.post(`/ocr/extract-and-create/${selectedSampleId}`, formData)

      setFile(null)
      await loadData()
    } catch (e) {
      console.error(e)
      alert('OCR failed')
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  
  useEffect(() => {
    setSelectedSampleId(null)
    setEditingAnalysisId(null)
    setAnalysisToDelete(null)
    setParameter('pH')
    setValue('')
    setUnit('')
    setThreshold('')
  }, [filterBatchId])

  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">Laboratory samples, analyses & validation workflow</p>
        <h2 className="text-4xl font-black tracking-tight">Samples</h2>
      </div>
    {canWorkOnSamples && (
        <div className="mb-8 rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black">Create new sample</h3>
              <p className="text-sm text-slate-400">Register a new laboratory sample</p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34348b] text-white">
              <Plus />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-5">
            <input
              placeholder="Sample code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
            />

            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
            >
              <option value="Eau">Eau</option>
              <option value="Sol">Sol</option>
              <option value="Alimentaire">Alimentaire</option>
              <option value="Santé animale">Santé animale</option>
            </select>

            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
            >
              <option value="Received">Received</option>
            </select>

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
            <select
              value={batchId}
              onChange={e => setBatchId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
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
            onClick={createSample}
            className="mt-6 rounded-2xl bg-[#34348b] px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#292976]"
          >
            Create sample
          </button>
        </div>
      )}
      <div className="mb-8 rounded-[24px] bg-white p-5 shadow-xl shadow-slate-100">
      <select
        value={filterBatchId}
        onChange={e => setFilterBatchId(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
      >
        <option value="">All batches</option>
        {batches.map(batch => (
          <option key={batch.id} value={batch.id}>
            {batch.code}
          </option>
        ))}
      </select>
    </div>

      <div className="grid grid-cols-12 items-start gap-8">
        <div className="col-span-7 grid content-start gap-6">
          {filteredSamples.map(sample => (
            <button
              key={sample.id}
              onClick={() => setSelectedSampleId(sample.id)}
              className={`h-fit rounded-[28px] bg-white p-7 text-left shadow-xl shadow-slate-100 transition hover:-translate-y-1 ${
                selectedSampleId === sample.id ? 'ring-4 ring-[#34348b]/20' : ''
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-[#34348b]">
                  <FlaskConical size={30} />
                </div>

                <StatusBadge status={sample.status} />
              </div>

              <h3 className="text-2xl font-black">{sample.code}</h3>
              <p className="mt-1 text-slate-400">{sample.type} sample</p>

              <div className="mt-6 space-y-3 text-sm text-slate-500">
                <p className="flex items-center gap-2">
                  <Building2 size={16} /> {sample.client?.name}
                </p>

                <p className="flex items-center gap-2">
                 <Boxes size={16} /> {sample.batch?.code ?? 'No batch'}
                </p>
                {sample.samplingRequestId && (
                <p className="flex items-center gap-2">
                  <ClipboardList size={16} /> Planning request {sample.samplingRequestCode ?? `#${sample.samplingRequestId}`}
                </p>
              )}

                <p className="flex items-center gap-2">
                  <Calendar size={16} /> {new Date(sample.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="col-span-5 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          {selectedSample ? (
            <>
              <div className="mb-8">
                <p className="text-sm text-slate-400">Selected sample</p>
                <h3 className="text-3xl font-black">{selectedSample.code}</h3>
                <p className="mt-1 text-slate-400">{selectedSample.client?.name}</p>
                <div className="mt-3">
                  <StatusBadge status={selectedSample.status} />
                </div>
              </div>
              {canWorkOnSamples && (
                <div className="mb-8 rounded-[24px] bg-slate-50 p-5">
                  <h4 className="mb-4 flex items-center gap-2 font-black">
                    <Activity size={18} />
                    {editingAnalysisId ? 'Edit analysis' : 'Add analysis'}
                  </h4>

                  <div className="grid gap-3">
                    <input
                      placeholder="Parameter"
                      value={parameter}
                      onChange={e => setParameter(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#34348b]"
                    />
                    <select
                        value={stockItemId}
                        onChange={e => setStockItemId(e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#34348b]"
                      >
                        <option value="">No stock item</option>
                        {stockItems.map(stock => (
                          <option key={stock.id} value={stock.id}>
                            {stock.name} / Lot {stock.lotNumber} / Qty {stock.quantity}
                          </option>
                        ))}
                      </select>

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        placeholder="Value"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#34348b]"
                      />

                      <input
                        placeholder="Unit"
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#34348b]"
                      />

                      <input
                        placeholder="Threshold"
                        value={threshold}
                        onChange={e => setThreshold(e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#34348b]"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveAnalysis}
                        className="flex-1 rounded-2xl bg-[#34348b] px-5 py-3 font-bold text-white hover:bg-[#292976]"
                      >
                        {editingAnalysisId ? 'Update analysis' : 'Add analysis'}
                      </button>

                      {editingAnalysisId && (
                        <button
                          onClick={cancelEdit}
                          className="rounded-2xl bg-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {selectedAnalyses.map(analysis => (
                  <div key={analysis.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="font-black">{analysis.parameter}</p>

                        <p className="text-sm text-slate-400">
                          {analysis.value} {analysis.unit} / seuil {analysis.threshold}
                        </p>

                        {analysis.stockItem && (
                          <p className="text-xs text-slate-400">
                            🧪 {analysis.stockItem.name} (Lot {analysis.stockItem.lotNumber})
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {analysis.isCompliant ? (
                          <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                            <CheckCircle2 size={16} /> Conforme
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-black text-rose-700">
                            <XCircle size={16} /> Non conforme
                          </span>
                        )}

                        {canWorkOnSamples && (
                          <>
                            <button
                              onClick={() => {
                                setEditingAnalysisId(analysis.id)
                                setParameter(analysis.parameter)
                                setValue(String(analysis.value))
                                setUnit(analysis.unit)
                                setThreshold(String(analysis.threshold))
                                setStockItemId(analysis.stockItemId ? String(analysis.stockItemId) : '')
                              }}
                              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              onClick={() => setAnalysisToDelete(analysis)}
                              className="flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-200"
                            >
                              <XCircle size={14} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
                <h4 className="mb-4 flex items-center gap-2 font-black">
                  <Upload size={18} />
                  Import analyses (OCR)
                </h4>

                <input
                  type="file"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="mb-3"
                />

                <button
                  onClick={uploadOcr}
                  className="flex items-center gap-2 rounded-2xl bg-[#34348b] px-5 py-3 font-bold text-white hover:bg-[#292976]"
                >
                  <Upload size={16} />
                  {isUploading ? 'Processing...' : 'Upload & extract'}
                </button>
              </div>

              {canWorkOnSamples && (
                <button
                  onClick={() => completeSample(selectedSample.id)}
                  disabled={selectedAnalyses.length === 0 || selectedSample.status !== 'InProgress'}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-100 px-5 py-4 font-black text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Activity size={18} />
                  Mark as completed
                </button>
              )}

              {canValidate && (
                <button
                  onClick={() => validateSample(selectedSample.id)}
                  disabled={selectedSample.status !== 'Completed'}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-5 py-4 font-black text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCircle2 size={18} />
                  Validate selected sample
                </button>
              )}

              <div className="mt-4 rounded-[24px] bg-slate-50 p-5">
                <h4 className="mb-4 flex items-center gap-2 font-black">
                  <FileDown size={18} />
                  Export PDF report
                </h4>

                <div className="flex gap-3">
                  <select
                    value={pdfLanguage}
                    onChange={e => setPdfLanguage(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#34348b]"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="ar">العربية</option>
                  </select>

                  <button
                    onClick={downloadPdf}
                    className="rounded-2xl bg-[#34348b] px-5 py-3 font-bold text-white hover:bg-[#292976]"
                  >
                    Export
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400">Select a sample to manage analyses.</p>
          )}
        </div>
      </div>

      {analysisToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-black">Delete analysis?</h3>

            <p className="mt-3 text-slate-500">
              Are you sure you want to delete{' '}
              <span className="font-bold text-slate-900">
                {analysisToDelete.parameter}
              </span>
              ?
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setAnalysisToDelete(null)}
                className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={deleteAnalysis}
                className="flex-1 rounded-2xl bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
    <span className={`rounded-full px-4 py-2 text-sm font-black ${styles[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}