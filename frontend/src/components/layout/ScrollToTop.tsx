import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return <Outlet />
}
