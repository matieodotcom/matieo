/**
 * frontend/src/hooks/use-waitlist.ts
 * TanStack Query mutation for waitlist subscription.
 */
import { useMutation } from '@tanstack/react-query'

interface WaitlistPayload {
  name: string
  email: string
}

async function postWaitlist(payload: WaitlistPayload): Promise<void> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let errorMessage = 'Something went wrong. Please try again.'
    try {
      const body = await res.json() as { error?: string }
      if (body.error) errorMessage = body.error
    } catch {
      // use fallback
    }
    throw new Error(errorMessage)
  }
}

export function useWaitlist() {
  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: postWaitlist,
  })

  return {
    submit: mutate,
    isPending,
    isSuccess,
    isError,
    errorMessage: isError && error instanceof Error ? error.message : null,
  }
}
