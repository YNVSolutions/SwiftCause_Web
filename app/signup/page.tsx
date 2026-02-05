import SignupPageClient from './SignupPageClient'

export default async function Signup({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  return <SignupPageClient step={params?.step} />
}
