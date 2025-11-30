import { render, screen } from '@testing-library/react'
import BlogList from '../../src/components/BlogList.jsx'
import { MemoryRouter } from 'react-router-dom'

const sampleBlogs = [
  {
    _id: '1',
    title: 'First blog',
    content: 'This is a long enough content snippet for preview.',
    likes: [],
    commentCount: 0,
    images: [],
    coverImageIndex: 0,
    createdBy: { username: 'user1' },
    createdAt: new Date().toISOString(),
  },
]

describe('BlogList', () => {
  test('renders blog title from list', () => {
    render(
      <MemoryRouter>
        <BlogList blogs={sampleBlogs} />
      </MemoryRouter>
    )

    expect(screen.getByText('First blog')).toBeInTheDocument()
  })
})
