import PlaceholderPage from './placeholder/PlaceholderPage'

function FriendsPage() {
  return (
    <PlaceholderPage
      title="Friends & Contacts"
      description="Track frequent collaborators, add roommates, and tag who to split with faster. This space will surface recent payments and quick reminders."
      actions={[{ label: 'Invite friend' }, { label: 'Import contacts' }]}
    />
  )
}

export default FriendsPage