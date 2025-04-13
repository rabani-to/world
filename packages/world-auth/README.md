# @radish-la/world-auth

The react library for Worldchain.

## Getting started

```sh
npm i @radish-la/world-auth jotai @worldcoin/minikit-js
```

## Setting up validator

When using world we need to check if the current session is valid.
Under the hood we use `verifySiweMessage` to verify if our stored session payload is a valid signed SIWE message.

We've added a small utility function to fasten this. Follow this steps:

1. Create a file at root level (along with layout.tsx) with the following:

```tsx
// session.tsx

"use server"

import { validateSession } from "@radish-la/world-auth/server"
export const validator = validateSession
```

2. Define the World Auth Provider

```tsx
// layout.tsx

import type { PropsWithChildren } from "react"
import { WorldAppProvider } from "@radish-la/world-auth"

import { validator } from "./session"

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <WorldAppProvider appName="YOUR_APP_NAME" withValidator={validator}>
      {children}
    </WorldAppProvider>
  )
}
```

**Done 🥳**. You're now ready to interact with the connected user and `signin/signout` the user too.

---

## Usage

```ts
import { useWorldAuth } from "@radish-la/world-auth"

const { user, isConnected, isConnecting, signIn, signOut } = useWorldAuth()

// isConnecting: When login modal is open
// signIn: request access to user information for mini app
// signOut: clean up the connected session

// Consume the connected user info
// user.wallletAddress
// user.username
// user.profilePictureUrl
```

[🔍 See example next14 repo](https://github.com/rabani-to/world/blob/master/packages/template-next-14/app/layout.tsx#L55)
