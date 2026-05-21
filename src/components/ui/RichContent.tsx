import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
}

export default function RichContent({ content }: Props) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="tamil-heading font-extrabold text-2xl mt-10 mb-3" style={{ color: 'var(--green-dark)', lineHeight: 1.4 }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="tamil-heading font-extrabold text-xl mt-8 mb-2" style={{ color: 'var(--green-dark)', lineHeight: 1.4 }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="tamil-heading font-bold text-lg mt-6 mb-2" style={{ color: 'var(--dark)', lineHeight: 1.4 }}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="tamil-text mb-5" style={{ color: 'var(--text)', lineHeight: '2', fontSize: '1rem' }}>
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold" style={{ color: 'var(--dark)' }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em style={{ color: 'var(--text)', fontStyle: 'italic' }}>{children}</em>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1.5 mb-5 pl-5" style={{ listStyleType: 'disc', color: 'var(--text)' }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-1.5 mb-5 pl-5" style={{ listStyleType: 'decimal', color: 'var(--text)' }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="tamil-text" style={{ lineHeight: '1.85', fontSize: '1rem' }}>
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="my-6 pl-5 py-1"
            style={{
              borderLeft: '4px solid var(--gold)',
              background: 'var(--green-light)',
              borderRadius: '0 12px 12px 0',
              padding: '16px 20px',
              color: 'var(--dark)',
              fontStyle: 'italic',
            }}
          >
            {children}
          </blockquote>
        ),
        hr: () => (
          <hr className="my-8" style={{ border: 'none', borderTop: '2px solid var(--border)' }} />
        ),
        img: ({ src, alt }) => (
          <span className="block my-6 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt ?? ''} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            {alt && (
              <span className="block text-xs text-center py-2" style={{ color: 'var(--muted)', background: 'var(--bg)' }}>
                {alt}
              </span>
            )}
          </span>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
