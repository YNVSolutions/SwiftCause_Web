import ContactPageClient from './ContactPageClient'

export default async function Contact({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  return <ContactPageClient from={params?.from} />
}
