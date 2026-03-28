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

        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group._id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-200 via-blue-500 to-indigo-500 opacity-80" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Group</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{group.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{group.members?.length || 0} members</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] uppercase text-blue-600">
                    Active
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase text-slate-500">
                    Shared
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent activity</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {(expenseMap[group._id] || []).length ? (expenseMap[group._id] || [])[0]?.title : 'No expenses yet'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(expenseMap[group._id] || []).length
                      ? `${(expenseMap[group._id] || [])[0]?.currency} ${(expenseMap[group._id] || [])[0]?.totalAmount}`
                      : 'Add your first expense to get started.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Members</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.members?.slice(0, 5).map((member) => (
                      <span key={member._id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                        {member.name}
                      </span>
                    ))}
                    {group.members?.length > 5 ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                        +{group.members.length - 5} more
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => loadExpenses(group._id)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-300"
                  >
                    {expenseLoading[group._id] ? 'Loading…' : 'View expenses'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseModal(group)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 transition hover:border-blue-300"
                  >
                    Add expense
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  Created • {group.members?.length || 0} people
                </div>
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


              {(simplifiedMap[group._id] || []).length ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Optimized settlements</p>
                  <div className="mt-2 space-y-1">
                    {(simplifiedMap[group._id] || []).map((item, index) => {
                      const fromName = group.members?.find((m) => m._id === item.from)?.name || 'Member'
                      const toName = group.members?.find((m) => m._id === item.to)?.name || 'Member'
                      return (
                        <p key={`${item.from}-${item.to}-${index}`} className="text-xs text-emerald-800">
                          {fromName} pays {toName}: {item.amount.toFixed(2)}
                        </p>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {(expenseMap[group._id] || []).length ? (
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Latest expenses</p>
                  {(expenseMap[group._id] || []).slice(0, 3).map((expense) => (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{expense.title}</p>
                        <p className="text-xs text-slate-500">
                          Paid by {expense.paidBy?.name} · {expense.splitType} split
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-blue-600">
                        {expense.currency} {expense.totalAmount}
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
