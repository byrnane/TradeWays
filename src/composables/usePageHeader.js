import { inject } from 'vue'

export function usePageHeader() {
  const setPageHeader = inject('setPageHeader', null)
  const setPageHeaderFallback = inject('setPageHeaderFallback', () => {})
  
  const setPageTitle = (title, subtitle = '', icon = null) => {
    if (setPageHeader && typeof setPageHeader === 'function') {
      setPageHeader({ title, subtitle, icon })
    } else {
      // Fallback for when provider is not available
      console.warn('PageHeader provider not available, using fallback')
      setPageHeaderFallback()
    }
  }
  
  const clearPageHeader = () => {
    if (setPageHeader && typeof setPageHeader === 'function') {
      setPageHeader({})
    }
  }
  
  return {
    setPageTitle,
    clearPageHeader
  }
}
