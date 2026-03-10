import './lib/i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useLocaleStore } from './store/localeStore'

// Rehydrate locale so dir/lang attrs are applied on boot
const { locale, setLocale } = useLocaleStore.getState()
setLocale(locale)

const root = document.getElementById('root')
if (!root) throw new Error('#root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
