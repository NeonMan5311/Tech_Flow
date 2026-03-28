import PlaceholderPage from './placeholder/PlaceholderPage'

function GroupsPage() {
  return (
    <PlaceholderPage
      title="Groups Overview"
      description="Create travel, home, or project groups. Each group will show active balances, pending expenses, and quick settle-up shortcuts."
      actions={[{ label: 'Create group' }, { label: 'View all balances' }]}
    />
  )
}

export default GroupsPage