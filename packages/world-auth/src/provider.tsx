"use client" // Required for Next.js

import { MiniKit } from "@worldcoin/minikit-js"
import { type ReactNode, useEffect } from "react"

export default function Provider({ children }: { children: ReactNode }) {
  useEffect(() => {
    MiniKit.install()
  }, [])

  return children
}
