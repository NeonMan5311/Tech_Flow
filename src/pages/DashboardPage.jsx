const summaryCards = [
  { label: 'Total you owe', value: '₹1,850' },
  { label: 'Total owed to you', value: '₹3,450' },
  { label: 'Groups active', value: '4' },
]

const recentActivity = [
  { title: 'Goa Trip · Hotel', subtitle: 'Paid by you · split by shares', amount: '+₹1,200' },
  { title: 'Office Lunch', subtitle: 'Paid by Priya · equal split', amount: '-₹350' },
  { title: 'Utilities', subtitle: 'Recurring on 5th monthly', amount: '-₹480' },
]

const settleItems = [
  { name: 'Rahul', amount: '₹1,150', status: 'You will receive' },
  { name: 'Priya', amount: '₹700', status: 'You owe' },
]

function DashboardPage({ greeting }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{greeting}</h1>
        <p className="text-sm text-slate-600">
          Here’s your consolidated view of group balances, upcoming expenses, and settle-up actions.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
          {recentActivity.map((item) => (
            <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.subtitle}</p>
              </div>
              <p className={`text-sm font-semibold ${item.amount.startsWith('+') ? 'text-blue-600' : 'text-rose-500'}`}>
                {item.amount}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Settle up</h2>
          {settleItems.map((item) => (
            <div key={item.name} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm font-semibold text-blue-600">{item.amount}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">{item.status}</p>
              <button className="mt-3 w-full rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                Send reminder
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage