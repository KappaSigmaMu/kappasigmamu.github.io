import { render, screen } from '@testing-library/react'
import { WikiPage } from '../WikiPage'

jest.mock('../../components/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ markdownText }: { markdownText: string }) => <div>{markdownText}</div>
}))

const wikiMarkdown = `
- [Introduction](#introduction)
- [FAQ](#faq)

# Introduction

Wiki introduction.

# FAQ

<details>
<summary><b>How can I join?</b></summary>
Read the guide.
</details>
`

describe('WikiPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(wikiMarkdown)
    }) as jest.MockedFunction<typeof fetch>
  })

  it('loads the Wiki markdown into the responsive article layout', async () => {
    const { container } = render(<WikiPage />)

    expect(screen.getByRole('heading', { name: 'Wiki' })).toBeInTheDocument()
    expect(container.querySelector('img[aria-hidden="true"]')).toBeInTheDocument()
    expect(await screen.findByText(/Wiki introduction/)).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('/wiki/Cyborg-Guide.md')
  })
})
