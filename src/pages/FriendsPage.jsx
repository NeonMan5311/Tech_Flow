function FriendsPage({ groups, loading, error }) {
  const members = groups.flatMap((group) => group.members || [])
  const unique = Array.from(new Map(members.map((m) => [m._id, m])).values())

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Friends</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">People you split with</h1>
        <p className="mt-2 text-sm text-slate-400">
          Members added to your groups appear here for quick access and reminders.
        </p>
      </section>

      <section className="mt-6 grid gap-4">
        {loading ? <p className="text-sm text-slate-400">Loading members…</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {unique.map((member) => (
            <div key={member._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-lg font-semibold text-white">{member.name}</p>
              <p className="text-xs text-slate-500">@{member.username}</p>
              <p className="mt-3 text-xs text-slate-400">{member.email || 'No email on file'}</p>
            </div>
          ))}
        </div>

        {!unique.length && !loading ? (
          <p className="text-sm text-slate-400">No group members yet. Create a group to see them here.</p>
        ) : null}
      </section>
    </main>
  )
}

export default FriendsPage