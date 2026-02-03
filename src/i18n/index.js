import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    common: {
      profile: 'Profile',
      calculators: 'Calculators',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    },
    nav: {
      title: 'EVE Horizon',
      subtitle: 'The Ultimate Toolkit for EVE Online',
      menu: 'Menu'
    },
    home: {
      unlockPotential: 'Unlock Full Potential',
      authDescription: 'Authorize with EVE SSO to access your character profile, track market orders, use advanced calculators, and unlock exclusive features.',
      calculatorDescription: 'Calculate the profitability of trading operations',
      settingsDescription: 'Customize the application to your liking',
      comingSoon: 'Coming Soon',
      comingSoonDescription: 'New features in development'
    },
    auth: {
      loginWithEVE: 'Login with EVE SSO',
      requiredScopes: 'Required scopes:',
      scopes: {
        publicData: 'publicData - basic character information',
        marketsStructures: 'esi-markets.read_structures.v1 - read structure market data',
        marketsOrders: 'esi-markets.read_character_orders.v1 - read character orders',
        wallet: 'esi-wallet.read_character_wallet.v1 - read wallet balance'
      }
    },
    profile: {
      title: 'Profile',
      characterInfo: 'Character Information',
      balance: 'Balance',
      location: 'Location',
      corporation: 'Corporation',
      alliance: 'Alliance',
      securityStatus: 'Security Status',
      skillPoints: 'Skill Points',
      activeOrders: 'Active Orders'
    },
    calculators: {
      title: 'Calculators',
      profit: {
        title: 'Profit Calculator',
        buyPrice: 'Buy Price',
        sellPrice: 'Sell Price',
        quantity: 'Quantity',
        brokerFee: 'Broker Fee',
        transactionTax: 'Transaction Tax',
        profit: 'Profit',
        roi: 'ROI',
        calculate: 'Calculate'
      }
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'System',
      autoRefresh: 'Auto-refresh data',
      refreshInterval: 'Refresh interval (seconds)'
    }
  },
  ru: {
    common: {
      profile: 'Профиль',
      calculators: 'Калькуляторы',
      settings: 'Настройки',
      logout: 'Выйти',
      login: 'Войти',
      back: 'Назад',
      save: 'Сохранить',
      cancel: 'Отмена',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно'
    },
    nav: {
      title: 'EVE Horizon',
      subtitle: 'The Ultimate Toolkit for EVE Online',
      menu: 'Меню'
    },
    home: {
      unlockPotential: 'Откройте все возможности',
      authDescription: 'Авторизуйтесь через EVE SSO, чтобы получить доступ к профилю персонажа, отслеживать рыночные ордера, использовать продвинутые калькуляторы и разблокировать эксклюзивные функции.',
      calculatorDescription: 'Рассчитайте прибыльность торговых операций',
      settingsDescription: 'Настройте приложение под себя',
      comingSoon: 'Скоро',
      comingSoonDescription: 'Новые функции в разработке'
    },
    auth: {
      loginWithEVE: 'Авторизоваться через EVE SSO',
      requiredScopes: 'Необходимые права доступа:',
      scopes: {
        publicData: 'publicData - базовая информация о персонаже',
        marketsStructures: 'esi-markets.read_structures.v1 - чтение рыночных данных структур',
        marketsOrders: 'esi-markets.read_character_orders.v1 - чтение ордеров персонажа',
        wallet: 'esi-wallet.read_character_wallet.v1 - чтение баланса кошелька'
      }
    },
    profile: {
      title: 'Профиль',
      characterInfo: 'Информация о персонаже',
      balance: 'Баланс',
      location: 'Местоположение',
      corporation: 'Корпорация',
      alliance: 'Альянс',
      securityStatus: 'Статус безопасности',
      skillPoints: 'Очки навыков',
      activeOrders: 'Активные ордера'
    },
    calculators: {
      title: 'Калькуляторы',
      profit: {
        title: 'Калькулятор прибыли',
        buyPrice: 'Цена покупки',
        sellPrice: 'Цена продажи',
        quantity: 'Количество',
        brokerFee: 'Комиссия брокера',
        transactionTax: 'Налог на сделку',
        profit: 'Прибыль',
        roi: 'ROI',
        calculate: 'Рассчитать'
      }
    },
    settings: {
      title: 'Настройки',
      language: 'Язык',
      тема: 'Тема',
      темаLight: 'Светлая',
      темаDark: 'Темная',
      темаSystem: 'Как в системе',
      автообновление: 'Автообновление данных',
      интервалОбновления: 'Интервал обновления (секунд)'
    }
  }
}

const savedLocale = localStorage.getItem('locale') || 'ru'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages
})

export default i18n
