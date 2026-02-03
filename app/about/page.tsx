import AboutPageClient from './AboutPageClient'

export default function About({ searchParams }: { searchParams?: { from?: string } }) {
  return <AboutPageClient from={searchParams?.from} />
}
