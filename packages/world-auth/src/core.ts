import type { Address, MiniKitUser } from "./types"
import { useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

import { useAtomSettings, useWorldUser } from "./atoms"
import { generateUUID, getSessionKey } from "./helpers"

export const useWorldAuth = ({
  onWrongEnvironment,
  onLoginSuccess,
  onLoginError,
}: {
  onWrongEnvironment?: () => void
  onLoginSuccess?: (user: MiniKitUser) => void
  onLoginError?: (error: Error) => void
} = {}) => {
  const [settings] = useAtomSettings()
  const [isConnecting, setIsConnecting] = useState(false)
  const [user, setUser] = useWorldUser()
  const sessionKey = getSessionKey(settings.appName)

  const signOut = () => {
    // Clear the session from localStorage and update the user state
    localStorage.removeItem(sessionKey)
    setUser(clearConnectState())
  }

  const clearConnectState = () => {
    setIsConnecting(false)
    return null
  }

  const signIn = async () => {
    if (!MiniKit?.isInstalled()) {
      console.error("MiniKit:NotInstalled")
      ;(onWrongEnvironment || settings.onWrongEnvironment)?.()
      return clearConnectState()
    }

    try {
      setIsConnecting(true)
      const { payload, nonce } = await generateAuthPayload(settings.appName)

      if (payload.status === "error") {
        throw new Error("PayloadError")
      }

      if (typeof settings.withValidator !== "function") {
        throw new Error("NoValidatorFound")
      }

      const { isValid } = await settings.withValidator({
        nonce,
        payload,
      })

      if (!isValid) throw new Error("InvalidSession")

      let user = MiniKit.user as MiniKitUser | null

      if (!user) {
        // We create a new user object if it doesn't exist
        // We async fetch the user data from it's wallet address
        user = {
          walletAddress: payload.address as Address,
          username: "",
          profilePictureUrl: "",
        }
      }

      // Store the user session in localStorage
      localStorage.setItem(
        sessionKey,
        JSON.stringify({
          user: MiniKit.user,
          nonce,
          payload,
        })
      )

      onLoginSuccess?.(user)
      setUser(user) // Update the user info
      return user
    } catch (error: any) {
      console.error("Error:", error)
      onLoginError?.(error)
    }

    return clearConnectState()
  }

  useEffect(() => {
    // Cancel syncing if user wallet is found
    if (user?.walletAddress) setIsConnecting(false)

    // Get user metadata from wallet if not present in inital login
    if (!user?.username && user?.walletAddress) {
      MiniKit.getUserByAddress(user.walletAddress).then((user) => {
        if (user.walletAddress) setUser(user as any)
      })
    }
  }, [user])

  return {
    signIn,
    user,
    /** (WARN) Force set world user your self*/
    reklesslySetUser: setUser,
    signOut,
    isConnecting,
    isConnected: Boolean(user),
  }
}

async function generateAuthPayload(appName: string) {
  const nonce = generateUUID()
  const { finalPayload: payload } = await MiniKit.commandsAsync.walletAuth({
    nonce,
    expirationTime: new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
    notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    statement: `Allow ${appName || "this app"} to view your wallet.`,
  })

  return { payload, nonce }
}
