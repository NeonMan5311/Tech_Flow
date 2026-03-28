function LedgerPage({ groups, loading, error }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Ledger</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Group balances</h1>
        <p className="mt-2 text-sm text-slate-400">
          See which groups are active and prepare to settle up. Member additions update automatically.
        </p>
      </section>

      <section className="mt-6 grid gap-4">
        {loading ? <p className="text-sm text-slate-400">Loading balances…</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-lg font-semibold text-white">{group.name}</p>
              <p className="text-xs text-slate-500">Members: {group.members?.length || 0}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.members?.map((member) => (
                  <span key={member._id} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                    {member.name}
                  </span>
                ))}
              </div>
              <button className="mt-4 rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-100 transition hover:border-slate-400">
                Simplify debts
              </button>
            </div>
          ))}
        </div>
        {!groups.length && !loading ? (
          <p className="text-sm text-slate-400">No groups yet. Create one to start tracking balances.</p>
        ) : null}
      </section>
    </main>
  )
}

export default LedgerPage