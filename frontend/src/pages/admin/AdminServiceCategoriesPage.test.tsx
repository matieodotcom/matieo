import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'

// Mock hooks
vi.mock('@/hooks/use-admin', () => ({
  useAdminServiceCategories: vi.fn(),
  useAdminCreateServiceCategory: vi.fn(),
  useAdminUpdateServiceCategory: vi.fn(),
  useAdminDeleteServiceCategory: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({ toast: vi.fn() }))

import {
  useAdminServiceCategories,
  useAdminCreateServiceCategory,
  useAdminUpdateServiceCategory,
  useAdminDeleteServiceCategory,
} from '@/hooks/use-admin'

import AdminServiceCategoriesPage from './AdminServiceCategoriesPage'

const mockMutate = vi.fn()

function makeWrapper() {
  const qc = new QueryClient()
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAdminServiceCategories).mockReturnValue({
    data: {
      data: {
        items: [
          { id: 'c1', name: 'Florists', slug: 'florists', description: 'Flowers', is_active: true, sort_order: 1, created_at: '2026-01-01', icon: null, image_cloudinary_public_id: null, image_url: null },
        ],
        total: 1, page: 1, limit: 20,
      },
    },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useAdminServiceCategories>)

  vi.mocked(useAdminCreateServiceCategory).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useAdminCreateServiceCategory>)
  vi.mocked(useAdminUpdateServiceCategory).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useAdminUpdateServiceCategory>)
  vi.mocked(useAdminDeleteServiceCategory).mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useAdminDeleteServiceCategory>)
})

describe('AdminServiceCategoriesPage', () => {
  it('renders the category list', () => {
    render(createElement(AdminServiceCategoriesPage), { wrapper: makeWrapper() })
    expect(screen.getByText('Florists')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading', () => {
    vi.mocked(useAdminServiceCategories).mockReturnValue({
      data: undefined, isLoading: true, error: null,
    } as ReturnType<typeof useAdminServiceCategories>)
    const { container } = render(createElement(AdminServiceCategoriesPage), { wrapper: makeWrapper() })
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('opens add dialog when Add Category is clicked', () => {
    render(createElement(AdminServiceCategoriesPage), { wrapper: makeWrapper() })
    fireEvent.click(screen.getByRole('button', { name: /add category/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens delete dialog when trash icon is clicked', () => {
    render(createElement(AdminServiceCategoriesPage), { wrapper: makeWrapper() })
    fireEvent.click(screen.getByLabelText(/delete category/i))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    vi.mocked(useAdminServiceCategories).mockReturnValue({
      data: { data: { items: [], total: 0, page: 1, limit: 20 } },
      isLoading: false, error: null,
    } as ReturnType<typeof useAdminServiceCategories>)
    render(createElement(AdminServiceCategoriesPage), { wrapper: makeWrapper() })
    expect(screen.getByText(/no service categories/i)).toBeInTheDocument()
  })
})
