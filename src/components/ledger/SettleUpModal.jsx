import { useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'

function SettleUpModal({ token, groups, currentUser, onClose, onRecorded }) {
  const [groupId, setGroupId] = useState(groups[0]?._id || '')
  const [fromUser, setFromUser] = useState(currentUser?._id || '')
  const [toUser, setToUser] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedGroup = useMemo(() => groups.find((group) => group._id === groupId), [groups, groupId])
  const members = selectedGroup?.members || []

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/ledger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          fromUser,
          toUser,
          amount: Number(amount),
          currency,
          note,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to record settlement')
      }
      onRecorded(data.settlement)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Settle up</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Record a payment</h2>
            <p className="mt-2 text-sm text-slate-600">Log money that has already been settled.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-xs text-slate-500">Group</label>
            <select
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
            >
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-500">From</label>
              <select
                value={fromUser}
                onChange={(event) => setFromUser(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
              >
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">To</label>
              <select
                value={toUser}
                onChange={(event) => setToUser(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-500">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                placeholder="1200"
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
          </div>
          <div>
            <label className="text-xs text-slate-500">Note (optional)</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
              placeholder="Paid via UPI"
            />
          </div>

          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

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
              disabled={loading}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Record settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SettleUpModal