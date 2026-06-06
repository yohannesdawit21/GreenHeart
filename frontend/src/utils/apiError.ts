/** Parse backend `{ error: { code, message } }` from axios failures. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { error?: { message?: string }; message?: string } } }).response?.data
    if (data?.error?.message) return data.error.message
    if (data?.message) return data.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function getApiErrorCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { error?: { code?: string } } } }).response?.data
    return data?.error?.code
  }
  return undefined
}
