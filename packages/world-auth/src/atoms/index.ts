import type { WalletSession } from "../types"
import { useMemo } from "react"
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

export const useWorldUser = () => {
  const [config] = useAtomSettings()
  const atomUser = useMemo(() => {
    const session = getStoredSession(getSessionKey(config.appName))
    return atom(session?.user || null)
  }, [config.appName])

  return useAtom(atomUser)
}
