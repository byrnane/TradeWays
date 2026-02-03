<template>
  <div class="space-y-6">
    <div class="grid gap-6">
      <!-- Profit Calculator -->
      <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-3 bg-neutral-800 rounded-lg">
            <CalculatorIcon class="h-6 w-6 text-accent" />
          </div>
          <h2 class="text-xl font-semibold text-neutral-100">{{ $t('calculators.profit.title') }}</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-neutral-400 mb-2">{{ $t('calculators.profit.buyPrice') }}</label>
            <input
              v-model="buyPrice"
              type="number"
              class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:border-accent focus:outline-none"
              :placeholder="t('calculators.profit.enterPrice')"
              @input="calculate"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-400 mb-2">{{ $t('calculators.profit.sellPrice') }}</label>
            <input
              v-model="sellPrice"
              type="number"
              class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:border-accent focus:outline-none"
              :placeholder="t('calculators.profit.enterPrice')"
              @input="calculate"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-400 mb-2">{{ $t('calculators.profit.quantity') }}</label>
            <input
              v-model="quantity"
              type="number"
              class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:border-accent focus:outline-none"
              :placeholder="t('calculators.profit.enterQuantity')"
              @input="calculate"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-400 mb-2">{{ $t('calculators.profit.brokerFee') }}</label>
            <input
              v-model="brokerFee"
              type="number"
              step="0.1"
              min="0"
              max="5"
              class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:border-accent focus:outline-none"
              @input="calculate"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-neutral-800 rounded-lg p-4">
            <div class="text-sm text-neutral-400 mb-1">{{ $t('calculators.profit.totalCost') }}</div>
            <div class="text-xl font-bold text-neutral-100">{{ uiStore.formatISK(totalCost) }}</div>
          </div>
          <div class="bg-neutral-800 rounded-lg p-4">
            <div class="text-sm text-neutral-400 mb-1">{{ $t('calculators.profit.profit') }}</div>
            <div class="text-xl font-bold" :class="profit >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ uiStore.formatISK(profit) }}
            </div>
          </div>
          <div class="bg-neutral-800 rounded-lg p-4">
            <div class="text-sm text-neutral-400 mb-1">{{ $t('calculators.profit.roi') }}</div>
            <div class="text-xl font-bold" :class="roi >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ roi.toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Coming Soon Calculators -->
      <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800 opacity-50">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-3 bg-neutral-800 rounded-lg">
            <PlusIcon class="h-6 w-6 text-neutral-400" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-100">{{ $t('home.comingSoon') }}</h3>
        </div>
        <p class="text-neutral-400 text-sm">{{ $t('home.comingSoonDescription') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalculatorIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useUIStore } from '../stores/ui.js'

const { t } = useI18n()
const uiStore = useUIStore()
const setPageHeader = inject('setPageHeader')

onMounted(() => {
  setPageHeader({
    title: t('calculators.title'),
    subtitle: '',
    icon: CalculatorIcon
  })
})

const buyPrice = ref('')
const sellPrice = ref('')
const quantity = ref('')
const brokerFee = ref(3.0)
const transactionTax = ref(2.0)

const profit = ref(0)
const roi = ref(0)
const totalCost = ref(0)
const totalRevenue = ref(0)

const calculate = () => {
  const buy = parseFloat(buyPrice.value) || 0
  const sell = parseFloat(sellPrice.value) || 0
  const qty = parseInt(quantity.value) || 1
  
  // Calculate costs
  const buyCost = buy * qty
  const buyFee = buyCost * (brokerFee.value / 100)
  const sellRevenue = sell * qty
  const sellFee = sellRevenue * (brokerFee.value / 100)
  const sellTax = sellRevenue * (transactionTax.value / 100)
  
  totalCost.value = buyCost + buyFee
  totalRevenue.value = sellRevenue - sellFee - sellTax
  profit.value = totalRevenue.value - totalCost.value
  
  // Calculate ROI
  if (totalCost.value > 0) {
    roi.value = (profit.value / totalCost.value) * 100
  } else {
    roi.value = 0
  }
}
</script>
