import { useEffect, useState } from 'react'
import SettleUpModal from '../components/ledger/SettleUpModal'

const API_BASE = 'http://localhost:5000/api'

function LedgerPage({ groups, loading, error, token, session }) {
  const [settlements, setSettlements] = useState([])
  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [settleError, setSettleError] = useState('')

  useEffect(() => {
    const fetchSettlements = async () => {
      if (!token) return
      try {
        const response = await fetch(`${API_BASE}/ledger/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to fetch settlements')
        }
        setSettlements(data.settlements || [])
      } catch (err) {
        setSettleError(err.message)
      }
    }

    fetchSettlements()
  }, [token])

  const handleRecorded = (settlement) => {
    setSettlements((prev) => [settlement, ...prev])
    setSettleModalOpen(false)
  }
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Ledger</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Group balances</h1>
        <p className="mt-2 text-sm text-slate-600">
          See which groups are active and prepare to settle up. Member additions update automatically.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSettleModalOpen(true)}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Record settlement
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {loading ? <p className="text-sm text-slate-500">Loading balances…</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        {settleError ? <p className="text-sm text-rose-400">{settleError}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">{group.name}</p>
              <p className="text-xs text-slate-500">Members: {group.members?.length || 0}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.members?.map((member) => (
                  <span key={member._id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                    {member.name}
                  </span>
                ))}
              </div>
              <button className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-slate-300">
                Simplify debts
              </button>
            </div>
          ))}
        </div>
        {!groups.length && !loading ? (
          <p className="text-sm text-slate-600">No groups yet. Create one to start tracking balances.</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent settlements</h2>
          <p className="text-xs text-slate-500">{settlements.length} total</p>
        </div>
        <div className="mt-4 space-y-3">
          {settlements.map((settlement) => (
            <div
              key={settlement._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {settlement.fromUser?.name} → {settlement.toUser?.name}
                </p>
                <p className="text-xs text-slate-500">{settlement.group?.name}</p>
              </div>
              <p className="text-sm font-semibold text-blue-600">
                {settlement.currency} {settlement.amount.toFixed(2)}
              </p>
            </div>
          ))}
          {!settlements.length ? (
            <p className="text-xs text-slate-500">No settlements recorded yet.</p>
          ) : null}
        </div>
      </section>

      {settleModalOpen ? (
        <SettleUpModal
          token={token}
          groups={groups}
          currentUser={session?.user}
          onClose={() => setSettleModalOpen(false)}
          onRecorded={handleRecorded}
        />
      ) : null}
    </main>
  )
}

export default LedgerPage