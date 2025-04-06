import fs from "fs/promises"
import os from "os"
import path from "path"
import pc from "picocolors"
import { outro } from "@clack/prompts"
import { Readable } from "stream"
import { x } from "tar"

export const getGithubRepo = () => {
  return fetch(
    "https://github.com//rabani-to/world/archive/refs/heads/master.tar.gz"
  )
}

export const extractRepoFiles = async (repo: Promise<Response>) => {
  try {
    const tmpDir = await new Promise<string>((resolve) => {
      const prefix = path.join(os.tmpdir(), "repo-cloned-")
      fs.mkdtemp(prefix).then(resolve)
    })

    const buffer = await (await repo).arrayBuffer()
    const stream = Readable.from(Buffer.from(buffer))

    const finalDir = await new Promise<string | null>((resolve) => {
      stream
        .pipe(
          x({
            strip: 1,
            cwd: tmpDir,
          })
        )
        .on("error", () => resolve(null))
        .on("close", () => resolve(tmpDir))
    })

    return finalDir
  } catch (_) {}

  return null
}

export const terminateWithError = (message: string) => {
  outro(pc.red(`❌ ${message}`))
  process.exit(1)
}

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun"

export function getPKGManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || ""

  if (userAgent.startsWith("yarn")) return "yarn"
  if (userAgent.startsWith("pnpm")) return "pnpm"
  if (userAgent.startsWith("bun")) return "bun"

  return "npm"
}
