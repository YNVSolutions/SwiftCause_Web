import ContactPageClient from './ContactPageClient'

export default function Contact({ searchParams }: { searchParams?: { from?: string } }) {
  return <ContactPageClient from={searchParams?.from} />
}
