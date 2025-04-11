import { useState } from "react"

// Mock hook - WIP
// This is a placeholder for the actual implementation
export const useCounter = (initial = 0) => {
  const [count, setCount] = useState(initial)
  const increment = () => setCount((c) => c + 1)
  const decrement = () => setCount((c) => c - 1)
  const reset = () => setCount(initial)

  return { count, increment, decrement, reset }
}
