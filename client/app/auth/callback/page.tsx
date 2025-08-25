import { redirect } from 'next/navigation'
import CallbackClient from './CallbackClient'


export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const code = typeof sp.code === 'string' ? sp.code : undefined
  const state = typeof sp.state === 'string' ? sp.state : undefined

  if (!code || !state) {
    redirect('/login?error=invalid_callback')
  }

  return <CallbackClient code={code} state={state} />
}