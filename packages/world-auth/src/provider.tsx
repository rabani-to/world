"use client"

import { MiniKit } from "@worldcoin/minikit-js"
import { type PropsWithChildren, useEffect } from "react"
import { Settings, useAtomSettings, useWorldUser } from "./atoms"
import { getSessionKey, getStoredSession } from "./helpers"
import { useWorldAuth } from "./core"

export default function Provider({
  children,
  appId,
  appName,
  withValidator,
  onWrongEnvironment,
}: PropsWithChildren<Settings>) {
  const [, setSettings] = useAtomSettings()
  const [_, setUser] = useWorldUser()
  const { signOut } = useWorldAuth()

  useEffect(() => {
    MiniKit.install()
  }, [])

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      appId,
      appName,
      withValidator,
      onWrongEnvironment,
    }))
  }, [appId, appName, withValidator, onWrongEnvironment])

  useEffect(() => {
    // Check localStorage for saved session data
    const session = getStoredSession(getSessionKey(appName))
    if (session) {
      withValidator(session).then(({ isValid }) => {
        if (isValid) {
          setUser(session.user)
        } else signOut() // Clear the session if it's invalid
      })
    }
  }, [appName, withValidator])

  return children
}
