"use client"

import { toast } from "sonner"

export default function Brr() {
  function brr() {
    toast.success("Hey McQueen! Brrr! 🏎️💨")
  }

  return (
    <button className="inline underline underline-offset-4" onClick={brr}>
      brr 💨
    </button>
  )
}
