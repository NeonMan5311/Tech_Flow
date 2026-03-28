function PlaceholderPage({ title, description, actions }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-12 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Coming soon</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">{description}</p>
        {actions ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default PlaceholderPage