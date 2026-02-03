<template>
  <div class="min-h-screen bg-neutral-950">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold text-neutral-100 mb-8">{{ $t('calculators.title') }}</h1>
      
      <div class="grid gap-6">
        <!-- Profit Calculator -->
        <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 class="text-xl font-semibold text-neutral-100 mb-6">{{ $t('calculators.profit.title') }}</h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Input Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">
                  {{ $t('calculators.profit.buyPrice') }}
                </label>
                <input
                  type="number"
                  v-model="buyPrice"
                  class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">
                  {{ $t('calculators.profit.sellPrice') }}
                </label>
                <input
                  type="number"
                  v-model="sellPrice"
                  class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">
                  {{ $t('calculators.profit.quantity') }}
                </label>
                <input
                  type="number"
                  v-model="quantity"
                  class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">
                  {{ $t('calculators.profit.brokerFee') }} (%)
                </label>
                <input
                  type="number"
                  v-model="brokerFee"
                  step="0.1"
                  class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="3.0"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">
                  {{ $t('calculators.profit.transactionTax') }} (%)
                </label>
                <input
                  type="number"
                  v-model="transactionTax"
                  step="0.1"
                  class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="2.0"
                />
              </div>
              
              <button
                @click="calculate"
                class="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                {{ $t('calculators.profit.calculate') }}
              </button>
            </div>
            
            <!-- Results Column -->
            <div class="space-y-4">
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">{{ $t('calculators.profit.profit') }}</div>
                <div class="text-2xl font-bold" :class="profit >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ formatISK(profit) }}
                </div>
              </div>
              
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">{{ $t('calculators.profit.roi') }}</div>
                <div class="text-2xl font-bold" :class="roi >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ roi.toFixed(2) }}%
                </div>
              </div>
              
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">Общие затраты</div>
                <div class="text-xl font-semibold text-neutral-200">
                  {{ formatISK(totalCost) }}
                </div>
              </div>
              
              <div class="bg-neutral-800 rounded-lg p-4">
                <div class="text-sm text-neutral-400 mb-1">Общая выручка</div>
                <div class="text-xl font-semibold text-neutral-200">
                  {{ formatISK(totalRevenue) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const buyPrice = ref('')
const sellPrice = ref('')
const quantity = ref('')
const brokerFee = ref(3.0)
const transactionTax = ref(2.0)

const profit = ref(0)
const roi = ref(0)
const totalCost = ref(0)
const totalRevenue = ref(0)

const formatISK = (value) => {
  if (!value || value === 0) return '0.00'
  return new Intl.NumberFormat('ru-RU').format(value)
}

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
