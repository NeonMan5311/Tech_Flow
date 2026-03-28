import { useEffect, useMemo, useState } from 'react'
import AuthModal, { initialForm } from './components/AuthModal'
import DashboardHeader from './components/layout/DashboardHeader'
import MarketingHeader from './components/layout/MarketingHeader'
import DashboardPage from './pages/DashboardPage'
import FriendsPage from './pages/FriendsPage'
import GroupsPage from './pages/GroupsPage'
import LedgerPage from './pages/LedgerPage'
import MarketingLanding from './pages/MarketingLanding'
import ProfilePage from './pages/ProfilePage'

const API_BASE = 'http://localhost:5000/api'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem('splitit_session')
    return stored ? JSON.parse(stored) : null
  })
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [groups, setGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [groupsError, setGroupsError] = useState('')
  const [ledgerRefreshKey, setLedgerRefreshKey] = useState(0)

  const isLoggedIn = Boolean(session?.token)

  const openModal = (nextMode) => {
    setMode(nextMode)
    setForm(initialForm)
    setAuthError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setAuthError('')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login'
      const payload =
        mode === 'signup'
          ? {
              name: form.name,
              username: form.username,
              email: form.email,
              password: form.password,
            }
          : {
              identifier: form.identifier,
              password: form.password,
            }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong.')
      }

      const nextSession = {
        token: data.token,
        user: data.user,
      }

      localStorage.setItem('splitit_session', JSON.stringify(nextSession))
      setSession(nextSession)
      setModalOpen(false)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('splitit_session')
    setSession(null)
  }

  const refreshLedger = () => {
    setLedgerRefreshKey((prev) => prev + 1)
  }

  const greeting = useMemo(() => {
    if (!session?.user) return 'Welcome back'
    return `Welcome back, ${session.user.name}`
  }, [session])

  useEffect(() => {
    const fetchGroups = async () => {
      if (!session?.token) return
      setGroupsLoading(true)
      setGroupsError('')
      try {
        const response = await fetch(`${API_BASE}/groups`, {
          headers: { Authorization: `Bearer ${session.token}` },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load groups')
        }
        setGroups(data.groups || [])
      } catch (error) {
        setGroupsError(error.message)
      } finally {
        setGroupsLoading(false)
      }
    }

    fetchGroups()
  }, [session])

  if (isLoggedIn) {
    const renderActiveTab = () => {
      switch (activeTab) {
        case 'Friends':
          return (
            <FriendsPage
              groups={groups}
              loading={groupsLoading}
              error={groupsError}
              token={session.token}
              session={session}
              ledgerRefreshKey={ledgerRefreshKey}
            />
          )
        case 'Groups':
          return (
            <GroupsPage
              groups={groups}
              setGroups={setGroups}
              loading={groupsLoading}
              error={groupsError}
              token={session.token}
              onLedgerRefresh={refreshLedger}
            />
          )
        case 'Profile':
          return <ProfilePage />
        case 'Ledger':
          return (
            <LedgerPage
              groups={groups}
              loading={groupsLoading}
              error={groupsError}
              token={session.token}
              session={session}
            />
          )
        default:
          return <DashboardPage greeting={greeting} />
      }
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <DashboardHeader onLogout={logout} onSelect={setActiveTab} activeTab={activeTab} />
        {renderActiveTab()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MarketingHeader onOpenModal={openModal} />
      <MarketingLanding />
      <footer className="border-t border-slate-200 px-6 py-10 text-center text-xs text-slate-500">
        Built for honest groups · © 2026 Split It Fair
      </footer>

      {modalOpen ? (
        <AuthModal
          mode={mode}
          form={form}
          onChange={updateField}
          onSubmit={submitAuth}
          onToggleMode={() => setMode(mode === 'signup' ? 'login' : 'signup')}
          onClose={closeModal}
          loading={authLoading}
          error={authError}
        />
      ) : null}
    </div>
  )
}

export default App