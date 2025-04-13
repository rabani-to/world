import { useWorldUser as useInternalWorldUser } from "./atoms"

export const useWorldUser = () => {
  const [user] = useInternalWorldUser()
  return user?.walletAddress ? user : null
}
