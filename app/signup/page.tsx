import SignupPageClient from './SignupPageClient'

export default function Signup({ searchParams }: { searchParams?: { step?: string } }) {
  return <SignupPageClient step={searchParams?.step} />
}
