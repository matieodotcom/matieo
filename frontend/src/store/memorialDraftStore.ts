import { create } from 'zustand'
import type { MemorialFormValues } from '@/hooks/use-create-memorial'

interface MemorialDraftState {
  draft: MemorialFormValues | null
  saveDraft: (values: MemorialFormValues) => void
  clearDraft: () => void
}

export const useMemorialDraftStore = create<MemorialDraftState>((set) => ({
  draft: null,
  saveDraft: (values) => set({ draft: values }),
  clearDraft: () => set({ draft: null }),
}))
