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
        if (!response.ok) throw new Error(data?.message || 'Failed to load dashboard summary')
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

  const cards = useMemo(
    () => [
      { label: 'You Owe', value: summary.owe, tone: 'text-rose-200', bg: 'from-rose-400/20 to-transparent' },
      { label: 'Owed To You', value: summary.owed, tone: 'text-cyan-200', bg: 'from-cyan-400/20 to-transparent' },
      { label: 'Net Position', value: summary.net, tone: summary.net >= 0 ? 'text-emerald-200' : 'text-amber-200', bg: 'from-emerald-400/20 to-transparent' },
    ],
    [summary]
  )

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Member Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{greeting}</h1>
        <p className="mt-2 text-sm text-slate-300">Your neutral, transparent snapshot across all groups.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.label} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.bg} p-5`}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${card.tone}`}>₹{card.value.toFixed(2)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Who owes whom</h2>
          {loading ? <p className="text-xs text-slate-400">Refreshing...</p> : null}
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {people.map((item) => (
            <div key={item.userId} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{item.userName}</p>
                <p className={`text-sm font-semibold ${item.direction === 'you_owe' ? 'text-rose-200' : 'text-emerald-200'}`}>
                  ₹{item.amount.toFixed(2)}
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-400">{item.direction === 'you_owe' ? 'You need to pay this member' : 'This member needs to pay you'}</p>
            </div>
          ))}
          {!loading && !people.length ? <p className="text-sm text-slate-400">No pending balances yet. Clean slate ✅</p> : null}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
