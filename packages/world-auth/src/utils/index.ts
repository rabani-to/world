"use client"

import type { Address } from "../types"

import useSWR from "swr"
import { atom, useAtom } from "jotai"
import { worldchain } from "viem/chains"
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
  parseAbi,
  type PublicClient,
} from "viem"

export const TOKEN = {
  USDC: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
  WLD: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
} as const

export const ADDRESS_BOOK =
  "0x57b930D551e677CC36e2fA036Ae2fe8FdaE0330D" as const

const BASE_NAME_SPACE = "dwa"
const toSpaceKey = (name: string) => `${BASE_NAME_SPACE}.${name}`

const client = createPublicClient({
  chain: worldchain,
  transport: http(),
})

const atomClient = atom(client)

export const useWorldClient = (): PublicClient => useAtom(atomClient)[0] as any
export const useTokenDecimals = (token?: Address) => {
  const client = useWorldClient()
  const { data: decimals = 18 } = useSWR(
    token ? toSpaceKey(`decimals.${token}`) : null,
    async () => {
      // Default to 0 when invalid token details
      if (!token || !client) return 0

      const decimals = await client.readContract({
        abi: erc20Abi,
        address: token,
        functionName: "decimals",
      })

      return decimals
    }
  )

  return decimals
}

const ZERO = BigInt(0)
export const useBalance = (
  address: Address | undefined,
  token: Address,
  config?: {
    refreshIntervalInSeconds?: number
  }
) => {
  // Default to refresh every 3.5 seconds
  const { refreshIntervalInSeconds = 3.5 } = config || {}
  const client = useWorldClient()
  const decimals = useTokenDecimals(token)

  const {
    data: balance = ZERO,
    isLoading,
    error,
  } = useSWR(
    address ? toSpaceKey(`balance.${token}.${address}`) : null,
    async () => {
      if (!address || !client) return ZERO
      const balance = await client.readContract({
        abi: erc20Abi,
        address: token,
        functionName: "balanceOf",
        args: [address],
      })

      return balance
    },
    {
      refreshInterval:
        // SWR uses milliseconds, so we convert seconds to milliseconds
        refreshIntervalInSeconds * 1000,
    }
  )

  return {
    isLoading,
    error,
    balance: {
      formatted: formatUnits(balance, decimals),
      value: balance,
    },
  }
}

export const useWorldBalance = (address?: Address) =>
  useBalance(address, TOKEN.WLD)

const ABI = parseAbi([
  "function addressVerifiedUntil(address) view returns (uint256)",
])

export const isWorldAddressVerified = async (walletAddress: Address) => {
  try {
    const verifiedUntilTime = Number(
      await client.readContract({
        address: ADDRESS_BOOK,
        abi: ABI,
        functionName: "addressVerifiedUntil",
        args: [walletAddress],
      })
    )

    if (Number.isFinite(verifiedUntilTime)) {
      const now = Math.floor(Date.now() / 1000)
      return verifiedUntilTime > now
    }
  } catch (_) {}

  return false
}

export const useIsVerifiedAddress = (address?: Address) => {
  const {
    data: isVerified = false,
    isLoading,
    error,
  } = useSWR(address ? toSpaceKey(`isVerified.${address}`) : null, () =>
    isWorldAddressVerified(address!)
  )

  return {
    error,
    isLoading,
    isVerified,
  }
}
