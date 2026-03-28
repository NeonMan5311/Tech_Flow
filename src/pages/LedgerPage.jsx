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
        if (!response.ok) throw new Error(data?.message || 'Failed to fetch settlements')
        setSettlements(data.settlements || [])
      } catch (err) {
        setSettleError(err.message)
      }
    }

    fetchSettlements()
  }, [token])

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Ledger</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Settlement timeline</h1>
        <p className="mt-2 text-sm text-slate-300">Record settlements and maintain a transparent audit log for every group.</p>
        <button
          type="button"
          onClick={() => setSettleModalOpen(true)}
          className="mt-4 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-xs font-bold text-slate-950"
        >
          Record settlement
        </button>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <article key={group._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-lg font-semibold text-white">{group.name}</p>
            <p className="text-xs text-slate-400">{group.members?.length || 0} members</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.members?.map((member) => (
                <span key={member._id} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {member.name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent settlements</h2>
          <p className="text-xs text-slate-400">{settlements.length} total</p>
        </div>
        {loading ? <p className="mt-3 text-sm text-slate-400">Loading balances…</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        {settleError ? <p className="mt-3 text-sm text-rose-300">{settleError}</p> : null}
        <div className="mt-4 space-y-3">
          {settlements.map((settlement) => (
            <div key={settlement._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{settlement.fromUser?.name} → {settlement.toUser?.name}</p>
                <p className="text-xs text-slate-400">{settlement.group?.name}</p>
              </div>
              <p className="text-sm font-semibold text-cyan-200">{settlement.currency} {settlement.amount.toFixed(2)}</p>
            </div>
          ))}
          {!settlements.length ? <p className="text-xs text-slate-400">No settlements recorded yet.</p> : null}
        </div>
      </section>

      {settleModalOpen ? (
        <SettleUpModal
          token={token}
          groups={groups}
          currentUser={session?.user}
          onClose={() => setSettleModalOpen(false)}
          onRecorded={(settlement) => {
            setSettlements((prev) => [settlement, ...prev])
            setSettleModalOpen(false)
          }}
        />
      ) : null}
    </main>
  )
}

export default LedgerPage
