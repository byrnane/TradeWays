# TradeWay — EVE Online Market Helper

Минималистичное веб‑приложение с тёмной темой для помощника по торговле в EVE Online. Интеграция с EVE ESI API для авторизации и получения рыночных данных.

## Требования
- Node.js 18+
- npm (или pnpm / yarn)
- Аккаунт разработчика EVE и созданное приложение на https://developers.eveonline.com/

## Настройка ESI

1. Создайте приложение на [EVE Developer Portal](https://developers.eveonline.com/)
2. Укажите **Callback URL**: `http://localhost:5173/auth/callback`
3. Скопируйте Client ID и Client Secret

4. Создайте файл `.env.local` в корне проекта:
   ```bash
   # EVE ESI OAuth Configuration
   VITE_ESI_CLIENT_ID=ваш_client_id
   VITE_ESI_CLIENT_SECRET=ваш_client_secret
   VITE_ESI_CALLBACK_URL=http://localhost:5173/auth/callback
   VITE_ESI_SCOPES=publicData esi-markets.read_structures.v1 esi-markets.read_character_orders.v1 esi-wallet.read_character_wallet.v1
   ```

## Установка и запуск
```bash
npm install
npm run dev
```
Откройте адрес из терминала (обычно http://localhost:5173).

## Сборка продакшена
```bash
npm run build
npm run preview
```

## Стек
- Vue 3 (Composition API)
- Vue Router 4
- Pinia (state management)
- Vite
- TailwindCSS
- EVE ESI OAuth 2.0

## Структура проекта
- `src/views/` - страницы (Home, Auth, Market)
- `src/stores/` - Pinia сторы (auth)
- `src/services/` - ESI API сервисы
- `src/router/` - Vue Router конфигурация

## Дальнейшие шаги
- Загрузка рыночных данных через ESI
- Таблицы ордеров и сделок
- Анализ прибыльности маршрутов
- Списки наблюдения за товарами
