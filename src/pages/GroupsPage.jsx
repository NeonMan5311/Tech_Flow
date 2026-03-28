import { useState } from 'react'
import GroupFormModal from '../components/groups/GroupFormModal'
import ExpenseFormModal from '../components/groups/ExpenseFormModal'

function GroupsPage({ groups, setGroups, loading, error, token }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [expenseModal, setExpenseModal] = useState(null)
  const [expenseMap, setExpenseMap] = useState({})
  const [expenseLoading, setExpenseLoading] = useState({})
  const [expenseError, setExpenseError] = useState({})

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
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch expenses')
      }
      setExpenseMap((prev) => ({ ...prev, [groupId]: data.expenses || [] }))
      return data.expenses || []
    } catch (err) {
      setExpenseError((prev) => ({ ...prev, [groupId]: err.message }))
      return []
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
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Groups</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your expense groups</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Organize trips, homes, or projects. Add members, track shared expenses, and keep everyone in sync.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          + New group
        </button>
      </section>

      <section className="mt-8 grid gap-6">
        {loading ? (
          <p className="text-sm text-slate-500">Loading your groups…</p>
        ) : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group._id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{group.name}</p>
                  <p className="text-xs text-slate-500">{group.members?.length || 0} members</p>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] uppercase text-blue-600">
                  Active
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.members?.map((member) => (
                  <span key={member._id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                    {member.name}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs">
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

              {expenseError[group._id] ? (
                <p className="mt-3 text-xs text-rose-400">{expenseError[group._id]}</p>
              ) : null}

              {(expenseMap[group._id] || []).length ? (
                <div className="mt-4 space-y-3">
                  {(expenseMap[group._id] || []).map((expense) => (
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
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {!groups.length && !loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">No groups yet. Create your first one to start splitting.</p>
          </div>
        ) : null}
      </section>

      {modalOpen ? (
        <GroupFormModal token={token} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      ) : null}

      {expenseModal ? (
        <ExpenseFormModal
          token={token}
          group={expenseModal}
          onClose={() => setExpenseModal(null)}
          onCreated={(expense) => handleExpenseCreated(expenseModal._id, expense)}
        />
      ) : null}
    </main>
  )
}

export default GroupsPage