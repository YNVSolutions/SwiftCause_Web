import DocsPageClient from './DocsPageClient'

export default function Docs({ searchParams }: { searchParams?: { from?: string } }) {
  return <DocsPageClient from={searchParams?.from} />
}
