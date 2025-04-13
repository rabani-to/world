import { useWorldUser as useInterlaWorldUser } from "./atoms"

export const useWorldUser = () => {
  const [user] = useInterlaWorldUser()
  return user
}
