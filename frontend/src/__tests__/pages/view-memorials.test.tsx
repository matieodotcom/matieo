import { render, screen, fireEvent } from '../utils'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { mockMemorial, mockUser } from '../utils'

vi.mock('@/hooks/use-memorials', () => ({
  useMemorials: vi.fn(),
}))

vi.mock('@/components/auth/SignInModal', () => ({
  SignInModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="sign-in-modal" /> : null,
}))

async function getPage() {
  const { default: ViewMemorialsPage } = await import('@/pages/app/ViewMemorialsPage')
  return ViewMemorialsPage
}

const baseResponse = {
  data: [mockMemorial({ full_name: 'Ahmad Bin Hassan', location: 'Kuala Lumpur, Malaysia' })],
  total: 1,
  page: 1,
  limit: 12,
  error: null,
}

describe('ViewMemorialsPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: mockUser(), session: null, isLoading: false })

    const { useMemorials } = await import('@/hooks/use-memorials')
    vi.mocked(useMemorials).mockReturnValue({
      data: baseResponse,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
      placeholderData: undefined,
    } as ReturnType<typeof useMemorials>)
  })

  it('renders page heading "Memorials"', async () => {
    const Page = await getPage()
    render(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: 'Memorials' })).toBeInTheDocument()
  })

  it('renders search input', async () => {
    const Page = await getPage()
    render(<Page />)
    expect(screen.getByRole('searchbox', { name: /search memorials/i })).toBeInTheDocument()
  })

  it('shows "Create Memorial" button when authenticated', async () => {
    const Page = await getPage()
    render(<Page />)
    expect(screen.getByRole('button', { name: /create memorial/i })).toBeInTheDocument()
  })

  it('shows "Create Memorial" button when not authenticated', async () => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    const Page = await getPage()
    render(<Page />)
    expect(screen.getByRole('button', { name: /create memorial/i })).toBeInTheDocument()
  })

  it('opens sign-in modal when Create Memorial clicked while not authenticated', async () => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    const Page = await getPage()
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /create memorial/i }))
    expect(screen.getByTestId('sign-in-modal')).toBeInTheDocument()
  })

  it('renders memorial cards when data is loaded', async () => {
    const Page = await getPage()
    render(<Page />)
    expect(screen.getAllByText('Ahmad Bin Hassan').length).toBeGreaterThan(0)
  })

  it('renders skeleton cards while loading', async () => {
    const { useMemorials } = await import('@/hooks/use-memorials')
    vi.mocked(useMemorials).mockReturnValue({
      data: undefined,
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMemorials>)

    const Page = await getPage()
    const { container } = render(<Page />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no memorials exist', async () => {
    const { useMemorials } = await import('@/hooks/use-memorials')
    vi.mocked(useMemorials).mockReturnValue({
      data: { ...baseResponse, data: [], total: 0 },
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useMemorials>)

    const Page = await getPage()
    render(<Page />)
    expect(screen.getByText(/no memorials yet/i)).toBeInTheDocument()
  })

  it('renders empty search state when search yields no results', async () => {
    const { useMemorials } = await import('@/hooks/use-memorials')
    vi.mocked(useMemorials).mockReturnValue({
      data: { ...baseResponse, data: [], total: 0 },
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useMemorials>)

    const Page = await getPage()
    render(<Page />, { initialRoute: '/memorials?q=xyz' })
    expect(screen.getByText(/no memorials match/i)).toBeInTheDocument()
  })

  it('renders error message when fetch fails', async () => {
    const { useMemorials } = await import('@/hooks/use-memorials')
    vi.mocked(useMemorials).mockReturnValue({
      data: undefined,
      isPending: false,
      isSuccess: false,
      isError: true,
      error: new Error('Network error'),
    } as ReturnType<typeof useMemorials>)

    const Page = await getPage()
    render(<Page />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders pagination when totalPages > 1', async () => {
    const { useMemorials } = await import('@/hooks/use-memorials')
    vi.mocked(useMemorials).mockReturnValue({
      data: { ...baseResponse, total: 25, page: 1 },
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useMemorials>)

    const Page = await getPage()
    render(<Page />)
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
  })

  it('updates search input on typing', async () => {
    const Page = await getPage()
    render(<Page />)
    const input = screen.getByRole('searchbox', { name: /search memorials/i })
    fireEvent.change(input, { target: { value: 'Ahmad' } })
    expect(input).toHaveValue('Ahmad')
  })

  it('renders page for unauthenticated visitors without redirecting', async () => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    const Page = await getPage()
    render(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: 'Memorials' })).toBeInTheDocument()
  })
})
