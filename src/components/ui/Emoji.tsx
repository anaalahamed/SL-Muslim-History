/**
 * Cross-platform emoji renderer using Twemoji SVG assets (pinned v14.0.2).
 * Renders identical emojis on Windows, Android, iPhone, Mac, and Linux.
 * Falls back to native system emoji if the CDN image fails to load.
 */

const BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg'

// Pre-mapped codepoints for emojis used on this site
const CODEPOINTS: Record<string, string> = {
  '👍': '1f44d', '❤️': '2764-fe0f', '🥰': '1f970', '😍': '1f60d',
  '😡': '1f621', '💯': '1f4af', '👏': '1f44f',
  '📜': '1f4dc', '🕌': '1f54c', '🎨': '1f3a8', '👑': '1f451',
  '📖': '1f4d6', '🤝': '1f91d', '💬': '1f4ac', '⭐': '2b50',
  '📰': '1f4f0', '📝': '1f4dd', '🗂️': '1f5c2-fe0f', '✍️': '270d-fe0f',
  '✉️': '2709-fe0f', '🏠': '1f3e0', '📢': '1f4e2', '📬': '1f4ec',
  '⚙️': '2699-fe0f', '📊': '1f4ca',
}

function getCodepoint(emoji: string): string {
  return [...emoji]
    .map((c) => (c.codePointAt(0) ?? 0).toString(16))
    .filter((cp) => parseInt(cp, 16) !== 0xfe0f)
    .join('-')
    .replace(/-$/, '')
}

interface EmojiProps {
  emoji: string
  size?: number
  label?: string
  className?: string
  style?: React.CSSProperties
}

export default function Emoji({ emoji, size = 20, label, className, style }: EmojiProps) {
  const code = CODEPOINTS[emoji] ?? getCodepoint(emoji)
  const src  = `${BASE}/${code}.svg`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label ?? emoji}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      draggable={false}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement
        el.style.display = 'none'
        const span = document.createElement('span')
        span.textContent = emoji
        el.parentNode?.insertBefore(span, el)
      }}
    />
  )
}
