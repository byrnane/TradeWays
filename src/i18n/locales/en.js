export default {
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
    success: 'Success',
    unknown: 'Unknown',
    minutes: 'minutes',
    hour: 'hour',
    refresh: 'Refresh',
    updating: 'Updating...'
  },
  status: {
    active: 'Active',
    refreshing: 'Refreshing...',
    expired: 'Expired',
    expiresInHours: 'Expires in {hours}h {minutes}m',
    expiresInMinutes: 'Expires in {minutes}m'
  },
  nav: {
    title: 'EVE Horizon',
    subtitle: 'The Ultimate Toolkit for EVE Online',
    menu: 'Menu',
    home: 'Home',
    profiles: 'Characters',
    calculators: 'Calculators',
    settings: 'Settings'
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
    activeOrders: 'Active Orders',
    active: 'Active',
    viewProfile: 'View Profile',
    settings: 'Account Settings',
    addCharacter: 'Add Character',
    allCharacters: 'All Characters'
  },
  profiles: {
    manageCharacters: 'Manage your connected characters',
    noCharacters: 'No characters connected',
    addFirstCharacter: 'Add your first character to get started',
    switchTo: 'Switch To',
    currentlyActive: 'Currently Active',
    addAnotherCharacter: 'Add another character to your account',
    confirmRemove: 'Are you sure you want to remove {name}?'
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
      profitMargin: 'Profit Margin',
      roi: 'ROI (Return on Investment)',
      calculate: 'Calculate',
      clear: 'Clear',
      results: 'Results'
    }
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    autoRefresh: 'Auto Refresh Tokens',
    autoRefreshDescription: 'Automatically refresh access tokens before they expire',
    dataRefresh: 'Data Refresh',
    dataRefreshDescription: 'Automatically refresh character data at specified intervals',
    refreshInterval: 'Refresh Interval',
    account: 'Account',
    accountSettings: 'Account Settings',
    esiManagement: 'ESI Token Management',
    activeTokens: 'Active Tokens',
    tokenExpires: 'Token expires',
    revokeToken: 'Revoke',
    revokeAll: 'Revoke All',
    confirmRevoke: 'Are you sure you want to revoke this token?',
    confirmRevokeAll: 'Are you sure you want to revoke all tokens? This will log you out from all characters.'
  }
}
