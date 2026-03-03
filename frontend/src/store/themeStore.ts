import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
  init: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDark: false,

  toggle: () => {
    const next = !get().isDark
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
    set({ isDark: next })
  },

  init: () => {
    let isDark = false
    try {
      const stored = localStorage.getItem('theme')
      if (stored) {
        isDark = stored === 'dark'
      }
    } catch {}
    set({ isDark })
  },
}))
