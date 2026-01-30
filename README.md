# TradeWay - EVE Online Trading Assistant

Современное веб-приложение для помощи в торговле в EVE Online с интеграцией ESI API.

## Возможности

- 🔐 **Авторизация через EVE SSO** - безопасная OAuth 2.0 аутентификация
- 👤 **Профиль персонажа** - полная информация о персонаже в реальном времени
- 💰 **Баланс кошелька** - отслеживание ISK
- 📍 **Текущая локация** - система и станция
- 🚀 **Активные ордера** - рыночные ордера персонажа
- 📊 **Калькулятор прибыли** - базовые расчеты ROI
- 🌙 **Темная тема** - современный интерфейс в темных тонах

## Технологический стек

- **Vue 3** с Composition API
- **Vite** для сборки
- **TailwindCSS** для стилизации
- **Vue Router** для навигации
- **Pinia** для управления состоянием
- **EVE ESI API** для данных игры

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
├── composables/         # Composition функции
├── router/             # Vue Router конфигурация
├── services/           # ESI API интеграция
├── stores/             # Pinia хранилища
├── views/              # Страницы приложения
└── style.css           # Глобальные стили
```

## Быстрый старт

### 1. Клонирование и установка

```bash
git clone https://github.com/byrnane/TradeWays.git
cd TradeWays
npm install
```

### 2. Настройка EVE ESI API

1. Перейдите в [EVE Developer Portal](https://developers.eveonline.com/)
2. Создайте новое приложение
3. Настройте **Callback URL**: `http://localhost:5173/auth/callback`
4. Выберите необходимые права доступа (scopes):
   - `publicData`
   - `esi-markets.read_character_orders.v1`
   - `esi-wallet.read_character_wallet.v1`
   - `esi-markets.structure_markets.v1`
   - `esi-location.read_location.v1`
   - `esi-location.read_online.v1`
   - `esi-location.read_ship_type.v1`

### 3. Переменные окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
# EVE ESI OAuth Configuration
VITE_ESI_CLIENT_ID=ваш_client_id
VITE_ESI_CLIENT_SECRET=ваш_client_secret
VITE_ESI_CALLBACK_URL=http://localhost:5173/auth/callback
VITE_ESI_SCOPES=publicData esi-markets.read_character_orders.v1 esi-wallet.read_character_wallet.v1 esi-markets.structure_markets.v1 esi-location.read_location.v1 esi-location.read_online.v1 esi-location.read_ship_type.v1
```

**Важно:** Файл `.env.local` добавлен в `.gitignore` и не попадет в репозиторий.

### 4. Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173) в браузере.

## Использование

1. **Авторизация** - Нажмите "Авторизоваться через EVE SSO"
2. **Разрешение доступа** - Подтвердите права доступа в EVE SSO
3. **Профиль** - Просмотрите информацию о персонаже на главной странице
4. **Рынок** - Перейдите в раздел рынка для торговой информации

## Архитектура

Подробная документация по архитектуре доступна в [ARCHITECTURE.md](./ARCHITECTURE.md)

### Основные компоненты

- **Auth Store** - управление токенами и данными персонажа
- **ESI Services** - интеграция с EVE API
- **Character Data** - загрузка и обработка данных персонажа
- **Vue Router** - навигация между страницами

### Поток авторизации

```
AuthView → EVE SSO → AuthCallbackView → Токены → Данные персонажа → HomeView
```

## Траблшутинг

### Ошибка "invalid_scope"
- Убедитесь что все права доступа добавлены в EVE Developer Portal
- Проверьте что `.env.local` содержит правильные scopes
- Перезапустите dev-сервер после изменения переменных

### Ошибка "redirect_url_mismatch"
- Callback URL в EVE Developer Portal должен точно совпадать: `http://localhost:5173/auth/callback`
- Без слэша в конце, с `http://` (не `https://`)

### Данные персонажа не загружаются
- Проверьте консоль браузера на ошибки API
- Убедитесь что токен не истек (автоматическое обновление в разработке)
- Проверьте права доступа для соответствующих эндпоинтов

## Разработка

### Добавление новых ESI эндпоинтов

1. Добавьте запрос в `src/services/character.js`
2. Обновите типы данных если необходимо
3. Добавьте отображение в компонентах
4. Обновите scopes в `.env.local`

### Структура компонентов

```vue
<template>
  <!-- Шаблон с TailwindCSS классами -->
</template>

<script setup>
// Composition API логика
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
</script>
```

## Планы развития

- [ ] Бэкенд на Node.js для кеширования и обработки данных
- [ ] Расширенная аналитика рынка
- [ ] Графики и визуализация данных
- [ ] Поддержка нескольких персонажей
- [ ] PWA версия для мобильных устройств
- [ ] Уведомления о ценах и ордерах

## Лицензия

MIT License - см. файл LICENSE

## Contributing

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## Поддержка

Если у вас есть вопросы или предложения:
- Создайте Issue в GitHub
- Свяжитесь с разработчиком в игре EVE Online

---

**TradeWay** - создано с ❤️ для пилотов EVE Online
