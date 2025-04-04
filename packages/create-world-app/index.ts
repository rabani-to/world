#!/usr/bin/env node

const handleSigTerm = () => process.exit(0)

process.on("SIGINT", handleSigTerm)
process.on("SIGTERM", handleSigTerm)

import { Command } from "commander"
import pc from "picocolors"

const program = new Command()

program
  .name("create-world-app")
  .description("Scaffold world mini-apps faster")
  .argument("<name>", "Project name")
  .option(
    "--template <template>",
    "Template to use (next14, next15, vite)",
    "next15"
  )
  .action((name, options) => {
    console.log(pc.cyan(`\n🚀 Creating project: ${pc.bold(name)}`))
    console.log(pc.green(`✓ Using template: ${pc.bold(options.template)}\n`))

    console.log(pc.gray("Building...\n"))
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
