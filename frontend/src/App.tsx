import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/router'
import { useAuthListener } from '@/hooks/use-auth'
import { useThemeStore } from '@/store/themeStore'

function AuthInitializer() {
  useAuthListener()
  return null
}

function ThemeInitializer() {
  const init = useThemeStore((s) => s.init)
  useEffect(() => { init() }, [init])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <ThemeInitializer />
      <AppRouter />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
