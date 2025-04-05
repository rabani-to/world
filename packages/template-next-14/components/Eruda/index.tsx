import type { PropsWithChildren } from "react"
import { Eruda } from "./eruda-provider"

export const ErudaProvider = ({ children }: PropsWithChildren) => {
  if (process.env.NODE_ENV === "production") {
    return children
  }
  return <Eruda>{children}</Eruda>
}
