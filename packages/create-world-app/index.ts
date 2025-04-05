#!/usr/bin/env node

import fs from "fs/promises"
import path from "path"
import pc from "picocolors"
import { Command } from "commander"
import {
  extractRepoFiles,
  getGithubRepo,
  getPKGManager,
  terminateWithError,
} from "./helpers"
import { install } from "./install"
import { getTemplateFolder, Template } from "./templates"

const handleSigTerm = () => process.exit(0)

process.on("SIGINT", handleSigTerm)
process.on("SIGTERM", handleSigTerm)

const program = new Command()
const repo = getGithubRepo()

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
    const tmpDir = await extractRepoFiles(repo)
    if (!tmpDir) return terminateWithError("Failed to extract repo files")

    const templateFolder = getTemplateFolder(options.template)
    const templatePath = path.join(tmpDir, "packages/", templateFolder)
    const projectPath = path.join(process.cwd(), name)

    await fs.mkdir(projectPath, { recursive: true })
    await fs.cp(templatePath, projectPath, {
      recursive: true,
      force: true,
    })

    const pkg = getPKGManager()
    console.log(pc.cyan(`\n🚀 Creating project: ${pc.bold(name)}`))
    console.log(pc.cyan(`📦 Using: ${pc.bold(pkg)}`))
    console.log(pc.green(`✓ With template: ${pc.bold(options.template)}\n`))

    process.chdir(projectPath)
    await install(pkg)
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
