<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">
    <ProgressBar />
    <Sidebar />
    <router-view />
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import ProgressBar from './components/ProgressBar.vue';
import { onMounted } from 'vue';

onMounted(() => {
  // Apply dark theme by default
  document.documentElement.classList.add('dark');
});
</script>
