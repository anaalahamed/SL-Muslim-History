import PageClient from './PageClient'

export const dynamic = 'force-static'
export async function generateStaticParams() { return [{ id: 'new' }] }

export default function AdminPage() {
  return <PageClient />
}
