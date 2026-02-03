import AboutPageClient from './AboutPageClient'

export default async function About({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  return <AboutPageClient from={params?.from} />
}
