import { headers } from 'next/headers'

import { HomeView } from '@/modules/home/ui/views/home'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <HomeView/>
  )
}
