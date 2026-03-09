import { create } from 'zustand'
import type { ObituaryFormValues } from '@/hooks/use-create-obituary'

interface ObituaryDraftState {
  draft: ObituaryFormValues | null
  coverGradient: string
  saveDraft: (values: ObituaryFormValues, coverGradient: string) => void
  clearDraft: () => void
}

export const useObituaryDraftStore = create<ObituaryDraftState>((set) => ({
  draft: null,
  coverGradient: 'blue',
  saveDraft: (values, coverGradient) => set({ draft: values, coverGradient }),
  clearDraft: () => set({ draft: null, coverGradient: 'blue' }),
}))
