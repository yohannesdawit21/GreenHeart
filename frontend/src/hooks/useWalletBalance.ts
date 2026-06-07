import { useCallback, useEffect, useState } from 'react'
import { walletService } from '../api/wallet.service'
import { getApiErrorMessage } from '../utils/apiError'
import type { WalletBalance } from '@shared/contracts/wallet.api'

export function useWalletBalance(enabled = true) {
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!enabled) {
      setBalance(null)
      setLoading(false)
      setError('')
      return null
    }

    setLoading(true)
    setError('')
    try {
      const data = await walletService.getBalance()
      setBalance(data.wallet)
      return data.wallet
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load wallet balance'))
      setBalance(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { balance, loading, error, refresh }
}
