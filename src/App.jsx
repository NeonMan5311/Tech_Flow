import { useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'

const initialForm = {
  name: '',
  username: '',
  email: '',
  identifier: '',
  password: '',
}

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem('splitit_session')
    return stored ? JSON.parse(stored) : null
  })

  const isLoggedIn = Boolean(session?.token)

  const openModal = (nextMode) => {
    setMode(nextMode)
    setForm(initialForm)
    setAuthError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setAuthError('')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login'
      const payload =
        mode === 'signup'
          ? {
              name: form.name,
              username: form.username,
              email: form.email,
              password: form.password,
            }
          : {
              identifier: form.identifier,
              password: form.password,
            }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong.')
      }

      const nextSession = {
        token: data.token,
        user: data.user,
      }

      localStorage.setItem('splitit_session', JSON.stringify(nextSession))
      setSession(nextSession)
      setModalOpen(false)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('splitit_session')
    setSession(null)
  }

  const greeting = useMemo(() => {
    if (!session?.user) return 'Welcome back'
    return `Welcome back, ${session.user.name}`
  }, [session])

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-semibold text-slate-900">
              S
            </div>
            <div>
              <p className="text-lg font-semibold">Split It Fair</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-400"
          >
            Log out
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 pb-20">
          <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
            <h1 className="text-3xl font-semibold text-white">{greeting}</h1>
            <p className="text-sm text-slate-400">
              Here’s your consolidated view of group balances, upcoming expenses, and settle-up actions.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'Total you owe', value: '₹1,850' },
                { label: 'Total owed to you', value: '₹3,450' },
                { label: 'Groups active', value: '4' },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Recent activity</h2>
              {[
                { title: 'Goa Trip · Hotel', subtitle: 'Paid by you · split by shares', amount: '+₹1,200' },
                { title: 'Office Lunch', subtitle: 'Paid by Priya · equal split', amount: '-₹350' },
                { title: 'Utilities', subtitle: 'Recurring on 5th monthly', amount: '-₹480' },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                  <p className={`text-sm font-semibold ${item.amount.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.amount}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Settle up</h2>
              {[
                { name: 'Rahul', amount: '₹1,150', status: 'You will receive' },
                { name: 'Priya', amount: '₹700', status: 'You owe' },
              ].map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-sm font-semibold text-emerald-300">{item.amount}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.status}</p>
                  <button className="mt-3 w-full rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-400">
                    Send reminder
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-semibold text-slate-900">
            S
          </div>
          <div>
            <p className="text-lg font-semibold">Split It Fair</p>
            <p className="text-xs text-slate-400">Simplify shared expenses</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a className="hover:text-white" href="#features">Features</a>
          <a className="hover:text-white" href="#workflow">Workflow</a>
          <a className="hover:text-white" href="#pricing">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('login')}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-400"
          >
            Log in
          </button>
          <button
            onClick={() => openModal('signup')}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-200"
          >
            Sign up
          </button>
        </div>
      </header>

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
              Stay fair, stay transparent.
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
              Add an expense, select the split style, and let Split It Fair compute balances instantly. Everyone sees
              what they owe, and you get a clean, minimal set of payments.
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

      <footer className="border-t border-slate-800 px-6 py-10 text-center text-xs text-slate-500">
        Built for honest groups · © 2026 Split It Fair
      </footer>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
                  {mode === 'signup' ? 'Sign up' : 'Log in'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {mode === 'signup'
                    ? 'Start tracking group expenses in minutes.'
                    : 'Log in to view your balances and settlements.'}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={submitAuth} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs text-slate-400">Full name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
                      placeholder="Aman Sharma"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Username</label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={updateField}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
                      placeholder="aman" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
                      placeholder="aman@email.com"
                    />
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div>
                  <label className="text-xs text-slate-400">Email or username</label>
                  <input
                    name="identifier"
                    value={form.identifier}
                    onChange={updateField}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
                    placeholder="you@email.com"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="••••••••"
                />
              </div>

              {authError && <p className="text-sm text-rose-400">{authError}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </form>

            <button
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="mt-4 w-full text-center text-xs text-slate-400 hover:text-white"
            >
              {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
