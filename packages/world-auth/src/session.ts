"use server"

import type { WalletSession } from "./types"
import { verifySiweMessage } from "@worldcoin/minikit-js"

export const validateSession = async (session: WalletSession) => {
  try {
    const res = await verifySiweMessage(session.payload, session.nonce)
    return {
      isValid: res.isValid,
    }
  } catch (_) {}

  return {
    isValid: false,
  }
}
