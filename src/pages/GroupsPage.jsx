import { useState } from 'react'
import GroupFormModal from '../components/groups/GroupFormModal'
import ExpenseFormModal from '../components/groups/ExpenseFormModal'

function GroupsPage({ groups, setGroups, loading, error, token, onLedgerRefresh }) {
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
      return data.expenses || []
    } catch (err) {
      setExpenseError((prev) => ({ ...prev, [groupId]: err.message }))
    } finally {
      setExpenseLoading((prev) => ({ ...prev, [groupId]: false }))
    }
  }

  const handleExpenseCreated = (groupId, expense) => {
    setExpenseMap((prev) => ({
      ...prev,
      [groupId]: [expense, ...(prev[groupId] || [])],
    }))
    setExpenseModal(null)
    if (onLedgerRefresh) {
      onLedgerRefresh()
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
          <div
            key={group._id}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-200 via-blue-500 to-indigo-500 opacity-80" />

            {/* HEADER */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Group</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{group.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {group.members?.length || 0} members
                </p>
              </div>
            </div>

            {/* MEMBERS */}
            <div className="mt-4 flex flex-wrap gap-2">
              {group.members?.slice(0, 5).map((member) => (
                <span
                  key={member._id}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                >
                  {member.name}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex gap-3 text-xs">
              <button
                onClick={() => loadExpenses(group._id)}
                className="rounded-full border border-slate-200 px-4 py-2 text-slate-600"
              >
                {expenseLoading[group._id] ? "Loading…" : "View expenses"}
              </button>

              <button
                onClick={() => setExpenseModal(group)}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700"
              >
                Add expense
              </button>
            </div>

            {/* ERROR */}
            {expenseError[group._id] && (
              <p className="mt-3 text-xs text-red-500">{expenseError[group._id]}</p>
            )}

            {/* SIMPLIFIED SETTLEMENTS */}
            {(simplifiedMap[group._id] || []).length > 0 && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-700">Optimized settlements</p>

                {(simplifiedMap[group._id] || []).map((item, index) => {
                  const fromName =
                    group.members?.find((m) => m._id === item.from)?.name || "Member"
                  const toName =
                    group.members?.find((m) => m._id === item.to)?.name || "Member"

                  return (
                    <p key={index} className="text-xs text-emerald-800">
                      {fromName} → {toName}: ₹{item.amount.toFixed(2)}
                    </p>
                  )
                })}
              </div>
            )}

            {/* EXPENSES */}
            {(expenseMap[group._id] || []).length > 0 && (
              <div className="mt-4 space-y-2">
                {(expenseMap[group._id] || []).slice(0, 3).map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between rounded-xl border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-black">{expense.title}</p>
                      <p className="text-xs text-slate-500">
                        {expense.paidBy?.name} · {expense.splitType}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-wide text-cyan-200">
                        Live
                      </span>
                      <p className="mt-2 text-sm font-semibold text-black">
                        {expense.currency} {expense.totalAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {!groups.length && !loading && (
          <div className="rounded-3xl border border-dashed p-8 text-center">
            <p className="text-sm text-slate-500">No groups yet. Start with one.</p>
          </div>
        )}
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
