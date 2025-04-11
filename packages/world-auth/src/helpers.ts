import type { WalletUser } from "./types"

export const generateUUID = () => crypto.randomUUID().replace(/-/g, "")

export const getSessionKey = (appName: string) =>
  `__session__world__${encodeURIComponent(appName || "__")}`

export function getStoredSession(sessionKey: string) {
  const savedSession = localStorage.getItem(sessionKey)
  return savedSession ? (JSON.parse(savedSession) as WalletUser) : null
}
