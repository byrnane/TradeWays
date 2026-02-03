// Helper function to add language parameter to ESI API requests
export function addLanguageToUrl(url, language = 'en') {
  const parsedUrl = new URL(url)
  
  // ESI supports 'en', 'de', 'fr', 'ja', 'ru', 'zh' languages
  const supportedLanguages = ['en', 'de', 'fr', 'ja', 'ru', 'zh']
  const lang = supportedLanguages.includes(language) ? language : 'en'
  
  // Add or update the language parameter
  parsedUrl.searchParams.set('language', lang)
  
  return parsedUrl.toString()
}

// Enhanced fetch function with language support
export async function fetchWithLanguage(url, options = {}, language = 'en') {
  const urlWithLang = addLanguageToUrl(url, language)
  
  const defaultHeaders = {
    'Accept': 'application/json',
    'Accept-Language': language
  }
  
  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }
  
  return fetch(urlWithLang, fetchOptions)
}
