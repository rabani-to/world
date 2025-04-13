export const DEFAULT_TEMPLATE = "next15" as const

const TEMPLATES = {
  // shortName : https://github.com/rabani-to/world/tree/master/packages/[template]
  [DEFAULT_TEMPLATE]: "template-next-14",
  next14: "template-next-14",
  vite: "template-next-14",
} as const

export type Template = keyof typeof TEMPLATES

export const getTemplateFolder = (template: Template): string => {
  const templateName = TEMPLATES[template]
  return templateName || DEFAULT_TEMPLATE
}
