import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/router'
import { useAuthListener } from '@/hooks/use-auth'

function AuthInitializer() {
  useAuthListener()
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <AppRouter />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
