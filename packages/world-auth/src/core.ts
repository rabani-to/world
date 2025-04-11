"use client"

import type { Address, MiniKitUser } from "./types"
import { useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"

import { useAtomSettings, useWorldUser } from "./atoms"
import { generateUUID, getSessionKey } from "./helpers"

export const useWorldAuth = () => {
  const [settings] = useAtomSettings()
  const [isSyncing, setIsSyncing] = useState(false)
  const [user, setUser] = useWorldUser()
  const sessionKey = getSessionKey(settings.appName)

  const signOut = () => {
    // Clear the session from localStorage and update the user state
    localStorage.removeItem(sessionKey)
    setUser(null)
    setIsSyncing(false)
  }

  const terminateSync = () => {
    setIsSyncing(false)
    return null
  }

  const signInWithWallet = async () => {
    console.debug("signInWithWallet")

    if (!MiniKit?.isInstalled()) {
      console.error("MiniKit not installed")
      return terminateSync()
    }

    try {
      setIsSyncing(true)
      const { payload, nonce } = await generateAuthPayload(settings.appName)

      if (payload.status === "error") {
        console.error("Error generating payload", payload)
        return terminateSync()
      }

      const { isValid } = await settings.withValidator({
        nonce,
        payload,
      })

      if (!isValid) {
        console.error("Invalid session")
        return terminateSync()
      }

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

      setUser(user) // Update the user info
      return user
    } catch (error) {
      console.debug({ error })
    }

    return terminateSync()
  }

  useEffect(() => {
    // Cancel syncing if user wallet is found
    if (user?.walletAddress) setIsSyncing(false)
    if (!user?.username && user?.walletAddress) {
      MiniKit.getUserByAddress(user.walletAddress).then((user) => {
        if (user.walletAddress) setUser(user as any)
      })
    }
  }, [user])

  return {
    signInWithWallet,
    signOut,
    isSyncing,
    isLoggedIn: Boolean(user),
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
    statement: `Confirm to allow ${appName || "app"} view your wallet.`,
  })

  return { payload, nonce }
}
