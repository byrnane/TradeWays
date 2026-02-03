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
    hour: 'час',
    refresh: 'Обновить',
    updating: 'Обновление...'
  },
  status: {
    active: 'Активна',
    refreshing: 'Обновляется...',
    expired: 'Истекла',
    expiresInHours: 'Истекает через {hours}ч {minutes}м',
    expiresInMinutes: 'Истекает через {minutes}м'
  },
  location: {
    inSpace: 'В космосе'
  },
  nav: {
    title: 'EVE Horizon',
    subtitle: 'Все инструменты для EVE Online в одном месте',
    menu: 'Меню',
    dashboard: 'Дашборд',
    profiles: 'Персонажи',
    calculators: 'Калькуляторы',
    settings: 'Настройки'
  },
  dashboard: {
    welcome: 'С возвращением'
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
    manageCharacters: 'Управление персонажами',
    switch: 'Переключить',
    select: 'Выбрать',
    currentCharacter: 'Текущий персонаж',
    confirmRemove: 'Вы уверены, что хотите удалить {name}?',
    noCharacters: 'Нет персонажей',
    addFirstCharacter: 'Добавьте первого персонажа для начала',
    addAnotherCharacter: 'Добавить еще одного персонажа',
    pageHeader: 'Профили персонажей',
    lastUpdate: 'Последнее обновление',
    timeToUpdate: 'До обновления',
    never: 'Никогда',
    justNow: 'Только что',
    minutesAgo: '{minutes} мин назад',
    hoursAgo: '{hours} ч назад',
    daysAgo: '{days} д назад'
  },
  calculators: {
    title: 'Калькуляторы',
    profit: {
      title: 'Калькулятор прибыли',
      buyPrice: 'Цена покупки',
      sellPrice: 'Цена продажи',
      quantity: 'Количество',
      brokerFee: 'Брокерская комиссия',
      transactionTax: 'Налог на сделку',
      profit: 'Прибыль',
      profitMargin: 'Маржа прибыли',
      roi: 'ROI (Возврат инвестиций)',
      calculate: 'Рассчитать',
      clear: 'Очистить',
      results: 'Результаты',
      totalCost: 'Общие затраты',
      enterPrice: 'Введите цену',
      enterQuantity: 'Введите количество'
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
    refreshInterval: 'Интервал обновления данных',
    seconds: 'секунд',
    minute: 'минута',
    minutes: 'минут',
    saved: 'Настройки успешно сохранены!',
    account: 'Аккаунт',
    accountSettings: 'Настройки аккаунта',
    loggedInAs: 'Вы вошли как',
    esiManagement: 'Управление ESI токенами',
    activeTokens: 'Активные токены',
    tokenExpires: 'Токен истекает',
    revokeToken: 'Отозвать',
    revokeAll: 'Отозвать все',
    confirmRevoke: 'Вы уверены, что хотите отозвать этот токен?',
    confirmRevokeAll: 'Вы уверены, что хотите отозвать все токены? Это приведет к выходу из всех персонажей.'
  }
}
