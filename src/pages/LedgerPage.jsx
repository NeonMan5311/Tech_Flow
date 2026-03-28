import PlaceholderPage from './placeholder/PlaceholderPage'

function LedgerPage() {
  return (
    <PlaceholderPage
      title="Ledger & Settlements"
      description="This view will list simplified debts, payment history, and allow partial settlements. Visualize who owes whom at a glance."
      actions={[{ label: 'Simplify debts' }, { label: 'Export ledger' }]}
    />
  )
}

export default LedgerPage