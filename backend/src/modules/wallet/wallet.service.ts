/** Role B — atomic escrow via Postgres transaction (M3) */
export async function lockEscrow(_clientId: string, _amount: number): Promise<boolean> {
  throw new Error('lockEscrow not implemented — M3');
}

export async function releaseEscrow(_clientId: string, _amount: number): Promise<void> {
  throw new Error('releaseEscrow not implemented — M3');
}

export async function refundEscrow(_clientId: string, _amount: number): Promise<void> {
  throw new Error('refundEscrow not implemented — M3');
}
