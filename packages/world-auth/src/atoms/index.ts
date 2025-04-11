"use client"

import type { MiniKitUser, WalletSession } from "../types"
import { useMemo } from "react"
import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

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
  const atom = useMemo(() => {
    return atomWithStorage<MiniKitUser | null>(
      `__user__world__${config.appName || "__"}`,
      null
    )
  }, [config.appName])

  return useAtom(atom)
}
