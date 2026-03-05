import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('calls window.scrollTo on mount', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ScrollToTop />}>
            <Route path="/" element={<div>Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })
})
