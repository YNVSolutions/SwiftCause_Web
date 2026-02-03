import TermsPageClient from './TermsPageClient'

export default function Terms({ searchParams }: { searchParams?: { from?: string; step?: string } }) {
  return <TermsPageClient from={searchParams?.from} step={searchParams?.step} />
}
