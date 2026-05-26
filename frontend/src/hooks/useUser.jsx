import { createContext, useContext, useEffect, useState } from 'react'
import { createOrGetUser } from '../api/client'

const UserContext = createContext(null)

const STORAGE_KEY = 'sb_user'

function generateDeviceId() {
  // Simple device fingerprint – persistent per browser
  const nav = navigator
  const raw = [nav.userAgent, nav.language, screen.width, screen.height, new Date().getTimezoneOffset()].join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0
  }
  return `dev_${Math.abs(hash).toString(16)}_${Date.now().toString(36)}`
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNamePrompt, setShowNamePrompt] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setUser(JSON.parse(stored))
      setLoading(false)
    } else {
      setShowNamePrompt(true)
      setLoading(false)
    }
  }, [])

  async function registerUser(name) {
    const deviceId = generateDeviceId()
    const userData = await createOrGetUser(name, deviceId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
    setShowNamePrompt(false)
  }

  return (
    <UserContext.Provider value={{ user, loading, showNamePrompt, registerUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
