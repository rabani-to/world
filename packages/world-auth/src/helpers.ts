import type { WalletUser } from "./types"

export const generateUUID = () => crypto.randomUUID().replace(/-/g, "")

// We generate and encoded key to keep track of users session
// Session contains the original user object + signed siwe message
// At initialization we check if the session is still valid
// If not we clear the session
export const getSessionKey = (appName: string) =>
  `__session__world__${encodeURIComponent(appName || "__")}`

export function getStoredSession(sessionKey: string) {
  const savedSession = localStorage.getItem(sessionKey)
  return savedSession ? (JSON.parse(savedSession) as WalletUser) : null
}
