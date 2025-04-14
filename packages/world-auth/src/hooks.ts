import { useWorldUser as useInternalWorldUser } from "./atoms"

/**
 * Get the connected users to the mini app.
 * If not connected, user is null.
 */
export const useWorldUser = () => {
  const [user] = useInternalWorldUser()
  return user?.walletAddress ? user : null
}
