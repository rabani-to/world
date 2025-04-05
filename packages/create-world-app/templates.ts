export const DEFAULT_TEMPLATE = "next15" as const

const TEMPLATES = {
  // name : https://github.com/vercel/next.js/tree/canary/packages/[template]
  next14: "template-next-14",
  next15: "template-next-14",
  vite: "template-next-14",
} as const

export type Template = keyof typeof TEMPLATES

export const getTemplateFolder = (template: Template): string => {
  const templateName = TEMPLATES[template]
  return templateName || DEFAULT_TEMPLATE
}
