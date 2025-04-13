import type { WalletSession } from "../types"
import { verifySiweMessage } from "@worldcoin/minikit-js"

export const validateSession = async (
  session: WalletSession
): Promise<{
  isValid: boolean
}> => {
  try {
    return await verifySiweMessage(session.payload, session.nonce)
  } catch (_) {}

  return {
    isValid: false,
  }
}
