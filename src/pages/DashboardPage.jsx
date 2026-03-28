import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'

function DashboardPage({ greeting, token }) {
  const [summary, setSummary] = useState({ owe: 0, owed: 0, net: 0 })
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_BASE}/expenses/summary/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load dashboard summary')
        }
        setSummary(data.summary || { owe: 0, owed: 0, net: 0 })
        setPeople(data.people || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [token])

  const summaryCards = useMemo(
    () => [
      { label: 'Total you owe', value: summary.owe.toFixed(2) },
      { label: 'Total owed to you', value: summary.owed.toFixed(2) },
      { label: 'Net position', value: summary.net.toFixed(2) },
    ],
    [summary]
  )

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{greeting}</h1>
        <p className="text-sm text-slate-600">
          Personal member dashboard with transparent totals and who owes whom across all your groups.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">₹{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Per-member breakdown</h2>
          {loading ? <p className="text-xs text-slate-500">Updating…</p> : null}
        </div>
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
        <div className="mt-4 space-y-3">
          {people.map((item) => (
            <div key={item.userId} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.userName}</p>
                <p className="text-xs text-slate-500">{item.direction === 'you_owe' ? 'You owe' : 'Owes you'}</p>
              </div>
              <p className={`text-sm font-semibold ${item.direction === 'you_owe' ? 'text-rose-500' : 'text-blue-600'}`}>
                ₹{item.amount.toFixed(2)}
              </p>
            </div>
          ))}
          {!loading && !people.length ? <p className="text-sm text-slate-500">No pending balances yet.</p> : null}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
