import { marked } from 'marked'
import { useEffect, useState } from 'react'
import slugify from 'slugify'

const renderer = new marked.Renderer()
renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens, this.parser.textRenderer)
  const slug = slugify(text, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })
  return `<h${depth} id="${slug}">${this.parser.parseInline(tokens)}</h${depth}>`
}

marked.setOptions({
  renderer
})

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
