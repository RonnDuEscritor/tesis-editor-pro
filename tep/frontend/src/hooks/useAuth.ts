import { useState, useEffect } from 'react'
import { pb } from '@/lib/pb'

export interface AuthUser {
  id: string; email: string; name?: string
}

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    if (pb.authStore.isValid && pb.authStore.model) {
      setUser({
        id:    pb.authStore.model.id,
        email: pb.authStore.model.email,
        name:  pb.authStore.model.name,
      })
    }
    setLoading(false)

    // Listen for auth changes
    const unsub = pb.authStore.onChange(() => {
      if (pb.authStore.isValid && pb.authStore.model) {
        setUser({ id: pb.authStore.model.id, email: pb.authStore.model.email, name: pb.authStore.model.name })
      } else {
        setUser(null)
      }
    })
    return () => unsub()
  }, [])

  return { user, loading }
}

export async function signIn(email: string, password: string) {
  return pb.collection('users').authWithPassword(email, password)
}

export async function signUp(email: string, password: string, name: string) {
  await pb.collection('users').create({ email, password, passwordConfirm: password, name })
  return pb.collection('users').authWithPassword(email, password)
}

export async function signOut() {
  pb.authStore.clear()
}
