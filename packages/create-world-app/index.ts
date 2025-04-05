#!/usr/bin/env node

import fs from "fs/promises"
import os from "os"
import path from "path"
import pc from "picocolors"
import { Readable } from "stream"
import { Command } from "commander"
import { x } from "tar"

const handleSigTerm = () => process.exit(0)

process.on("SIGINT", handleSigTerm)
process.on("SIGTERM", handleSigTerm)

const program = new Command()
const FOLDER =
  "https://github.com//rabani-to/world/archive/refs/heads/master.tar.gz"
const repo = fetch(FOLDER)

program
  .name("create-world-app")
  .description("Scaffold world mini-apps faster")
  .argument("<name>", "Project name")
  .option(
    "--template <template>",
    "Template to use (next14, next15, vite)",
    "next15"
  )
  .action(async (name, options) => {
    let tmpDir = ""
    try {
      const tmpDir = await new Promise<string>((resolve) => {
        const prefix = path.join(os.tmpdir(), "repo-cloned-")
        fs.mkdtemp(prefix).then(resolve)
      })

      const buffer = await (await repo).arrayBuffer()
      const stream = Readable.from(Buffer.from(buffer))

      const files = await new Promise<string[]>((resolve) => {
        stream
          .pipe(
            x({
              strip: 1,
              cwd: tmpDir,
            })
          )
          .on("error", () => resolve([]))
          .on("close", () =>
            fs.readdir(tmpDir, { recursive: true }).then(resolve)
          )
      })

      let templateName = options.template as string
      const TEMPLATES = {
        // name : remote slug path on github
        next14: "template-next-14",
        next15: "template-next-14",
        vite: "template-next-14",
      }

      let template = TEMPLATES[templateName]
      if (!template) {
        // if the template is not found, default to next15
        template = TEMPLATES.next15
        templateName = "next15"
      }

      const templatePath = path.join(tmpDir, "packages/", template)
      const projectPath = path.join(process.cwd(), name)

      await fs.mkdir(projectPath, { recursive: true })
      await fs.cp(templatePath, projectPath, {
        recursive: true,
        force: true,
      })

      console.log(pc.cyan(`\n🚀 Creating project: ${pc.bold(name)}`))
      console.log(pc.green(`✓ Using template: ${pc.bold(options.template)}\n`))
    } catch (_) {}

    if (tmpDir) {
      fs.rmdir(tmpDir, { recursive: true })
    }
  })

program.showHelpAfterError(true)

// Check if a command was passed, if not, show the help
if (process.argv.length <= 2) {
  console.log(
    pc.red(`\n❌ No command found. Please provide a command to run.\n\n`)
  )
  program.outputHelp() // Show the help message
  process.exit(1) // Exit with an error code
} else {
  program.parse()
}
