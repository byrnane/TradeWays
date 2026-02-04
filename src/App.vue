<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Fixed Header -->
    <Header @toggle-sidebar="toggleSidebar" />
    
    <!-- Main Content Area -->
    <div class="flex">
      <!-- Sidebar -->
      <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
      
      <!-- Page Content -->
      <main class="flex-1 lg:pl-64 pt-[73px]">
        <!-- Page Header -->
        <PageHeader v-if="pageHeaderData.title" 
                   :title="pageHeaderData.title" 
                   :subtitle="pageHeaderData.subtitle"
                   :icon="pageHeaderData.icon" />
        
        <!-- Page Content -->
        <div class="px-6 py-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import PageHeader from './components/PageHeader.vue'
import ProgressBar from './components/ProgressBar.vue'
import { onMounted } from 'vue'

const sidebarOpen = ref(false)
const pageHeaderData = ref({})

// Provide page header setter for child components
const setPageHeader = (data) => {
  pageHeaderData.value = data
}

provide('setPageHeader', setPageHeader)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

onMounted(() => {
  // Initial setup
})
</script>
