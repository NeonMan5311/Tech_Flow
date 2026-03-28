const pillars = [
  {
    title: 'Flexible split engine',
    text: 'Equal, percentage, weighted shares, and item-level splits with built-in validation.',
  },
  {
    title: 'Multi-currency transparency',
    text: 'Every expense stores the forex rate used at the exact moment it was logged.',
  },
  {
    title: 'Optimized settlements',
    text: 'Debt graph simplification reduces payment hops and social friction.',
  },
]

function MarketingLanding() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 text-slate-100">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-cyan-900/20 lg:p-12">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              PS 3.3 Hackathon Ready
            </span>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Split group expenses <span className="text-cyan-300">fairly</span>, not just equally.
            </h1>
            <p className="max-w-2xl text-base text-slate-300 md:text-lg">
              Built for trips, flats, and teams: recurring bills, room-size weighting, diet-aware item splits, and clear member dashboards.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-bold text-slate-950">Launch App</button>
              <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Watch 60s Demo Flow</button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live snapshot · Goa Trip</p>
            <h2 className="mt-3 text-3xl font-semibold text-cyan-300">2 transactions instead of 6</h2>
            <p className="mt-2 text-sm text-slate-300">Debt simplification computed from all logged expenses in base currency (INR).</p>
            <div className="mt-5 space-y-3">
              {[
                { route: 'Aman → Nitya', amount: '₹2,450' },
                { route: 'Riya → Nitya', amount: '₹1,160' },
              ].map((row) => (
                <div key={row.route} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm text-slate-200">{row.route}</span>
                  <span className="text-sm font-semibold text-fuchsia-200">{row.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-10 grid gap-5 md:grid-cols-3">
        {pillars.map((feature) => (
          <article key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{feature.text}</p>
          </article>
        ))}
      </section>

      <section id="workflow" className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-6 lg:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Workflow</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">From add expense to settle-up in under a minute.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            'Create group + add members',
            'Log flexible expense split',
            'Auto convert and save forex rate',
            'Get minimized settle-up graph',
          ].map((step, idx) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-cyan-300">Step {String(idx + 1).padStart(2, '0')}</p>
              <p className="mt-2 text-sm text-slate-200">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="judge" className="mt-10 rounded-3xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-7">
        <h2 className="text-2xl font-semibold text-white">Why this is hackathon-viable</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-200">
          <li>Covers all required PS 3.3 features with clear UX surfaces.</li>
          <li>Explains fairness decisions with auditable, neutral records.</li>
          <li>Ready for live demo: create group → add expense → show optimized settlement instantly.</li>
        </ul>
      </section>
    </main>
  )
}

export default MarketingLanding
