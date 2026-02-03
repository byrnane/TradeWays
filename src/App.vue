<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Fixed Header -->
    <Header @toggle-sidebar="toggleSidebar" />
    
    <!-- Main Content Area -->
    <div class="flex">
      <!-- Sidebar -->
      <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
      
      <!-- Page Content -->
      <main class="flex-1 lg:pl-64 pt-20">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import ProgressBar from './components/ProgressBar.vue'
import { onMounted } from 'vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

onMounted(() => {
  // Initial setup
  console.log('EVE Horizon - The Ultimate Toolkit for EVE Online')
})
</script>
