import type { Metadata } from 'next'
import PageHero from '@/components/ui/PageHero'
import AnimateIn from '@/components/ui/AnimateIn'
import { BASE_URL, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Sri Lanka Muslim History collects, uses, and protects your personal information. We are committed to your privacy and data security.',
  alternates: { canonical: `${BASE_URL}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/privacy`,
    siteName: SITE_NAME,
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'How we collect, use, and protect your information.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
}

const sections = [
  {
    title: 'Information We Collect',
    content: `We collect information you voluntarily provide when you contact us through our contact form (name, email address, and message content) or subscribe to our newsletter (email address only). We do not collect any information automatically beyond standard server logs.`,
  },
  {
    title: 'How We Use Your Information',
    content: `Information collected through the contact form is used solely to respond to your enquiry. Newsletter email addresses are used only to send updates about new articles and heritage news. We do not sell, trade, or share your personal information with third parties.`,
  },
  {
    title: 'Cookies',
    content: `SL Muslim History does not use tracking cookies or third-party analytics cookies. We may use essential session cookies required for the basic functioning of the website.`,
  },
  {
    title: 'Data Retention',
    content: `Contact messages are retained for a reasonable period to allow us to follow up on your enquiry and are then deleted. Newsletter subscribers remain on our list until they unsubscribe. You may request deletion of your data at any time by contacting us.`,
  },
  {
    title: 'Third-Party Services',
    content: `Our website is hosted on Vercel. We use Supabase for data storage. Both services maintain their own privacy policies and security standards. We do not embed third-party advertising or tracking scripts.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to access, correct, or delete any personal information we hold about you. To exercise these rights, please contact us using the details on our Contact page. We will respond within 14 business days.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of the site after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: 'Contact',
    content: `If you have any questions about this Privacy Policy, please reach out to us via the Contact page or email us directly at info@srilankamuslimhistory.com.`,
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHero
        badge="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <AnimateIn direction="up">
          <p className="text-xs mb-10" style={{ color: 'var(--muted)' }}>
            Last updated: March 2026
          </p>

          <div className="space-y-8">
            {sections.map((s, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: i % 2 === 0 ? 'var(--green)' : 'var(--gold)' }} />
                  <h2 className="font-extrabold text-base" style={{ color: 'var(--dark)' }}>{s.title}</h2>
                </div>
                <p className="text-sm pl-4" style={{ color: 'var(--text)', lineHeight: '1.9' }}>{s.content}</p>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </div>
  )
}
