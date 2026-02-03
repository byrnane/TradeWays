export default {
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
    success: 'Успешно',
    unknown: 'Неизвестно',
    minutes: 'минут',
    hour: 'час'
  },
  status: {
    active: 'Активна',
    refreshing: 'Обновляется...',
    expired: 'Истекла',
    expiresInHours: 'Истекает через {hours}ч {minutes}м',
    expiresInMinutes: 'Истекает через {minutes}м'
  },
  nav: {
    title: 'EVE Horizon',
    subtitle: 'Все инструменты для EVE Online в одном месте',
    menu: 'Меню',
    home: 'Главная',
    profiles: 'Персонажи',
    calculators: 'Калькуляторы',
    settings: 'Настройки'
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
    location: 'Локация',
    corporation: 'Корпорация',
    alliance: 'Альянс',
    securityStatus: 'Статус безопасности',
    skillPoints: 'Очки навыков',
    activeOrders: 'Активные ордера',
    active: 'Активен',
    viewProfile: 'Просмотр профиля',
    settings: 'Настройки аккаунта',
    addCharacter: 'Добавить персонажа',
    allCharacters: 'Все персонажи'
  },
  profiles: {
    manageCharacters: 'Управление подключенными персонажами',
    noCharacters: 'Нет подключенных персонажей',
    addFirstCharacter: 'Добавьте первого персонажа для начала работы',
    switchTo: 'Переключиться',
    currentlyActive: 'Сейчас активен',
    addAnotherCharacter: 'Добавить еще одного персонажа в аккаунт',
    confirmRemove: 'Вы уверены, что хотите убрать {name}?'
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
      profitMargin: 'Маржа прибыли',
      roi: 'ROI (возврат инвестиций)',
      calculate: 'Рассчитать',
      clear: 'Очистить',
      results: 'Результаты'
    }
  },
  settings: {
    title: 'Настройки',
    language: 'Язык',
    theme: 'Тема',
    themeLight: 'Светлая',
    themeDark: 'Темная',
    themeSystem: 'Системная',
    autoRefresh: 'Автообновление токенов',
    autoRefreshDescription: 'Автоматически обновлять токены доступа перед истечением срока',
    dataRefresh: 'Обновление данных',
    dataRefreshDescription: 'Автоматически обновлять данные персонажа с указанным интервалом',
    refreshInterval: 'Интервал обновления',
    account: 'Аккаунт',
    accountSettings: 'Настройки аккаунта',
    esiManagement: 'Управление ESI токенами',
    activeTokens: 'Активные токены',
    tokenExpires: 'Токен истекает',
    revokeToken: 'Отозвать',
    revokeAll: 'Отозвать все',
    confirmRevoke: 'Вы уверены, что хотите отозвать этот токен?',
    confirmRevokeAll: 'Вы уверены, что хотите отозвать все токены? Это приведет к выходу из всех персонажей.'
  }
}
