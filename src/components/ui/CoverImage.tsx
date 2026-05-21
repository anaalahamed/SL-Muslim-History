import Image from 'next/image'

// Category → gradient + icon for placeholder
const categoryStyle: Record<string, { bg: string; icon: string }> = {
  'Early History':        { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', icon: '📜' },
  'Mosques & Places':     { bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', icon: '🕌' },
  'Culture & Traditions': { bg: 'linear-gradient(135deg, #fef9c3, #fde68a)', icon: '🎨' },
  'Notable Figures':      { bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', icon: '👑' },
  'Literature & Arts':    { bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)', icon: '📖' },
  'Community & Society':  { bg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', icon: '🤝' },
  // News categories
  'Community':  { bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', icon: '🤝' },
  'Heritage':   { bg: 'linear-gradient(135deg, #fef9c3, #fde68a)', icon: '🏛️' },
  'Education':  { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', icon: '📚' },
  'Literature': { bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', icon: '📖' },
  'Events':     { bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)', icon: '🎭' },
  'General':    { bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', icon: '📰' },
}

const fallback = { bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', icon: '🕌' }

interface Props {
  src: string
  alt: string
  category?: string
  className?: string
  style?: React.CSSProperties
  iconSize?: string   // e.g. 'text-5xl'
  fit?: 'cover' | 'contain'
}

export default function CoverImage({ src, alt, category, className = '', style = {}, iconSize = 'text-5xl', fit = 'cover' }: Props) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ background: fit === 'contain' ? '#f8fafc' : undefined, ...style }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={fit === 'contain' ? 'object-contain' : 'object-cover'}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    )
  }

  const cat = category ? (categoryStyle[category] ?? fallback) : fallback

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: cat.bg, ...style }}
    >
      <span className={iconSize}>{cat.icon}</span>
    </div>
  )
}
