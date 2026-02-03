import DocsPageClient from './DocsPageClient'

export default async function Docs({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  return <DocsPageClient from={params?.from} />
}
