<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import AppLayout from '@/components/layout/AppLayout.vue'
import { Toaster } from '@/components/ui/toast'

const appStore = useAppStore()

onMounted(async () => {
  await appStore.initialize()
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-background text-foreground">
    <AppLayout v-if="appStore.isInitialized" />
    <div v-else class="flex h-full items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p class="text-sm text-muted-foreground">正在初始化南柯 Universe...</p>
      </div>
    </div>
    <Toaster />
  </div>
</template>
