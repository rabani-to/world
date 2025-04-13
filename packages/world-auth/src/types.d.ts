import { MiniKit, MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js"

export type Address = `0x${string}`

export type WalletSession = {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export type MiniKitUser = NonNullable<typeof MiniKit.user> & {
  walletAddress: Address
}

export type WalletUser = WalletSession & { user: MiniKitUser }
