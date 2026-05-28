import type { Metadata } from 'next'
import PageHero from '@/components/ui/PageHero'
import AnimateIn from '@/components/ui/AnimateIn'
import { BASE_URL, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Read the terms of use for Sri Lanka Muslim History. Understand your rights and responsibilities when using our website and content.',
  alternates: { canonical: `${BASE_URL}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/terms`,
    siteName: SITE_NAME,
    title: `Terms of Use | ${SITE_NAME}`,
    description: 'Please read these terms carefully before using our website.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: SITE_NAME }],
  },
}

const sections = [
  { title: 'Acceptance of Terms',    content: `By accessing and using SL Muslim History (srilankamuslimhistory.com), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this website.` },
  { title: 'Use of Content',         content: `All articles, photographs, research, and other content published on SL Muslim History are the intellectual property of SL Muslim History or the respective contributors. You may share content for non-commercial, educational purposes provided you credit SL Muslim History and link back to the original article.` },
  { title: 'Prohibited Use',         content: `You may not reproduce, republish, or redistribute content from this website for commercial purposes without prior written permission. You may not use this website to spread misinformation, hateful content, or anything that violates Sri Lankan law or international standards.` },
  { title: 'User Submissions',       content: `When you submit content to us — including contact form messages, article submissions, or historical photographs — you grant SL Muslim History a non-exclusive right to use, edit, and publish that content. You confirm that you have the right to submit the content and that it does not infringe on any third-party rights.` },
  { title: 'Accuracy of Information',content: `We strive to ensure the accuracy of all historical content published on this site. However, historical research is an evolving field and some information may be subject to revision. If you believe any content is inaccurate, please contact us and we will review it promptly.` },
  { title: 'External Links',         content: `This website may contain links to external websites for reference purposes. We are not responsible for the content, accuracy, or privacy practices of those external sites.` },
  { title: 'Disclaimer',             content: `SL Muslim History is provided on an "as is" basis. We make no warranties, expressed or implied, regarding the completeness, accuracy, or availability of the website. We are not liable for any loss or damage arising from your use of this site.` },
  { title: 'Changes to Terms',       content: `We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting. Continued use of the website after changes are posted constitutes your acceptance of the revised terms.` },
  { title: 'Governing Law',          content: `These Terms of Use are governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising from your use of this website shall be subject to the jurisdiction of the courts of Sri Lanka.` },
]

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHero
        badge="Legal"
        title="Terms of Use"
        subtitle="Please read these terms carefully before using our website."
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
