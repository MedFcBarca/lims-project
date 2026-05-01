import { useEffect, useState } from 'react'
import { Package, Plus, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../api/api'

type StockItem = {
  id: number
  name: string
  lotNumber: string
  quantity: number
  expirationDate: string
}

type StockAction = 'increase' | 'decrease'

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [name, setName] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expirationDate, setExpirationDate] = useState('')

  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [stockAction, setStockAction] = useState<StockAction>('increase')
  const [adjustQuantity, setAdjustQuantity] = useState('')

  const loadData = async () => {
    const res = await api.get('/stock')
    setStockItems(res.data)
  }

  const createStock = async () => {
    if (!name || !lotNumber || !quantity || !expirationDate) return

    await api.post('/stock', {
      name,
      lotNumber,
      quantity: Number(quantity),
      expirationDate: new Date(expirationDate).toISOString(),
    })

    setName('')
    setLotNumber('')
    setQuantity('')
    setExpirationDate('')

    await loadData()
  }

  const openStockModal = (item: StockItem, action: StockAction) => {
    setSelectedItem(item)
    setStockAction(action)
    setAdjustQuantity('')
  }

  const closeStockModal = () => {
    setSelectedItem(null)
    setAdjustQuantity('')
  }

  const confirmStockAdjustment = async () => {
    if (!selectedItem) return

    const amount = Number(adjustQuantity)

    if (!amount || amount <= 0) return

    const nextQuantity =
      stockAction === 'increase'
        ? selectedItem.quantity + amount
        : selectedItem.quantity - amount

    if (nextQuantity < 0) return

    await api.put(`/stock/${selectedItem.id}`, {
      ...selectedItem,
      quantity: nextQuantity,
    })

    closeStockModal()
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  const isExpired = (date: string) => new Date(date) < new Date()
  const isLowStock = (quantity: number) => quantity > 0 && quantity <= 2

  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-400">Laboratory reagents, lots and expiration tracking</p>
        <h2 className="text-4xl font-black tracking-tight">Stock</h2>
      </div>

      <div className="mb-8 rounded-[28px] bg-[#fff4f1] p-8 shadow-xl shadow-slate-100">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Create stock item</h3>
            <p className="text-sm text-slate-400">Register a reagent used in analyses</p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34348b] text-white">
            <Plus />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <input placeholder="Name, example Solution pH" value={name} onChange={e => setName(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]" />
          <input placeholder="Lot number, example L-001" value={lotNumber} onChange={e => setLotNumber(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]" />
          <input placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]" />
          <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]" />
        </div>

        <button onClick={createStock} className="mt-6 rounded-2xl bg-[#34348b] px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#292976]">
          Create stock
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {stockItems.map(item => {
          const expired = isExpired(item.expirationDate)
          const outOfStock = item.quantity === 0
          const lowStock = isLowStock(item.quantity)

          return (
            <div key={item.id} className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-[#34348b]">
                  <Package />
                </div>

                {expired ? (
                  <span className="flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-black text-rose-700"><AlertTriangle size={14} /> Expired</span>
                ) : outOfStock ? (
                  <span className="flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-black text-rose-700"><AlertTriangle size={14} /> Out of stock</span>
                ) : lowStock ? (
                  <span className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-700"><AlertTriangle size={14} /> Low stock</span>
                ) : (
                  <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700"><CheckCircle2 size={14} /> Available</span>
                )}
              </div>

              <h3 className="text-2xl font-black">{item.name}</h3>

              <div className="mt-5 space-y-2 text-sm text-slate-500">
                <p>Lot: {item.lotNumber}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Expiration: {new Date(item.expirationDate).toLocaleDateString()}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => openStockModal(item, 'increase')}
                  className="rounded-2xl bg-[#34348b] px-5 py-3 font-bold text-white hover:bg-[#292976]"
                >
                  Restock
                </button>

                <button
                  onClick={() => openStockModal(item, 'decrease')}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Reduce
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#34348b]">
                  Stock adjustment
                </p>
                <h3 className="mt-2 text-3xl font-black">
                  {stockAction === 'increase' ? 'Restock item' : 'Reduce stock'}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {selectedItem.name} / Lot {selectedItem.lotNumber}
                </p>
              </div>

              <button
                onClick={closeStockModal}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-400">Current quantity</p>
              <p className="text-3xl font-black">{selectedItem.quantity}</p>
            </div>

            <input
              placeholder={stockAction === 'increase' ? 'Quantity to add' : 'Quantity to remove'}
              value={adjustQuantity}
              onChange={e => setAdjustQuantity(e.target.value)}
              className="mb-5 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-[#34348b]"
            />

            <button
              onClick={confirmStockAdjustment}
              className="w-full rounded-2xl bg-[#34348b] px-6 py-4 font-black text-white hover:bg-[#292976]"
            >
              {stockAction === 'increase' ? 'Confirm restock' : 'Confirm reduction'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}