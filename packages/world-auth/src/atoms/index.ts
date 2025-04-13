import type { MiniKitUser, WalletSession } from "../types"
import { useEffect } from "react"
import { atom, useAtom } from "jotai"
import { getSessionKey, getStoredSession } from "../helpers"

export type Settings = {
  appId?: string
  appName: string
  onWrongEnvironment?: () => void
  withValidator: (session: WalletSession) => Promise<{
    isValid: boolean
  }>
}

const atomSetings = atom({} as Settings)
export const useAtomSettings = () => useAtom(atomSetings)

const atomUser = atom(null as MiniKitUser | null)
export const useWorldUser = () => {
  const [config] = useAtomSettings()
  const [, setUser] = useAtom(atomUser)

  useEffect(() => {
    const session = getStoredSession(getSessionKey(config.appName))
    setUser(session?.user || null)
  }, [config.appName])

  return useAtom(atomUser)
}
