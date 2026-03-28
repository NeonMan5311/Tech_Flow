import PlaceholderPage from './placeholder/PlaceholderPage'

function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile & Preferences"
      description="Manage your personal details, default currency, and notification preferences. You'll also see your lifetime stats here."
      actions={[{ label: 'Edit profile' }, { label: 'Notification settings' }]}
    />
  )
}

export default ProfilePage