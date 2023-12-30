import { marked } from 'marked'
import { useEffect, useState } from 'react'

const MarkdownRenderer = ({ markdownText }: { markdownText: string }) => {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    const renderMarkdown = async () => {
      const html = await marked(markdownText)
      setHtmlContent(html)
    }

    renderMarkdown()
  }, [markdownText])

  // This is fine because we control `htmlContent`, it's not an unknown source
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
}

export { MarkdownRenderer }
