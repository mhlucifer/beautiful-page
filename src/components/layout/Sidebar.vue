<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const currentPanel = computed(() => {
  switch (appStore.activePanel) {
    case 'explorer': return '资源管理器'
    case 'characters': return '角色'
    case 'lore': return '设定'
    case 'workspace': return '工作台'
    case 'version': return '版本'
    default: return '面板'
  }
})
</script>

<template>
  <div class="flex h-full flex-col border-r border-border bg-card">
    <!-- Header -->
    <div class="flex h-12 items-center justify-between border-b border-border px-4">
      <h2 class="text-sm font-semibold text-foreground">{{ currentPanel }}</h2>
      <button
        @click="appStore.toggleSidebar"
        class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        title="收起侧边栏"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Panel Content -->
    <div class="flex-1 overflow-hidden p-4">
      <p class="text-sm text-muted-foreground">{{ currentPanel }} 内容区域</p>
    </div>
  </div>
</template>
