import { MiniKit } from "@worldcoin/minikit-js"
import { type PropsWithChildren, useEffect, useRef } from "react"
import { Settings, useAtomSettings, useWorldUser } from "./atoms"
import { getSessionKey, getStoredSession } from "./helpers"
import { useWorldAuth } from "./core"

export function WorldAppProvider({
  children,
  appId,
  appName,
  withValidator,
  onWrongEnvironment,
}: PropsWithChildren<Settings>) {
  const [, setSettings] = useAtomSettings()
  const [, setUser] = useWorldUser()
  const { signOut } = useWorldAuth()

  const validatorRef = useRef(withValidator)
  const onWrongEnvRef = useRef(onWrongEnvironment)

  useEffect(() => {
    validatorRef.current = withValidator
    onWrongEnvRef.current = onWrongEnvironment
  })

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      appId,
      appName,
      withValidator: validatorRef.current,
      onWrongEnvironment: onWrongEnvRef.current,
    }))
  }, [appId, appName])

  useEffect(() => {
    const session = getStoredSession(getSessionKey(appName))
    if (session) {
      validatorRef.current(session).then(({ isValid }) => {
        isValid ? setUser(session.user) : signOut()
      })
    }
  }, [appName])

  useEffect(() => {
    MiniKit.install()
  }, [])

  return <>{children}</>
}
