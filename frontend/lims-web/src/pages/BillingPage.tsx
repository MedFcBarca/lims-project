import { useEffect, useState } from 'react'
import { Receipt, FileText, Plus, Building2, Boxes, Euro } from 'lucide-react'
import { api } from '../api/api'
import type { Client } from '../types/lims'

type Quote = {
  id: number
  code: string
  totalAmount: number
  status: string
  createdAt: string
  client?: Client
}

type Invoice = {
  id: number
  code: string
  totalAmount: number
  analysesCount: number
  status: string
  createdAt: string
  client?: Client
  batch?: {
    id: number
    code: string
  }
  lines?: {
    description: string
    price: number
  }[]
}

type Batch = {
  id: number
  code: string
  status: string
  client?: Client
}

export default function BillingPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [batches, setBatches] = useState<Batch[]>([])

  const [clientId, setClientId] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('100')
  const [batchId, setBatchId] = useState('')

  const loadData = async () => {
    const [quotesRes, invoicesRes, clientsRes, batchesRes] = await Promise.all([
      api.get('/quotes'),
      api.get('/invoices'),
      api.get('/clients'),
      api.get('/batches'),
    ])

    setQuotes(quotesRes.data)
    setInvoices(invoicesRes.data)
    setClients(clientsRes.data)
    setBatches(batchesRes.data)
  }

  const createQuote = async () => {
    if (!clientId || !quoteAmount) return

    await api.post('/quotes', {
      clientId: Number(clientId),
      totalAmount: Number(quoteAmount),
      status: 'Draft',
    })

    setClientId('')
    setQuoteAmount('100')

    await loadData()
  }

  const createInvoice = async () => {
    if (!batchId) return

    try {
      await api.post(`/invoices?batchId=${batchId}`)
      setBatchId('')
      await loadData()
    } catch (error: any) {
      alert(error.response?.data || 'Invoice creation failed')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">
          Quotes, invoices and laboratory billing workflow
        </p>
        <h2 className="text-4xl font-black tracking-tight">Billing</h2>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div className="rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black">Create quote</h3>
              <p className="text-sm text-slate-400">
                Estimate the cost of a laboratory request before invoicing.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34348b] text-white">
              <FileText />
            </div>
          </div>

          <div className="grid gap-4">
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

            <input
              placeholder="Amount"
              value={quoteAmount}
              onChange={e => setQuoteAmount(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
            />
          </div>

          <button
            onClick={createQuote}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-[#34348b] px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#292976]"
          >
            <Plus size={18} />
            Create quote
          </button>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black">Generate invoice</h3>
              <p className="text-sm text-slate-400">
                Create an invoice from a batch based on its analyses.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-[#34348b]">
              <Receipt />
            </div>
          </div>

          <select
            value={batchId}
            onChange={e => setBatchId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
          >
            <option value="">Select batch</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.code} - {batch.client?.name ?? 'No client'} - {batch.status}
              </option>
            ))}
          </select>

          <button
            onClick={createInvoice}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-100 px-6 py-4 font-black text-emerald-700 hover:bg-emerald-200"
          >
            <Euro size={18} />
            Generate invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          <h3 className="mb-6 text-2xl font-black">Quotes</h3>

          {quotes.length === 0 ? (
            <p className="text-slate-400">No quotes yet.</p>
          ) : (
            <div className="space-y-4">
              {quotes.map(quote => (
                <div key={quote.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black">{quote.code}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <Building2 size={15} />
                        {quote.client?.name ?? 'No client'}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">
                      {quote.status}
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-black text-[#34348b]">
                    {quote.totalAmount} €
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Created: {new Date(quote.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() =>
                        window.open(`http://localhost:5112/api/quotes/${quote.id}/pdf`, '_blank')
                    }
                    className="mt-4 w-full rounded-2xl bg-[#34348b] px-5 py-3 font-black text-white hover:bg-[#292976]"
                    >
                    Download quote PDF
                    </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-xl shadow-slate-100">
          <h3 className="mb-6 text-2xl font-black">Invoices</h3>

          {invoices.length === 0 ? (
            <p className="text-slate-400">No invoices yet.</p>
          ) : (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div key={invoice.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black">{invoice.code}</p>

                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <Building2 size={15} />
                        {invoice.client?.name ?? 'No client'}
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <Boxes size={15} />
                        {invoice.batch?.code ?? 'No batch'}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Receipt size={22} />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-black text-emerald-700">
                    {invoice.totalAmount} €
                  </p>

                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700">
                      {invoice.status}
                    </span>

                    <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">
                      {invoice.analysesCount} analyses
                    </span>
                  </div>
                  {invoice.lines && invoice.lines.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="mb-3 text-sm font-black text-slate-700">Invoice details</p>

                        <div className="space-y-2">
                        {invoice.lines.map((line, index) => (
                            <div key={index} className="flex justify-between text-sm text-slate-500">
                            <span>{line.description}</span>
                            <span className="font-bold text-slate-800">{line.price} €</span>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                  <p className="mt-2 text-sm text-slate-400">
                    Created: {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() =>
                        window.open(`http://localhost:5112/api/invoices/${invoice.id}/pdf`, '_blank')
                    }
                    className="mt-4 w-full rounded-2xl bg-[#34348b] px-5 py-3 font-black text-white hover:bg-[#292976]"
                    >
                    Download invoice PDF
                    </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}