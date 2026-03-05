import { render, screen } from '../utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemorialCard } from '@/components/memorial/MemorialCard'
import { mockMemorial } from '../utils'

describe('MemorialCard', () => {
  it('renders the full_name', () => {
    render(<MemorialCard memorial={mockMemorial()} />)
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
  })

  it('renders formatted date range', () => {
    render(<MemorialCard memorial={mockMemorial()} />)
    // Dates: 15 Mar 1945 · 10 Jan 2024
    expect(screen.getByText(/1945/)).toBeInTheDocument()
    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  it('renders location when present', () => {
    render(<MemorialCard memorial={mockMemorial({ location: 'Kuala Lumpur, Malaysia' })} />)
    expect(screen.getByText('Kuala Lumpur, Malaysia')).toBeInTheDocument()
  })

  it('does not render location row when location is null', () => {
    render(<MemorialCard memorial={mockMemorial({ location: null })} />)
    expect(screen.queryByText(/Kuala Lumpur/)).not.toBeInTheDocument()
  })

  it('renders profile image when profile_url is present', () => {
    render(
      <MemorialCard memorial={mockMemorial({ profile_url: 'https://example.com/photo.jpg' })} />,
    )
    // Image is inside an aria-hidden decorative link; use getByAltText
    const img = screen.getByAltText('John Doe')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders initials placeholder when no profile_url', () => {
    render(<MemorialCard memorial={mockMemorial({ profile_url: null })} />)
    // "JD" initials for "John Doe"
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders "Draft" status badge for draft memorials', () => {
    render(<MemorialCard memorial={mockMemorial({ status: 'draft' })} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders "Published" status badge for published memorials', () => {
    render(<MemorialCard memorial={mockMemorial({ status: 'published' })} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders "View Memorial" link with correct href for published memorial', () => {
    render(<MemorialCard memorial={mockMemorial({ slug: 'john-doe-2024', status: 'published' })} />)
    const link = screen.getByRole('link', { name: /view memorial/i })
    expect(link).toHaveAttribute('href', '/memorial/john-doe-2024')
  })

  it('renders "Continue Editing" link pointing to edit page for draft memorial', () => {
    render(<MemorialCard memorial={mockMemorial({ status: 'draft' })} />)
    const link = screen.getByRole('link', { name: /continue editing/i })
    expect(link).toHaveAttribute('href', '/dashboard/memorials/memorial-id-123/edit')
  })

  it('renders options menu button for draft memorial when onDelete provided', () => {
    render(<MemorialCard memorial={mockMemorial({ status: 'draft' })} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /memorial options/i })).toBeInTheDocument()
  })

  it('does not render options menu for published memorial', () => {
    render(<MemorialCard memorial={mockMemorial({ status: 'published' })} onDelete={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /memorial options/i })).not.toBeInTheDocument()
  })

  it('does not render options menu when onDelete is not provided', () => {
    render(<MemorialCard memorial={mockMemorial({ status: 'draft' })} />)
    expect(screen.queryByRole('button', { name: /memorial options/i })).not.toBeInTheDocument()
  })

  it('calls onDelete with correct id when "Delete Draft" clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<MemorialCard memorial={mockMemorial({ status: 'draft' })} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /memorial options/i }))
    await user.click(screen.getByText('Delete Draft'))

    expect(onDelete).toHaveBeenCalledWith('memorial-id-123')
  })
})
