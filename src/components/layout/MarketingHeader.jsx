import BrandMark from '../BrandMark'

function MarketingHeader({ onOpenModal }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <BrandMark subtitle="Fair splits for messy real life" />
        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <a className="hover:text-cyan-300" href="#features">Features</a>
          <a className="hover:text-cyan-300" href="#workflow">Workflow</a>
          <a className="hover:text-cyan-300" href="#judge">Why judges like this</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenModal('login')}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Log in
          </button>
          <button
            onClick={() => onOpenModal('signup')}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            Start free
          </button>
        </div>
      </div>
    </header>
  )
}

export default MarketingHeader
