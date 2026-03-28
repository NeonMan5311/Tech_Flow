import { useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api'

function GroupFormModal({ token, onClose, onCreated }) {
  const [groupName, setGroupName] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [forexBase, setForexBase] = useState('USD')
  const [forexTarget, setForexTarget] = useState('INR')
  const [forexRate, setForexRate] = useState(null)
  const [forexLoading, setForexLoading] = useState(false)
  const [forexError, setForexError] = useState('')

  const selectedIds = useMemo(() => new Set(selected.map((user) => user._id)), [selected])

  const searchUsers = async () => {
    if (!query.trim()) return
    setSearchLoading(true)
    setSearchError('')
    try {
      const response = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Search failed')
      }
      setResults(data.users || [])
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setSearchLoading(false)
    }
  }

  const toggleUser = (user) => {
    setSelected((prev) => {
      if (prev.find((item) => item._id === user._id)) {
        return prev.filter((item) => item._id !== user._id)
      }
      return [...prev, user]
    })
  }

  const fetchForexRate = async () => {
    setForexLoading(true)
    setForexError('')
    try {
      const response = await fetch(
        `${API_BASE}/forex/rate?base=${encodeURIComponent(forexBase)}&target=${encodeURIComponent(forexTarget)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Forex lookup failed')
      }
      setForexRate(data.rate)
    } catch (error) {
      setForexError(error.message)
    } finally {
      setForexLoading(false)
    }
  }

  const submitGroup = async (event) => {
    event.preventDefault()
    setSubmitLoading(true)
    setSubmitError('')
    try {
      const response = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          memberIds: selected.map((user) => user._id),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create group')
      }
      onCreated(data.group)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Create group</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Set up a new group</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add members by username, set a display name, and preview the exchange rate used for expenses.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form onSubmit={submitGroup} className="mt-6 grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
              <label className="text-xs text-slate-500">Group name</label>
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                placeholder="Goa Trip · March"
              />
            </div>

              <div>
              <label className="text-xs text-slate-500">Search members</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                  placeholder="Search by name, username, or email"
                />
                <button
                  type="button"
                  onClick={searchUsers}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                >
                  {searchLoading ? 'Searching…' : 'Search'}
                </button>
              </div>
              {searchError ? <p className="mt-2 text-xs text-rose-400">{searchError}</p> : null}
              <div className="mt-3 grid gap-2">
                {results.map((user) => {
                  const isSelected = selectedIds.has(user._id)
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleUser(user)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        isSelected
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>
                        <span className="font-semibold text-slate-900">{user.name}</span>
                        <span className="ml-2 text-xs text-slate-500">@{user.username}</span>
                      </span>
                      <span className="text-xs text-slate-500">{isSelected ? 'Added' : 'Add'}</span>
                    </button>
                  )
                })}
                {!results.length && query ? (
                  <p className="text-xs text-slate-500">No matching users yet.</p>
                ) : null}
              </div>
            </div>

              <div>
              <p className="text-xs text-slate-500">Selected members</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.length ? (
                  selected.map((user) => (
                    <span key={user._id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      {user.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No members added yet.</span>
                )}
              </div>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Forex preview</h3>
              <p className="text-xs text-slate-500">Use ExchangeRate-API to lock currency rates when logging expenses.</p>
              <div className="grid gap-2">
                <label className="text-xs text-slate-500">Base currency</label>
                <input
                  value={forexBase}
                  onChange={(event) => setForexBase(event.target.value.toUpperCase())}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="USD"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-500">Target currency</label>
                <input
                  value={forexTarget}
                  onChange={(event) => setForexTarget(event.target.value.toUpperCase())}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="INR"
                />
              </div>
              <button
                type="button"
                onClick={fetchForexRate}
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                {forexLoading ? 'Fetching rate…' : 'Get rate'}
              </button>
              {forexRate ? (
                <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-xs text-blue-700">
                  1 {forexBase.toUpperCase()} = {forexRate} {forexTarget.toUpperCase()}
                </div>
              ) : null}
              {forexError ? <p className="text-xs text-rose-400">{forexError}</p> : null}
            </div>
          </div>

          {submitError ? <p className="text-sm text-rose-400">{submitError}</p> : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GroupFormModal