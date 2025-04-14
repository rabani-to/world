import type { WalletSession } from "../types"
import { verifySiweMessage } from "@worldcoin/minikit-js"

/**
 * Validates a session by verifying the SIWE message and nonce.
 * @param session - The session object containing the payload and nonce.
 */
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
