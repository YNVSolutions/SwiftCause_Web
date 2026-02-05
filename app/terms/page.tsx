import TermsPageClient from './TermsPageClient'

export default async function Terms({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; step?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  return <TermsPageClient from={params?.from} step={params?.step} />
}
