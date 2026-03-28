import { useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'

const splitOptions = [
  { value: 'equal', label: 'Equal' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'share', label: 'Shares' },
  { value: 'item', label: 'Item' },
]

function ExpenseFormModal({ token, group, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [paidBy, setPaidBy] = useState(group.members?.[0]?._id || '')
  const [splitType, setSplitType] = useState('equal')
  const [shareMap, setShareMap] = useState(() =>
    Object.fromEntries((group.members || []).map((member) => [member._id, 1]))
  )
  const [percentageMap, setPercentageMap] = useState(() =>
    Object.fromEntries((group.members || []).map((member) => [member._id, 0]))
  )
  const [itemMap, setItemMap] = useState(() =>
    Object.fromEntries((group.members || []).map((member) => [member._id, '']))
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalShares = useMemo(
    () => Object.values(shareMap).reduce((sum, value) => sum + Number(value || 0), 0),
    [shareMap]
  )
  const totalPercentage = useMemo(
    () => Object.values(percentageMap).reduce((sum, value) => sum + Number(value || 0), 0),
    [percentageMap]
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        groupId: group._id,
        title,
        totalAmount: Number(amount),
        currency,
        paidBy,
        splitType,
        splitDetails:
          splitType === 'share'
            ? Object.entries(shareMap).map(([user, shares]) => ({
                user,
                shares: Number(shares),
              }))
            : splitType === 'percentage'
              ? Object.entries(percentageMap).map(([user, percentage]) => ({
                  user,
                  percentage: Number(percentage),
                }))
              : splitType === 'item'
                ? Object.entries(itemMap).map(([user, itemData]) => {
                    const [itemsPart, amountPart] = itemData.split('|')
                    const amountValue = Number((amountPart || '').trim())
                    return {
                      user,
                      items: (itemsPart || '')
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                      amount: Number.isNaN(amountValue) ? 0 : amountValue,
                    }
                  })
                : [],
      }

      const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to add expense')
      }
      onCreated(data.expense)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Add expense</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{group.name}</h2>
            <p className="mt-2 text-sm text-slate-600">Record a payment and split it fairly.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500">Expense title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                  placeholder="Hotel booking"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Total amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                  placeholder="2500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Currency</label>
                <input
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                  placeholder="INR"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Paid by</label>
                <select
                  value={paidBy}
                  onChange={(event) => setPaidBy(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                >
                  {group.members?.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <label className="text-xs text-slate-500">Split type</label>
                <select
                  value={splitType}
                  onChange={(event) => setSplitType(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {splitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {splitType === 'share' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Shares per member</p>
                  {group.members?.map((member) => (
                    <div key={member._id} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-700">{member.name}</span>
                      <input
                        type="number"
                        min="0"
                        value={shareMap[member._id] ?? 1}
                        onChange={(event) =>
                          setShareMap((prev) => ({
                            ...prev,
                            [member._id]: event.target.value,
                          }))
                        }
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">Total shares: {totalShares}</p>
                </div>
              ) : null}

              {splitType === 'percentage' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Percent per member</p>
                  {group.members?.map((member) => (
                    <div key={member._id} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-700">{member.name}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentageMap[member._id] ?? 0}
                        onChange={(event) =>
                          setPercentageMap((prev) => ({
                            ...prev,
                            [member._id]: event.target.value,
                          }))
                        }
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">Total: {totalPercentage}%</p>
                </div>
              ) : null}

              {splitType === 'item' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Items per member ("item1,item2 | amount")</p>
                  {group.members?.map((member) => (
                    <div key={member._id} className="grid gap-2">
                      <span className="text-xs text-slate-700">{member.name}</span>
                      <input
                        value={itemMap[member._id] ?? ''}
                        onChange={(event) =>
                          setItemMap((prev) => ({
                            ...prev,
                            [member._id]: event.target.value,
                          }))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900"
                        placeholder="Pizza, Drinks | 450"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {splitType === 'equal' ? (
                <p className="text-xs text-slate-500">
                  Equal split across {group.members?.length || 0} members.
                </p>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseFormModal