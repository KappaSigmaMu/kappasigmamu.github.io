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

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
}

export { MarkdownRenderer }
