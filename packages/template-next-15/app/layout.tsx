import "./globals.css"

import type { Metadata } from "next"
import { WorldAppProvider } from "@radish-la/world-auth"
import { Rubik, Sora } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { ErudaProvider } from "@/components/Eruda"
import { validator } from "./session"

const fontRubik = Rubik({
  subsets: [],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
})

const fontSora = Sora({
  subsets: [],
  variable: "--font-display",
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Next15 - World Mini App Template",
  description: "Template",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontRubik.variable} ${fontSora.variable} ${fontRubik.className} antialiased`}
      >
        <Toaster
          theme="light"
          style={{ zIndex: 55 }}
          position="top-center"
          toastOptions={{
            className: "!rounded-xl",
          }}
          swipeDirections={["left", "top", "right", "bottom"]}
        />
        <WorldAppProvider
          appName="REPLACE_YOUR_APP_NAME"
          withValidator={validator}
        >
          <ErudaProvider>{children}</ErudaProvider>
        </WorldAppProvider>
      </body>
    </html>
  )
}
