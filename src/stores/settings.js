import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // Theme
  const theme = ref(localStorage.getItem('theme') || 'dark')
  
  // Language
  const language = ref(localStorage.getItem('locale') || 'ru')
  
  // Auto refresh
  const autoRefresh = ref(localStorage.getItem('autoRefresh') === 'true')
  const refreshInterval = ref(parseInt(localStorage.getItem('refreshInterval')) || 600)
  
  // Watchers for localStorage
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })
  
  watch(language, (newLanguage) => {
    localStorage.setItem('locale', newLanguage)
  })
  
  watch(autoRefresh, (newValue) => {
    localStorage.setItem('autoRefresh', newValue.toString())
  })
  
  watch(refreshInterval, (newValue) => {
    localStorage.setItem('refreshInterval', newValue.toString())
  })
  
  // Apply theme to DOM
  const applyTheme = (themeValue) => {
    const html = document.documentElement
    
    if (themeValue === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.toggle('dark', prefersDark)
      html.classList.toggle('light', !prefersDark)
    } else {
      html.classList.toggle('dark', themeValue === 'dark')
      html.classList.toggle('light', themeValue === 'light')
    }
  }
  
  // Initialize theme on load
  const initTheme = () => {
    applyTheme(theme.value)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }
  
  return {
    theme,
    language,
    autoRefresh,
    refreshInterval,
    initTheme,
    applyTheme
  }
})
