<template>
  <div class="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
    <!-- Mobile Header -->
    <header class="lg:hidden sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="sidebarOpen = true" class="p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold">Рынок</h1>
        <button @click="toggleTheme" class="p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
          <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 7.05-1.41-1.41M7.46 6.46 6.05 5.05m12.9 0-1.41 1.41M7.46 17.54 6.05 18.95"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="lg:pl-64">
      <div class="mx-auto max-w-6xl px-4 py-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight text-neutral-100">Рынок</h1>
          <p class="mt-2 text-neutral-400">Обзор рыночных данных и аналитика</p>
        </div>

        <!-- Market Content -->
        <div class="grid gap-6 lg:grid-cols-4">
          <!-- Categories Sidebar -->
          <div class="lg:col-span-1">
            <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-soft sticky top-24">
              <h2 class="mb-4 text-lg font-semibold">Категории</h2>
              
              <!-- Search -->
              <div class="mb-4">
                <input 
                  v-model="searchQuery"
                  type="text"
                  placeholder="Поиск предметов..."
                  class="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
              </div>

              <!-- Category Tree -->
              <div class="space-y-1 max-h-[600px] overflow-y-auto">
                <div v-for="category in filteredCategories" :key="category.id" class="category-tree">
                  <div 
                    @click="toggleCategory(category.id)"
                    class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors"
                    :class="selectedCategory === category.id 
                      ? 'bg-accent/10 text-accent' 
                      : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800'"
                  >
                    <svg 
                      class="h-4 w-4 transition-transform"
                      :class="{ 'rotate-90': expandedCategories.includes(category.id) }"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span class="flex-1">{{ category.name }}</span>
                    <span v-if="category.children" class="text-xs text-neutral-500">{{ category.children.length }}</span>
                  </div>
                  
                  <!-- Subcategories -->
                  <div v-if="category.children && expandedCategories.includes(category.id)" class="ml-4 mt-1 space-y-1">
                    <div 
                      v-for="child in category.children"
                      :key="child.id"
                      @click="selectCategory(child.id)"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors"
                      :class="selectedCategory === child.id 
                        ? 'bg-accent/10 text-accent' 
                        : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800'"
                    >
                      <div class="h-1.5 w-1.5 rounded-full bg-neutral-600"></div>
                      <span class="flex-1">{{ child.name }}</span>
                      <span v-if="child.children" class="text-xs text-neutral-500">{{ child.children.length }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="lg:col-span-3">
            <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-soft">
              <!-- Category Header -->
              <div class="mb-6 pb-4 border-b border-neutral-800">
                <h2 class="text-xl font-semibold">{{ getCurrentCategoryName() }}</h2>
                <p class="text-sm text-neutral-400 mt-1">{{ getCurrentCategoryDescription() }}</p>
              </div>

              <!-- Items Grid -->
              <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full"></div>
              </div>

              <div v-else-if="filteredItems.length === 0" class="text-center py-12">
                <div class="mx-auto h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-neutral-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <p class="text-neutral-400">Предметы не найдены</p>
                <p class="text-sm text-neutral-500 mt-1">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
              </div>

              <div v-else class="grid gap-4">
                <div 
                  v-for="item in paginatedItems"
                  :key="item.id"
                  class="flex items-center gap-4 p-4 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  @click="selectItem(item)"
                >
                  <img 
                    :src="`https://images.evetech.net/types/${item.id}/icon?size=64`"
                    :alt="item.name"
                    class="h-12 w-12 rounded-md border border-neutral-700"
                    @error="handleImageError"
                  >
                  <div class="flex-1">
                    <h3 class="font-medium text-neutral-100">{{ item.name }}</h3>
                    <p class="text-sm text-neutral-400">{{ item.group?.name || '' }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-neutral-100">{{ formatISK(item.marketData?.buy?.max || 0) }}</div>
                    <div class="text-xs text-neutral-500">Buy Max</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-neutral-100">{{ formatISK(item.marketData?.sell?.min || 0) }}</div>
                    <div class="text-xs text-neutral-500">Sell Min</div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
                <div class="text-sm text-neutral-400">
                  Показано {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} из {{ filteredItems.length }}
                </div>
                <div class="flex gap-2">
                  <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-3 py-1 rounded-md text-sm border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Назад
                  </button>
                  <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-1 rounded-md text-sm border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Sidebar -->
    <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import { useUIStore } from '../stores/ui.js';

const sidebarOpen = ref(false);
const theme = ref('dark');
const searchQuery = ref('');
const selectedCategory = ref(null);
const expandedCategories = ref([]);
const currentPage = ref(1);
const itemsPerPage = 20;
const loading = ref(false);
const uiStore = useUIStore();

// Mock data - в реальности это будет загружаться из API
const categories = ref([
  {
    id: 1,
    name: 'Модули',
    description: 'Улучшения для кораблей',
    children: [
      {
        id: 11,
        name: 'Оружейные системы',
        children: [
          { id: 111, name: 'Гибридные орудия' },
          { id: 112, name: 'Лазерные орудия' },
          { id: 113, name: 'Проектильные орудия' }
        ]
      },
      {
        id: 12,
        name: 'Оборонительные системы',
        children: [
          { id: 121, name: 'Броневые плиты' },
          { id: 122, name: 'Экранные усилители' },
          { id: 123, name: 'Адаптивные усилители' }
        ]
      },
      {
        id: 13,
        name: 'Пропульсионные системы',
        children: [
          { id: 131, name: 'Двигатели' },
          { id: 132, name: 'Варп-ускорители' },
          { id: 133, name: 'Микроварп-двигатели' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Корабли',
    description: 'Космические корабли всех классов',
    children: [
      {
        id: 21,
        name: 'Фригаты',
        children: [
          { id: 211, name: 'Боевые фригаты' },
          { id: 212, name: 'Электронные фригаты' },
          { id: 213, name: 'Штурмовые фригаты' }
        ]
      },
      {
        id: 22,
        name: 'Крейсеры',
        children: [
          { id: 221, name: 'Линейные крейсеры' },
          { id: 222, name: 'Боевые крейсеры' },
          { id: 223, name: 'Логистические крейсеры' }
        ]
      },
      {
        id: 23,
        name: 'Боевые корабли',
        children: [
          { id: 231, name: 'Командные корабли' },
          { id: 232, name: 'Штурмовые корабли' },
          { id: 233, name: 'Титаны' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Ресурсы',
    description: 'Материалы и компоненты',
    children: [
      {
        id: 31,
        name: 'Руда',
        children: [
          { id: 311, name: 'Высокосортная руда' },
          { id: 312, name: 'Низкосортная руда' },
          { id: 313, name: 'Ледяные газы' }
        ]
      },
      {
        id: 32,
        name: 'Материалы',
        children: [
          { id: 321, name: 'Компоненты для производства' },
          { id: 322, name: 'Реагенты' },
          { id: 323, name: 'Наниты' }
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Чертежи',
    description: 'Чертежи для производства',
    children: [
      {
        id: 41,
        name: 'Чертежи модулей'
      },
      {
        id: 42,
        name: 'Чертежи кораблей'
      },
      {
        id: 43,
        name: 'Чертежи дронов'
      }
    ]
  }
])

// Mock items data
const items = ref([
  { id: 1001, name: 'Small Shield Extender I', group: { name: 'Экранные усилители' }, marketData: { buy: { max: 15000 }, sell: { min: 20000 } } },
  { id: 1002, name: 'Medium Shield Extender I', group: { name: 'Экранные усилители' }, marketData: { buy: { max: 50000 }, sell: { min: 65000 } } },
  { id: 1003, name: 'Large Shield Extender I', group: { name: 'Экранные усилители' }, marketData: { buy: { max: 150000 }, sell: { min: 200000 } } },
  { id: 1004, name: 'Small Armor Repairer I', group: { name: 'Броневые ремонтеры' }, marketData: { buy: { max: 20000 }, sell: { min: 25000 } } },
  { id: 1005, name: 'Medium Armor Repairer I', group: { name: 'Броневые ремонтеры' }, marketData: { buy: { max: 75000 }, sell: { min: 90000 } } },
  { id: 1006, name: 'Large Armor Repairer I', group: { name: 'Броневые ремонтеры' }, marketData: { buy: { max: 200000 }, sell: { min: 250000 } } },
  { id: 1007, name: '1MN Afterburner I', group: { name: 'Двигатели' }, marketData: { buy: { max: 10000 }, sell: { min: 15000 } } },
  { id: 1008, name: '10MN Afterburner I', group: { name: 'Двигатели' }, marketData: { buy: { max: 50000 }, sell: { min: 65000 } } },
  { id: 1009, name: '100MN Afterburner I', group: { name: 'Двигатели' }, marketData: { buy: { max: 200000 }, sell: { min: 250000 } } },
  { id: 1010, name: 'Rifter', group: { name: 'Боевые фригаты' }, marketData: { buy: { max: 250000 }, sell: { min: 300000 } } },
  { id: 1011, name: 'Punisher', group: { name: 'Боевые фригаты' }, marketData: { buy: { max: 200000 }, sell: { min: 250000 } } },
  { id: 1012, name: 'Merlin', group: { name: 'Боевые фригаты' }, marketData: { buy: { max: 300000 }, sell: { min: 350000 } } },
])

// Computed
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  return categories.value.map(cat => ({
    ...cat,
    children: cat.children?.filter(child => 
      child.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })).filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (cat.children && cat.children.length > 0)
  )
})

const filteredItems = computed(() => {
  let result = items.value
  
  if (searchQuery.value) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return result
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItems.value.slice(start, end)
})

// Methods
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', theme.value === 'dark');
  localStorage.setItem('theme', theme.value);
};

const toggleCategory = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.value.splice(index, 1);
  } else {
    expandedCategories.value.push(categoryId);
  }
};

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  currentPage.value = 1;
};

const getCurrentCategoryName = () => {
  if (!selectedCategory.value) return 'Все предметы'
  
  for (const cat of categories.value) {
    if (cat.id === selectedCategory.value) return cat.name
    if (cat.children) {
      const child = cat.children.find(c => c.id === selectedCategory.value)
      if (child) return child.name
      if (child.children) {
        const subChild = child.children.find(sc => sc.id === selectedCategory.value)
        if (subChild) return subChild.name
      }
    }
  }
  return 'Все предметы'
}

const getCurrentCategoryDescription = () => {
  if (!selectedCategory.value) return 'Показаны все доступные предметы'
  
  for (const cat of categories.value) {
    if (cat.id === selectedCategory.value) return cat.description
    if (cat.children) {
      const child = cat.children.find(c => c.id === selectedCategory.value)
      if (child) return child.description || `Подкатегория: ${child.name}`
    }
  }
  return ''
}

const selectItem = (item) => {
  console.log('Selected item:', item);
  // Здесь будет открытие детальной информации о предмете
};

const formatISK = (value) => {
  if (!value || value === 0) return '0.00 ISK';
  return new Intl.NumberFormat('ru-RU').format(value) + ' ISK';
};

const handleImageError = (event) => {
  event.target.src = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  `)}`
  event.target.classList.add('p-2', 'bg-neutral-800');
};

// Watch for search query changes
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') theme.value = saved
  } catch (_) {}
  document.documentElement.classList.toggle('dark', theme.value === 'dark');
});
</script>

<style scoped>
.category-tree {
  user-select: none;
}

.category-tree svg {
  flex-shrink: 0;
}
</style>
