import { redirect } from 'next/navigation'
import CallbackClient from './CallbackClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const code = typeof searchParams.code === 'string' ? searchParams.code : undefined
  const state = typeof searchParams.state === 'string' ? searchParams.state : undefined

  if (!code || !state) {
    redirect('/login?error=invalid_callback')
  }

  return <CallbackClient code={code} state={state} />
}
