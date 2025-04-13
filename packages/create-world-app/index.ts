#!/usr/bin/env node

import fs from "fs/promises"
import { intro, outro, text, select, tasks, log } from "@clack/prompts"
import path from "path"
import pc from "picocolors"
import { Command } from "commander"

import packageJson from "./package.json"

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
  .argument("[name]", "Project name")
  .version(packageJson.version, "-v, --version", "Show package version")
  .option("--template <template>", "Template to use (next14, next15)")
  .action(
    async (name: string | undefined, options: { template?: Template }) => {
      intro("Let's create your mini app")

      if (!name) {
        name = (await text({
          message: "Project name",
          placeholder: "my-app",
        })) as any
        if (!name) {
          return terminateWithError("Project name is required")
        }
      }

      if (typeof name !== "string") {
        return terminateWithError("Invalid project name")
      }

      const tmpDir = await extractRepoFiles(repo)
      if (!tmpDir) return terminateWithError("Failed to extract repo files")

      let template = options.template

      if (!template) {
        template = (await select({
          message: "Select a template",
          options: [
            { value: "next14", label: "Next 14", hint: "recommended" },
            { value: "next15", label: "Next 15" },
          ] satisfies Array<{
            value: Template
            label: string
            hint?: string
          }>,
        })) as any
      }

      if (typeof template !== "string") {
        return terminateWithError("Aborted: Invalid template")
      }

      const templateFolder = getTemplateFolder(template)
      const templatePath = path.join(tmpDir, "packages/", templateFolder)
      const projectPath = path.join(process.cwd(), name)

      await fs.mkdir(projectPath, { recursive: true })
      await fs.cp(templatePath, projectPath, {
        recursive: true,
        force: true,
      })

      const pkg = getPKGManager()
      process.chdir(projectPath)

      log.step(`Using ${pc.bold(pkg)}`)

      await tasks([
        {
          title: `🚀 Creating project: ${pc.green(name)}`,
          task: async () => {
            await install(pkg)
          },
        },
      ])

      outro(pc.greenBright(`Project created successfully!`))
    }
  )
  .allowUnknownOption()
  .parse(process.argv)
