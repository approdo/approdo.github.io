/**
 * Returns a function that gives the URL of a file in public/images/, e.g. imageUrl('line-qr.svg').
 * Nuxt does not add the base path ('/' here, '/<repo>/' for a project site) to files in public/, so
 * it is joined here (lesson G-020).
 */
export function useImageUrl() {
  const { app } = useRuntimeConfig()
  return (file: string) => `${app.baseURL}images/${file}`
}
