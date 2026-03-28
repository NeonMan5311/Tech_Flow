import { useState } from 'react'
import GroupFormModal from '../components/groups/GroupFormModal'

function GroupsPage({ groups, setGroups, loading, error, token }) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleCreated = (group) => {
    setGroups((prev) => [group, ...prev])
    setModalOpen(false)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Groups</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Your expense groups</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Organize trips, homes, or projects. Add members, track shared expenses, and keep everyone in sync.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-400"
        >
          + New group
        </button>
      </section>

      <section className="mt-8 grid gap-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading your groups…</p>
        ) : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{group.name}</p>
                  <p className="text-xs text-slate-500">{group.members?.length || 0} members</p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-[10px] uppercase text-slate-400">
                  Active
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.members?.map((member) => (
                  <span key={member._id} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                    {member.name}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <button className="rounded-full border border-slate-700 px-4 py-2 text-slate-100 transition hover:border-slate-400">
                  View expenses
                </button>
                <button className="rounded-full border border-emerald-500/60 px-4 py-2 text-emerald-200 transition hover:border-emerald-400">
                  Add expense
                </button>
              </div>
            </div>
          ))}
        </div>

        {!groups.length && !loading ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
            <p className="text-sm text-slate-300">No groups yet. Create your first one to start splitting.</p>
          </div>
        ) : null}
      </section>

      {modalOpen ? (
        <GroupFormModal token={token} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      ) : null}
    </main>
  )
}

export default GroupsPage