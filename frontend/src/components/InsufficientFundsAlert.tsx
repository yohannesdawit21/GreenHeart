import { Link } from 'react-router-dom'
import { DashboardAlert } from './layout/dashboard-ui'
import { btnPrimary } from './layout/buttonStyles'
import { MaterialIcon } from './MaterialIcon'

interface InsufficientFundsAlertProps {
  message?: string
}

export function InsufficientFundsAlert({
  message = 'Insufficient coins — add funds in your wallet before connecting.',
}: InsufficientFundsAlertProps) {
  return (
    <DashboardAlert variant="error" icon="error" title="Not enough coins">
      {message}
      <div className="mt-3">
        <Link to="/wallet" className={`${btnPrimary} text-sm px-4 py-2 inline-flex items-center gap-2`}>
          <MaterialIcon name="account_balance_wallet" className="text-sm" />
          Go to wallet
        </Link>
      </div>
    </DashboardAlert>
  )
}
