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
  const [isMiniApp, setIsMiniApp] = useState(
    true // We optimistically assume we are in a mini app
  )
  const [user, setUser] = useWorldUser()
  const sessionKey = getSessionKey(settings.appName)

  const signOut = () => {
    // Clear the session from localStorage and update the user state
    localStorage.removeItem(sessionKey)
    setUser(clearConnectState())
  }

  /**
   * Resets the connection state to false
   * And intented to re-use returns null
   * @returns null
   */
  const clearConnectState = () => {
    setIsConnecting(false)
    return null
  }

  const signIn = async () => {
    if (!isMiniApp) {
      console.error("MiniKit:NotInstalled")
      ;(onWrongEnvironment || settings.onWrongEnvironment)?.()
      return clearConnectState()
    }

    try {
      setIsConnecting(true)

      const nonce = generateUUID()
      const { finalPayload: payload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days
        ),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: `Allow ${settings.appName || "this app"} to view your wallet.`,
      })

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

      let user = MiniKit.user as MiniKitUser

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
          nonce,
          payload,
          user,
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
      MiniKit.getUserByAddress(user.walletAddress).then((kitUser) => {
        if (kitUser.walletAddress) setUser(kitUser as MiniKitUser)
      })
    }
  }, [user])

  useEffect(() => {
    setIsMiniApp(MiniKit?.isInstalled())
  }, [settings.appName, settings.appId])

  const isConnected = Boolean(user?.walletAddress)
  return {
    signIn,
    /** Connected wallet address */
    address: user?.walletAddress,
    // We don't expose user if not even wallet address is present
    // To keep it consistent with the rest of the API
    user: isConnected ? user : null,
    /** (WARN) Force set world user your self*/
    recklesslySetUser: setUser,
    signOut,
    /** `true` when login modal is open in Mini App */
    isConnecting,
    /** `true` when MiniKit is found and installed */
    isMiniApp,
    isConnected,
  }
}
