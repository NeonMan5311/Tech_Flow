function MarketingLanding() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Smart debt simplification
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Split expenses without the awkward follow-ups.
          </h1>
          <p className="text-lg text-slate-300">
            Track group spending, handle multi-currency trips, and reduce everyone’s dues into the smallest number of payments.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-400">
              Create a group
            </button>
            <button className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-400">
              See how it works
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Groups managed', value: '1,250+' },
              { label: 'Avg. payments saved', value: '38%' },
              { label: 'Supported currencies', value: '40+' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-lg">
          <div className="rounded-2xl bg-slate-900/70 p-6">
            <p className="text-sm font-semibold text-emerald-400">Today · Goa Trip</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">You get ₹2,350</h2>
            <p className="mt-1 text-sm text-slate-400">Balances simplified into just 2 payments.</p>
            <div className="mt-6 space-y-4">
              {[
                { name: 'Rahul → You', amount: '₹1,150' },
                { name: 'Priya → You', amount: '₹1,200' },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <span className="text-sm text-slate-300">{row.name}</span>
                  <span className="text-sm font-semibold text-emerald-300">{row.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Settle up', text: 'Instantly send a reminder with a single tap.' },
              { title: 'Recurrence', text: 'Automate rent, utilities, and subscriptions.' },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-xs text-slate-400">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="space-y-8 py-12">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Features</p>
          <h2 className="text-3xl font-semibold text-white">Everything you need to split fairly.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Smart split engine',
              text: 'Equal, percentage, share, or item-level splits with automatic fairness checks.',
            },
            {
              title: 'Multi-currency ready',
              text: 'Lock exchange rates at the moment of payment and store the history for transparency.',
            },
            {
              title: 'Debt simplification',
              text: 'Convert complex balances into the smallest set of payments with one click.',
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-lg font-semibold text-white">{feature.title}</p>
              <p className="mt-3 text-sm text-slate-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Workflow</p>
          <h2 className="text-3xl font-semibold text-white">From expense to settle-up in minutes.</h2>
          <p className="text-sm text-slate-400">
            Add an expense, select the split style, and let Split It Fair compute balances instantly. Everyone sees what they owe.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { step: '01', title: 'Create your group', text: 'Invite friends, roommates, or teammates.' },
            { step: '02', title: 'Log expenses', text: 'Capture receipts or enter totals manually.' },
            { step: '03', title: 'Choose split rules', text: 'Equal, shares, items, or custom percentages.' },
            { step: '04', title: 'Simplify payments', text: 'We reduce everything to the fewest transfers.' },
          ].map((step) => (
            <div key={step.step} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-semibold text-emerald-300">Step {step.step}</p>
              <p className="mt-2 text-sm font-semibold text-white">{step.title}</p>
              <p className="mt-2 text-xs text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="grid gap-8 py-12">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/20 via-slate-900 to-slate-950 p-8">
          <h2 className="text-3xl font-semibold text-white">Free for trips. Powerful for teams.</h2>
          <p className="mt-2 text-sm text-slate-300">
            Start for free, upgrade when you need recurring automation, pro insights, and API access.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">
              Try Split It Fair
            </button>
            <button className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white">
              View pricing
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default MarketingLanding