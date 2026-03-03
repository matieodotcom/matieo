import { render, screen } from '../utils'
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

  it('renders cover image when cover_url is present', () => {
    render(
      <MemorialCard memorial={mockMemorial({ cover_url: 'https://example.com/photo.jpg' })} />,
    )
    // Image is inside an aria-hidden decorative link; use getByAltText
    const img = screen.getByAltText('John Doe')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders initials placeholder when no cover_url', () => {
    render(<MemorialCard memorial={mockMemorial({ cover_url: null })} />)
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

  it('renders "View Memorial" link with correct href', () => {
    render(<MemorialCard memorial={mockMemorial({ slug: 'john-doe-2024' })} />)
    const link = screen.getByRole('link', { name: /view memorial/i })
    expect(link).toHaveAttribute('href', '/memorial/john-doe-2024')
  })
})
