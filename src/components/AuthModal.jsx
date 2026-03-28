const initialForm = {
  name: '',
  username: '',
  email: '',
  identifier: '',
  password: '',
}

function AuthModal({ mode, form, onChange, onSubmit, onToggleMode, onClose, loading, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              {mode === 'signup' ? 'Sign up' : 'Log in'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {mode === 'signup'
                ? 'Start tracking group expenses in minutes.'
                : 'Log in to view your balances and settlements.'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs text-slate-500">Full name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                  placeholder="Aman Sharma"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                  placeholder="aman"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                  placeholder="aman@email.com"
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div>
              <label className="text-xs text-slate-500">Email or username</label>
              <input
                name="identifier"
                value={form.identifier}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                placeholder="you@email.com"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-500">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <button
          onClick={onToggleMode}
          className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-700"
        >
          {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}

export { initialForm }
export default AuthModal