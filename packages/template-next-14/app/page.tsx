import { Button } from "@worldcoin/mini-apps-ui-kit-react"
import Brr from "./Brr"

export default function Home() {
  return (
    <main className="flex min-h-screen gap-2 flex-col items-center justify-center p-10">
      <h1 className="text-4xl text-center font-bold">You've been World'd!</h1>
      <p className="text-lg opacity-70 max-w-xl text-center">
        Welcome to the beginning of your Worldcoin journey. This is a template
        for building mini-apps with Auth and UI ready to go <Brr />
      </p>
      <div className="max-w-xs mt-8 w-full mx-auto">
        <Button fullWidth>Lego with Worldcoin</Button>
      </div>
    </main>
  )
}
