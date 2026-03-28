import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'

function FriendsPage({ groups, loading, error, token, session, ledgerRefreshKey }) {
  const members = groups.flatMap((group) => group.members || [])
  const unique = Array.from(new Map(members.map((m) => [m._id, m])).values())
  const [expenseMap, setExpenseMap] = useState({})
  const [expenseLoading, setExpenseLoading] = useState(false)
  const [expenseError, setExpenseError] = useState('')
  const [settlements, setSettlements] = useState([])
  const [openLedger, setOpenLedger] = useState([])

  const currentUserId = session?.user?._id

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!token || !groups.length) return
      setExpenseLoading(true)
      setExpenseError('')
      try {
        const responses = await Promise.all(
          groups.map((group) =>
            fetch(`${API_BASE}/expenses/${group._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(async (response) => {
              const data = await response.json()
              if (!response.ok) {
                throw new Error(data?.message || 'Failed to fetch expenses')
              }
              return [group._id, data.expenses || []]
            })
          )
        )
        setExpenseMap(Object.fromEntries(responses))
      } catch (err) {
        setExpenseError(err.message)
      } finally {
        setExpenseLoading(false)
      }
    }

    fetchExpenses()
  }, [groups, token])

  useEffect(() => {
    const fetchOpenLedger = async () => {
      if (!token) return
      try {
        const response = await fetch(`${API_BASE}/ledger/open`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load ledger')
        }
        setOpenLedger(data.entries || [])
      } catch (err) {
        setExpenseError(err.message)
      }
    }

    fetchOpenLedger()
  }, [token, ledgerRefreshKey])

  useEffect(() => {
    const fetchSettlements = async () => {
      if (!token) return
      try {
        const response = await fetch(`${API_BASE}/ledger/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load settlements')
        }
        setSettlements(data.settlements || [])
      } catch (err) {
        setExpenseError(err.message)
      }
    }

    fetchSettlements()
  }, [token])

  const balanceData = useMemo(() => {
    if (!currentUserId) {
      return {
        owedByYou: [],
        owedToYou: [],
        transactions: [],
        totals: { owe: 0, owed: 0 },
        groupTotals: [],
      }
    }

    const balances = new Map()
    const transactions = []
    const groupBalances = new Map()

    openLedger.forEach((entry) => {
      const fromUser = entry.fromUser?._id || entry.fromUser
      const toUser = entry.toUser?._id || entry.toUser
      const amount = Number(entry.amount || 0)
      if (!amount) return
      const groupId = entry.group?._id || entry.group
      if (!groupBalances.has(groupId)) {
        groupBalances.set(groupId, { owe: 0, owed: 0, currency: entry.currency })
      }

      if (fromUser === currentUserId) {
        balances.set(toUser, (balances.get(toUser) || 0) - amount)
        groupBalances.set(groupId, {
          ...groupBalances.get(groupId),
          owe: groupBalances.get(groupId).owe + amount,
          currency: entry.currency,
        })
        transactions.push({
          type: 'owe',
          friendId: toUser,
          title: entry.expense?.title || entry.group?.name || 'Expense',
          amount,
          currency: entry.currency,
          groupId,
        })
      } else if (toUser === currentUserId) {
        balances.set(fromUser, (balances.get(fromUser) || 0) + amount)
        groupBalances.set(groupId, {
          ...groupBalances.get(groupId),
          owed: groupBalances.get(groupId).owed + amount,
          currency: entry.currency,
        })
        transactions.push({
          type: 'owed',
          friendId: fromUser,
          title: entry.expense?.title || entry.group?.name || 'Expense',
          amount,
          currency: entry.currency,
          groupId,
        })
      }
    })

    settlements.forEach((settlement) => {
      const fromUser = settlement.fromUser?._id || settlement.fromUser
      const toUser = settlement.toUser?._id || settlement.toUser
      const amount = Number(settlement.amount || 0)
      if (!amount) return
      if (!groupBalances.has(settlement.group?._id || settlement.group)) {
        groupBalances.set(settlement.group?._id || settlement.group, {
          owe: 0,
          owed: 0,
          currency: settlement.currency,
        })
      }

      if (fromUser === currentUserId) {
        balances.set(toUser, (balances.get(toUser) || 0) + amount)
        groupBalances.set(settlement.group?._id || settlement.group, {
          ...groupBalances.get(settlement.group?._id || settlement.group),
          owe: Math.max(groupBalances.get(settlement.group?._id || settlement.group).owe - amount, 0),
          currency: settlement.currency,
        })
      } else if (toUser === currentUserId) {
        balances.set(fromUser, (balances.get(fromUser) || 0) - amount)
        groupBalances.set(settlement.group?._id || settlement.group, {
          ...groupBalances.get(settlement.group?._id || settlement.group),
          owed: Math.max(groupBalances.get(settlement.group?._id || settlement.group).owed - amount, 0),
          currency: settlement.currency,
        })
      }
    })

    const owedByYou = []
    const owedToYou = []
    balances.forEach((value, friendId) => {
      if (value < 0) {
        owedByYou.push({ friendId, amount: Math.abs(value) })
      } else if (value > 0) {
        owedToYou.push({ friendId, amount: value })
      }
    })

    const totals = {
      owe: owedByYou.reduce((sum, item) => sum + item.amount, 0),
      owed: owedToYou.reduce((sum, item) => sum + item.amount, 0),
    }

    const groupTotals = Array.from(groupBalances.entries()).map(([groupId, data]) => ({
      groupId,
      ...data,
    }))

    return { owedByYou, owedToYou, transactions, totals, groupTotals }
  }, [openLedger, currentUserId, settlements])

  const friendLookup = useMemo(
    () => Object.fromEntries(unique.map((member) => [member._id, member])),
    [unique]
  )

  const groupLookup = useMemo(
    () => Object.fromEntries(groups.map((group) => [group._id, group])),
    [groups]
  )

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Friends</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">People you split with</h1>
        <p className="mt-2 text-sm text-slate-600">
          Members added to your groups appear here for quick access and reminders.
        </p>
      </section>

      <section className="mt-6 grid gap-4">
        {loading ? <p className="text-sm text-slate-500">Loading members…</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        {expenseLoading ? <p className="text-sm text-slate-500">Loading expenses…</p> : null}
        {expenseError ? <p className="text-sm text-rose-400">{expenseError}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">You owe</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">₹{balanceData.totals.owe.toFixed(2)}</p>
            <div className="mt-4 space-y-3">
              {balanceData.owedByYou.map((item) => {
                const friend = friendLookup[item.friendId]
                return (
                  <div key={item.friendId} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-700">{friend?.name || 'Friend'}</span>
                    <span className="text-sm font-semibold text-rose-500">₹{item.amount.toFixed(2)}</span>
                  </div>
                )
              })}
              {!balanceData.owedByYou.length ? (
                <p className="text-xs text-slate-500">No dues right now.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Owed to you</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">₹{balanceData.totals.owed.toFixed(2)}</p>
            <div className="mt-4 space-y-3">
              {balanceData.owedToYou.map((item) => {
                const friend = friendLookup[item.friendId]
                return (
                  <div key={item.friendId} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-700">{friend?.name || 'Friend'}</span>
                    <span className="text-sm font-semibold text-blue-600">₹{item.amount.toFixed(2)}</span>
                  </div>
                )
              })}
              {!balanceData.owedToYou.length ? (
                <p className="text-xs text-slate-500">No one owes you right now.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Transactions</p>
            <p className="text-xs text-slate-500">{balanceData.transactions.length} total</p>
          </div>
          <div className="mt-4 space-y-3">
            {balanceData.transactions.map((transaction, index) => {
              const friend = friendLookup[transaction.friendId]
              return (
                <div key={`${transaction.title}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{transaction.title}</p>
                    <p className="text-xs text-slate-500">
                      {transaction.type === 'owe' ? 'You owe' : 'You get'} {friend?.name || 'Friend'}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${transaction.type === 'owe' ? 'text-rose-500' : 'text-blue-600'}`}>
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </p>
                </div>
              )
            })}
            {!balanceData.transactions.length ? (
              <p className="text-xs text-slate-500">No transactions yet.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Group totals</p>
            <p className="text-xs text-slate-500">Outstanding per group</p>
          </div>
          <div className="mt-4 space-y-3">
            {balanceData.groupTotals.map((groupTotal) => (
              <div
                key={groupTotal.groupId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {groupLookup[groupTotal.groupId]?.name || 'Group'}
                  </p>
                  <p className="text-xs text-slate-500">
                    You owe {groupTotal.currency} {groupTotal.owe.toFixed(2)} · Owed to you{' '}
                    {groupTotal.currency} {groupTotal.owed.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Net</p>
                  <p
                    className={`text-sm font-semibold ${
                      groupTotal.owed - groupTotal.owe >= 0 ? 'text-blue-600' : 'text-rose-500'
                    }`}
                  >
                    {groupTotal.currency} {(groupTotal.owed - groupTotal.owe).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {!balanceData.groupTotals.length ? (
              <p className="text-xs text-slate-500">No group totals yet.</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {unique.map((member) => (
            <div key={member._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-500">@{member.username}</p>
              <p className="mt-3 text-xs text-slate-600">{member.email || 'No email on file'}</p>
            </div>
          ))}
        </div>

        {!unique.length && !loading ? (
          <p className="text-sm text-slate-600">No group members yet. Create a group to see them here.</p>
        ) : null}
      </section>
    </main>
  )
}

export default FriendsPage