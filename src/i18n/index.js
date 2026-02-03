import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import ru from './locales/ru.js'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ru
  }
})

export default i18n
