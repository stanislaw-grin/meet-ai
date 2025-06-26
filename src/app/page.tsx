'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { data: session } = authClient.useSession()

  const onRegister = () => {
    authClient.signUp.email({
      email,
      name,
      password,
    }, {
      onError  : () => {
        alert('Something went wrong!')
      },
      onSuccess: () => {
        alert('Successfully registered!')
      }
    })
  }

  const onLogin = () => {
    authClient.signIn.email({
      email,
      password,
    }, {
      onError  : () => {
        alert('Something went wrong!')
      },
      onSuccess: () => {
        alert('Successfully logged in!')
      }
    })
  }

  if (session) {
    return (
      <div className="flex flex-col p4 gap-y-4">
        <p>Logged in as { session.user.name }</p>

        <Button onClick={ () => authClient.signOut() }>
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-10">
      <div className="p-4 flex flex-col gap-y-4">
        <Input
          placeholder="name"
          onChange={ (e) => setName(e.target.value) }
          value={ name }
        />

        <Input
          placeholder="email"
          onChange={ (e) => setEmail(e.target.value) }
          value={ email }
        />

        <Input
          placeholder="password"
          type="password"
          onChange={ (e) => setPassword(e.target.value) }
          value={ password }
        />

        <Button onClick={ onRegister }>
          Create account
        </Button>
      </div>

      <div className="p-4 flex flex-col gap-y-4">
        <Input
          placeholder="email"
          onChange={ (e) => setEmail(e.target.value) }
          value={ email }
        />

        <Input
          placeholder="password"
          type="password"
          onChange={ (e) => setPassword(e.target.value) }
          value={ password }
        />

        <Button onClick={ onLogin }>
          Login into account
        </Button>
      </div>
    </div>
  )
}
