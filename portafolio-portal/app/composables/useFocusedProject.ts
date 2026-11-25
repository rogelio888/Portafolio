export const useFocusedProject = () => {
  const focusedSlug = useState<string | null>('focused-project-slug', () => null)
  const focusTrigger = useState<number>('focused-project-trigger', () => 0)

  const jumpToProject = (slug: string) => {
    focusedSlug.value = slug
    focusTrigger.value++
    if (import.meta.client) {
      document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return {
    focusedSlug,
    focusTrigger,
    jumpToProject
  }
}
