import BrandMark from '../BrandMark'

const navItems = ['Dashboard', 'Groups', 'Friends', 'Ledger', 'Profile']

function DashboardHeader({ onLogout, onSelect, activeTab }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
      <BrandMark subtitle="Dashboard" />
      <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-300">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`rounded-full border px-3 py-1 transition ${
              activeTab === item
                ? 'border-emerald-400 text-emerald-200'
                : 'border-transparent hover:border-slate-700 hover:text-white'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-400"
      >
        Log out
      </button>
    </header>
  )
}

export default DashboardHeader