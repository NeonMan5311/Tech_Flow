import BrandMark from '../BrandMark'

function MarketingHeader({ onOpenModal }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <BrandMark subtitle="Simplify shared expenses" />
      <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
        <a className="hover:text-blue-600" href="#features">Features</a>
        <a className="hover:text-blue-600" href="#workflow">Workflow</a>
        <a className="hover:text-blue-600" href="#pricing">Pricing</a>
      </nav>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onOpenModal('login')}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          Log in
        </button>
        <button
          onClick={() => onOpenModal('signup')}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          Sign up
        </button>
      </div>
    </header>
  )
}

export default MarketingHeader