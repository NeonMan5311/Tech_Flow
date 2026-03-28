import { useState } from 'react'
import GroupFormModal from '../components/groups/GroupFormModal'
import ExpenseFormModal from '../components/groups/ExpenseFormModal'

function GroupsPage({ groups, setGroups, loading, error, token }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [expenseModal, setExpenseModal] = useState(null)
  const [expenseMap, setExpenseMap] = useState({})
  const [expenseLoading, setExpenseLoading] = useState({})
  const [expenseError, setExpenseError] = useState({})
  const [simplifiedMap, setSimplifiedMap] = useState({})

  const handleCreated = (group) => {
    setGroups((prev) => [group, ...prev])
    setModalOpen(false)
  }

  const loadExpenses = async (groupId) => {
    setExpenseLoading((prev) => ({ ...prev, [groupId]: true }))
    setExpenseError((prev) => ({ ...prev, [groupId]: '' }))
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Failed to fetch expenses')
      setExpenseMap((prev) => ({ ...prev, [groupId]: data.expenses || [] }))
      setSimplifiedMap((prev) => ({ ...prev, [groupId]: data.simplifiedSettlements || [] }))
    } catch (err) {
      setExpenseError((prev) => ({ ...prev, [groupId]: err.message }))
    } finally {
      setExpenseLoading((prev) => ({ ...prev, [groupId]: false }))
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Groups Hub</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Manage all group contexts</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Trips, flats, clubs—each group gets isolated expenses, split rules, and simplified settlement output.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-xs font-bold text-slate-950"
          >
            + Create Group
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {loading ? <p className="text-sm text-slate-300">Loading your groups…</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        {groups.map((group) => (
          <article key={group._id} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{group.name}</h2>
                <p className="text-xs text-slate-400">{group.members?.length || 0} members</p>
              </div>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-wide text-cyan-200">Live</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {group.members?.map((member) => (
                <span key={member._id} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  {member.name}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <button
                type="button"
                onClick={() => loadExpenses(group._id)}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-slate-100"
              >
                {expenseLoading[group._id] ? 'Loading…' : 'View ledger'}
              </button>
              <button
                type="button"
                onClick={() => setExpenseModal(group)}
                className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-cyan-100"
              >
                Add expense
              </button>
            </div>

            {expenseError[group._id] ? <p className="mt-3 text-xs text-rose-300">{expenseError[group._id]}</p> : null}

            {(simplifiedMap[group._id] || []).length ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Optimized settlements</p>
                <div className="mt-2 space-y-1">
                  {(simplifiedMap[group._id] || []).map((item, index) => {
                    const fromName = group.members?.find((m) => m._id === item.from)?.name || 'Member'
                    const toName = group.members?.find((m) => m._id === item.to)?.name || 'Member'
                    return (
                      <p key={`${item.from}-${item.to}-${index}`} className="text-xs text-emerald-100">
                        {fromName} pays {toName}: ₹{item.amount.toFixed(2)}
                      </p>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {(expenseMap[group._id] || []).length ? (
              <div className="mt-4 space-y-3">
                {(expenseMap[group._id] || []).slice(0, 3).map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{expense.title}</p>
                      <p className="text-xs text-slate-400">Paid by {expense.paidBy?.name} · {expense.splitType}</p>
                    </div>
                    <p className="text-sm font-semibold text-cyan-200">{expense.currency} {expense.totalAmount}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}

        {!groups.length && !loading ? (
          <div className="rounded-3xl border border-dashed border-white/25 bg-white/5 p-8 text-center">
            <p className="text-sm text-slate-300">No groups yet. Start with one and demo your split engine.</p>
          </div>
        ) : null}
      </section>

      {modalOpen ? <GroupFormModal token={token} onClose={() => setModalOpen(false)} onCreated={handleCreated} /> : null}
      {expenseModal ? (
        <ExpenseFormModal
          token={token}
          group={expenseModal}
          onClose={() => setExpenseModal(null)}
          onCreated={(expense) => {
            setExpenseMap((prev) => ({ ...prev, [expenseModal._id]: [expense, ...(prev[expenseModal._id] || [])] }))
            setExpenseModal(null)
          }}
        />
      ) : null}
    </main>
  )
}

export default GroupsPage
