import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'
const money = (n) => `₹${Number(n || 0).toFixed(2)}`

function FriendsPage({ groups, loading, error, token, session }) {
  const [summary, setSummary] = useState({ owe: 0, owed: 0, net: 0 })
  const [people, setPeople] = useState([])
  const [transactions, setTransactions] = useState([])
  const [groupTotals, setGroupTotals] = useState([])
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState('')

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
    const loadFriendsData = async () => {
      if (!token || !currentUserId) return
      setPageLoading(true)
      setPageError('')

      try {
        const [summaryRes, groupsRes] = await Promise.all([
          fetch(`${API_BASE}/expenses/summary/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const summaryData = await summaryRes.json()
        const groupsData = await groupsRes.json()

        if (!summaryRes.ok) throw new Error(summaryData?.message || 'Failed to load balances')
        if (!groupsRes.ok) throw new Error(groupsData?.message || 'Failed to load groups')

        setSummary(summaryData.summary || { owe: 0, owed: 0, net: 0 })
        setPeople(summaryData.people || [])

        const ownedGroups = groupsData.groups || []
        const expenseResponses = await Promise.all(
          ownedGroups.map((group) =>
            fetch(`${API_BASE}/expenses/${group._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(async (response) => {
              const data = await response.json()
              if (!response.ok) throw new Error(data?.message || 'Failed to load expenses')
              return { group, expenses: data.expenses || [] }
            })
          )
        )

        const txns = []
        const groupNetMap = new Map()

        expenseResponses.forEach(({ group, expenses }) => {
          expenses.forEach((expense) => {
            const payerId = expense.paidBy?._id || expense.paidBy
            ;(expense.splitDetails || []).forEach((detail) => {
              const participantId = detail.user?._id || detail.user
              const amount = Number(detail.amount || 0)
              if (!amount || participantId === payerId) return

              if (participantId === currentUserId) {
                txns.push({
                  id: `${expense._id}-${participantId}`,
                  title: expense.title,
                  friendId: payerId,
                  direction: 'you_owe',
                  amount,
                  currency: expense.currency,
                  groupName: group.name,
                  date: expense.date,
                })
                groupNetMap.set(group._id, (groupNetMap.get(group._id) || 0) - amount)
              }

              if (payerId === currentUserId) {
                txns.push({
                  id: `${expense._id}-${payerId}-${participantId}`,
                  title: expense.title,
                  friendId: participantId,
                  direction: 'owes_you',
                  amount,
                  currency: expense.currency,
                  groupName: group.name,
                  date: expense.date,
                })
                groupNetMap.set(group._id, (groupNetMap.get(group._id) || 0) + amount)
              }
            })
          })
        })

        txns.sort((a, b) => new Date(b.date) - new Date(a.date))
        setTransactions(txns.slice(0, 12))

        const groupRows = Array.from(groupNetMap.entries()).map(([groupId, net]) => ({
          groupId,
          groupName: groupLookup[groupId]?.name || 'Group',
          net,
        }))
        setGroupTotals(groupRows)
      } catch (err) {
        setPageError(err.message)
      } finally {
        setPageLoading(false)
      }
    }

    loadFriendsData()
  }, [token, currentUserId, groupLookup])

  const youOwe = people.filter((p) => p.direction === 'you_owe')
  const owesYou = people.filter((p) => p.direction === 'owes_you')

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
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-semibold text-white">Group net exposure</h2>
        <div className="mt-4 space-y-3">
          {groupTotals.map((group) => (
            <div key={group.groupId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <p className="text-sm font-semibold text-white">{group.groupName}</p>
              <p className={`text-sm font-semibold ${group.net >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                {money(group.net)}
              </p>
            </div>
          ))}
          {!groupTotals.length ? <p className="text-sm text-slate-400">No group totals yet.</p> : null}
        </div>
      </section>
    </main>
  )
}

export default FriendsPage
