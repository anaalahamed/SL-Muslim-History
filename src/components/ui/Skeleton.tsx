interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
  rounded?: string
}

export function Skeleton({ className = '', style, rounded = 'rounded-xl' }: SkeletonProps) {
  return (
    <div
      className={`${rounded} ${className}`}
      style={{
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

// Article card skeleton — matches the FeaturedArticles card layout
export function ArticleCardSkeleton() {
  return (
    <div
      className="flex flex-col sm:flex-row rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e2e8f0', background: 'white' }}
    >
      <Skeleton
        className="w-full sm:w-56 md:w-64 flex-shrink-0"
        style={{ aspectRatio: '16/9', borderRadius: 0 }}
        rounded=""
      />
      <div className="p-5 md:p-6 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton style={{ width: '90px', height: '24px' }} />
          <Skeleton style={{ width: '120px', height: '16px' }} />
        </div>
        <Skeleton style={{ width: '85%', height: '22px' }} />
        <Skeleton style={{ width: '60%', height: '22px' }} />
        <Skeleton style={{ width: '100%', height: '14px' }} />
        <Skeleton style={{ width: '90%', height: '14px' }} />
        <Skeleton style={{ width: '70%', height: '14px' }} />
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div className="flex items-center gap-2">
            <Skeleton style={{ width: '28px', height: '28px', borderRadius: '50%' }} rounded="" />
            <Skeleton style={{ width: '80px', height: '14px' }} />
          </div>
          <Skeleton style={{ width: '90px', height: '30px' }} />
        </div>
      </div>
    </div>
  )
}

// News list item skeleton
export function NewsItemSkeleton() {
  return (
    <div
      className="flex gap-4 p-4 rounded-xl"
      style={{ background: 'white', border: '1px solid #e2e8f0' }}
    >
      <Skeleton style={{ width: '32px', height: '32px', flexShrink: 0 }} />
      <div className="flex-1 space-y-2">
        <Skeleton style={{ width: '100%', height: '14px' }} />
        <Skeleton style={{ width: '75%', height: '14px' }} />
        <Skeleton style={{ width: '80px', height: '12px' }} />
      </div>
    </div>
  )
}

// Article listing card skeleton
export function ArticleListSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
    >
      <div className="flex gap-4 p-5 md:p-6">
        <Skeleton style={{ width: '48px', height: '36px', flexShrink: 0 }} />
        <div className="flex-1 space-y-2.5">
          <div className="flex gap-2">
            <Skeleton style={{ width: '80px', height: '20px' }} />
            <Skeleton style={{ width: '100px', height: '20px' }} />
          </div>
          <Skeleton style={{ width: '90%', height: '22px' }} />
          <Skeleton style={{ width: '65%', height: '22px' }} />
          <Skeleton style={{ width: '100%', height: '14px' }} />
          <Skeleton style={{ width: '80%', height: '14px' }} />
        </div>
        <Skeleton
          className="hidden md:block flex-shrink-0"
          style={{ width: '224px', aspectRatio: '16/9' }}
        />
      </div>
    </div>
  )
}

// News listing card skeleton
export function NewsListSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1px solid #e2e8f0' }}
    >
      <div className="flex gap-0">
        <div className="w-1 flex-shrink-0" style={{ background: '#e2e8f0' }} />
        <div className="flex flex-col sm:flex-row flex-1 gap-4 p-4 md:p-5">
          <div className="flex-1 space-y-2.5">
            <div className="flex gap-2">
              <Skeleton style={{ width: '70px', height: '20px' }} />
              <Skeleton style={{ width: '110px', height: '16px' }} />
            </div>
            <Skeleton style={{ width: '85%', height: '20px' }} />
            <Skeleton style={{ width: '60%', height: '20px' }} />
            <Skeleton style={{ width: '100%', height: '14px' }} />
            <Skeleton style={{ width: '75%', height: '14px' }} />
          </div>
          <Skeleton
            className="w-full sm:w-44 md:w-52 flex-shrink-0"
            style={{ aspectRatio: '4/3' }}
          />
        </div>
      </div>
    </div>
  )
}

// Category page skeleton
export function CategoryPageSkeleton() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: '#1a3a0d', padding: '56px 24px' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-5">
          <Skeleton style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)' }} rounded="" />
          <div className="space-y-2">
            <Skeleton style={{ width: '200px', height: '32px', background: 'rgba(255,255,255,0.12)' }} />
            <Skeleton style={{ width: '120px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <Skeleton style={{ width: '100%', height: '280px' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} style={{ height: '220px' }} />
              ))}
            </div>
          </div>
          <div className="lg:w-72 space-y-4">
            <Skeleton style={{ height: '180px' }} />
            <Skeleton style={{ height: '240px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Search results skeleton
export function SearchSkeleton() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <Skeleton style={{ width: '64px', height: '64px', flexShrink: 0 }} />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton style={{ width: '80px', height: '20px' }} />
              <Skeleton style={{ width: '90px', height: '16px' }} />
            </div>
            <Skeleton style={{ width: '85%', height: '16px' }} />
            <Skeleton style={{ width: '70%', height: '13px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Article/News detail page skeleton
export function DetailPageSkeleton() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero skeleton */}
      <div style={{ background: 'linear-gradient(160deg, #0d2e1b 0%, #163522 55%, #0a2213 100%)', padding: '48px 24px' }}>
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton style={{ width: '180px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex gap-3">
            <Skeleton style={{ width: '4px', height: '32px', background: 'rgba(212,175,55,0.4)' }} rounded="rounded-full" />
            <Skeleton style={{ width: '120px', height: '28px', background: 'rgba(255,255,255,0.12)' }} />
          </div>
          <Skeleton style={{ width: '80%', height: '32px', background: 'rgba(255,255,255,0.12)' }} />
          <Skeleton style={{ width: '55%', height: '32px', background: 'rgba(255,255,255,0.12)' }} />
          <Skeleton style={{ width: '240px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
        </div>
      </div>
      {/* Body skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0', background: 'white' }}>
              <Skeleton style={{ width: '100%', aspectRatio: '16/9', borderRadius: 0 }} rounded="" />
              <div className="p-6 md:p-10 space-y-4">
                <Skeleton style={{ width: '100%', height: '16px' }} />
                <Skeleton style={{ width: '90%', height: '16px' }} />
                <Skeleton style={{ width: '95%', height: '16px' }} />
                <div className="pt-4 space-y-3">
                  <Skeleton style={{ width: '100%', height: '14px' }} />
                  <Skeleton style={{ width: '88%', height: '14px' }} />
                  <Skeleton style={{ width: '92%', height: '14px' }} />
                  <Skeleton style={{ width: '70%', height: '14px' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-80 flex-shrink-0 space-y-6">
            <Skeleton style={{ height: '140px' }} />
            <Skeleton style={{ height: '200px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
