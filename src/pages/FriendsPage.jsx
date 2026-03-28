import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'
const money = (n) => `₹${Number(n || 0).toFixed(2)}`

function FriendsPage({ groups, loading, error, token, session, ledgerRefreshKey }) {
  const members = groups.flatMap((group) => group.members || [])
  const unique = Array.from(new Map(members.map((m) => [m._id, m])).values())
  const [summary, setSummary] = useState({ owe: 0, owed: 0, net: 0 })
  const [people, setPeople] = useState([])
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [settlements, setSettlements] = useState([])
  const [openLedger, setOpenLedger] = useState([])

  const currentUserId = session?.user?._id
  const groupLookup = useMemo(() => Object.fromEntries(groups.map((g) => [g._id, g])), [groups])
  const memberLookup = useMemo(
    () =>
      Object.fromEntries(
        groups
          .flatMap((group) => group.members || [])
          .map((member) => [member._id, member])
      ),
    [groups]
  )

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token || !currentUserId) return
      setPageLoading(true)
      setPageError('')

      try {
        const response = await fetch(`${API_BASE}/expenses/summary/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || 'Failed to load balances')

        setSummary(data.summary || { owe: 0, owed: 0, net: 0 })
        setPeople(data.people || [])
      } catch (err) {
        setPageError(err.message)
      } finally {
        setPageLoading(false)
      }
    }

    fetchSummary()
  }, [token, currentUserId, ledgerRefreshKey])

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
        setPageError(err.message)
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
        setPageError(err.message)
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
          id: entry._id || `${groupId}-${fromUser}-${toUser}-${amount}`,
          direction: 'you_owe',
          friendId: toUser,
          title: entry.expense?.title || entry.group?.name || 'Expense',
          amount,
          currency: entry.currency || 'INR',
          groupId,
          groupName: groupLookup[groupId]?.name || 'Group',
          date: entry.date || entry.createdAt || entry.updatedAt,
        })
      } else if (toUser === currentUserId) {
        balances.set(fromUser, (balances.get(fromUser) || 0) + amount)
        groupBalances.set(groupId, {
          ...groupBalances.get(groupId),
          owed: groupBalances.get(groupId).owed + amount,
          currency: entry.currency,
        })
        transactions.push({
          id: entry._id || `${groupId}-${fromUser}-${toUser}-${amount}`,
          direction: 'owes_you',
          friendId: fromUser,
          title: entry.expense?.title || entry.group?.name || 'Expense',
          amount,
          currency: entry.currency || 'INR',
          groupId,
          groupName: groupLookup[groupId]?.name || 'Group',
          date: entry.date || entry.createdAt || entry.updatedAt,
        })
      }
    })

    const owedByYou = []
    const owedToYou = []

    balances.forEach((amount, friendId) => {
      if (amount < 0) {
        owedByYou.push({ friendId, amount: Math.abs(amount) })
      } else if (amount > 0) {
        owedToYou.push({ friendId, amount })
      }
    })

    const totals = {
      owe: owedByYou.reduce((sum, item) => sum + item.amount, 0),
      owed: owedToYou.reduce((sum, item) => sum + item.amount, 0),
    }

    const groupTotals = Array.from(groupBalances.entries()).map(([groupId, data]) => ({
      groupId,
      groupName: groupLookup[groupId]?.name || 'Group',
      ...data,
    }))

    transactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))

    return { owedByYou, owedToYou, transactions, totals, groupTotals }
  }, [openLedger, currentUserId, settlements])

  const youOwe = useMemo(
    () => people.filter((item) => item.direction === 'you_owe'),
    [people]
  )

  const owesYou = useMemo(
    () => people.filter((item) => item.direction === 'owes_you'),
    [people]
  )

  const friendBalances = useMemo(() => {
    const balanceMap = new Map()
    balanceData.owedByYou.forEach((item) => {
      balanceMap.set(item.friendId, { direction: 'you_owe', amount: item.amount })
    })
    balanceData.owedToYou.forEach((item) => {
      balanceMap.set(item.friendId, { direction: 'owes_you', amount: item.amount })
    })
    return balanceMap
  }, [balanceData.owedByYou, balanceData.owedToYou])

  const transactions = balanceData.transactions

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Friends</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">People you split with</h1>
        <p className="mt-2 text-sm text-slate-300">Live balances pulled from your actual expense history.</p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-rose-300/20 bg-rose-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-200">You owe</p>
          <p className="mt-2 text-3xl font-bold text-rose-100">{money(summary.owe)}</p>
          <p className="mt-2 text-xs text-rose-200/80">{youOwe.length} people</p>
        </article>
        <article className="rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Owed to you</p>
          <p className="mt-2 text-3xl font-bold text-cyan-100">{money(summary.owed)}</p>
          <p className="mt-2 text-xs text-cyan-200/80">{owesYou.length} people</p>
        </article>
        <article className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Net</p>
          <p className="mt-2 text-3xl font-bold text-emerald-100">{money(summary.net)}</p>
          <p className="mt-2 text-xs text-emerald-200/80">{summary.net >= 0 ? 'You are net positive' : 'You are net payable'}</p>
        </article>
      </section>

      {loading ? <p className="mt-4 text-sm text-slate-300">Loading members…</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      {pageLoading ? <p className="mt-4 text-sm text-slate-300">Refreshing balances…</p> : null}
      {pageError ? <p className="mt-4 text-sm text-rose-300">{pageError}</p> : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold text-white">Top people you owe</h2>
          <div className="mt-4 space-y-3">
            {youOwe
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((item) => (
                <div key={item.userId} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{item.userName}</p>
                    <p className="text-sm font-semibold text-rose-200">{money(item.amount)}</p>
                  </div>
                  <p className="text-xs text-slate-400">You owe this person</p>
                </div>
              ))}
            {!youOwe.length ? <p className="text-sm text-slate-400">No pending dues.</p> : null}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold text-white">Top people who owe you</h2>
          <div className="mt-4 space-y-3">
            {owesYou
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((item) => (
                <div key={item.userId} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{item.userName}</p>
                    <p className="text-sm font-semibold text-emerald-200">{money(item.amount)}</p>
                  </div>
                  <p className="text-xs text-slate-400">This person owes you</p>
                </div>
              ))}
            {!owesYou.length ? <p className="text-sm text-slate-400">No receivables pending.</p> : null}
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent friend transactions</h2>
          <p className="text-xs text-slate-400">{transactions.length} shown</p>
        </div>
        <div className="mt-4 space-y-3">
          {transactions.map((txn) => {
            const friend = memberLookup[txn.friendId]
            return (
              <div key={txn.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{txn.title}</p>
                  <p className="text-xs text-slate-400">
                    {txn.groupName} · {txn.direction === 'you_owe' ? 'You owe' : 'You get'} {friend?.name || 'Member'}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${txn.direction === 'you_owe' ? 'text-rose-200' : 'text-cyan-200'}`}>
                  {txn.currency} {txn.amount.toFixed(2)}
                </p>
              </div>
            )
          })}
          {!transactions.length ? <p className="text-sm text-slate-400">No transactions yet.</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {unique.map((member) => {
            const balance = friendBalances.get(member._id)
            const directionLabel = balance?.direction === 'you_owe' ? 'You owe' : balance?.direction === 'owes_you' ? 'Owes you' : 'Settled up'
            const amountLabel = balance ? `₹${balance.amount.toFixed(2)}` : '₹0.00'
            const amountClass = balance?.direction === 'you_owe' ? 'text-rose-500' : balance?.direction === 'owes_you' ? 'text-blue-600' : 'text-slate-500'

            return (
              <div key={member._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">@{member.username}</p>
                    <p className="mt-3 text-xs text-slate-600">{member.email || 'No email on file'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Balance</p>
                    <p className={`mt-2 text-lg font-semibold ${amountClass}`}>{amountLabel}</p>
                    <p className="text-xs text-slate-500">{directionLabel}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default FriendsPage
