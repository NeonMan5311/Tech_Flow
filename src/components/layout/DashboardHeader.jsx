import BrandMark from '../BrandMark'

const navItems = ['Dashboard', 'Groups', 'Friends', 'Ledger', 'Profile']

function DashboardHeader({ onLogout, onSelect, activeTab }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <BrandMark subtitle="Hackathon Console" />

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={`rounded-full px-4 py-2 font-medium transition ${
                activeTab === item
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.45)]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-200 transition hover:border-fuchsia-300 hover:bg-fuchsia-500/20"
        >
          Log out
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
