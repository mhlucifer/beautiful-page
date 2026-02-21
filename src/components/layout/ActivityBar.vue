<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { 
  Files, 
  Users, 
  BookOpen, 
  Zap, 
  Settings,
  GitBranch
} from 'lucide-vue-next'

const appStore = useAppStore()

const activities = [
  { id: 'explorer', icon: Files, label: '资源管理器', tooltip: '大纲与文件' },
  { id: 'characters', icon: Users, label: '角色', tooltip: '角色状态机' },
  { id: 'lore', icon: BookOpen, label: '设定', tooltip: '世界观法则' },
  { id: 'workspace', icon: Zap, label: '工作台', tooltip: 'AI 组装台' },
  { id: 'version', icon: GitBranch, label: '版本', tooltip: '版本控制' },
]

const isActive = (id: string) => appStore.activePanel === id

function setActivity(id: string) {
  if (appStore.activePanel === id) {
    // Toggle sidebar collapse
    appStore.toggleSidebar()
  } else {
    appStore.setActivePanel(id)
    if (appStore.isSidebarCollapsed) {
      appStore.toggleSidebar()
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center border-r border-border bg-muted/30 py-2">
    <!-- Logo -->
    <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <span class="text-lg font-bold">南</span>
    </div>

    <!-- Activity Items -->
    <nav class="flex flex-1 flex-col items-center gap-1">
      <button
        v-for="activity in activities"
        :key="activity.id"
        @click="setActivity(activity.id)"
        :title="activity.tooltip"
        :class="[
          'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
          isActive(activity.id)
            ? 'bg-accent text-accent-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        ]"
      >
        <component :is="activity.icon" class="h-5 w-5" />
        
        <!-- Active indicator -->
        <span 
          v-if="isActive(activity.id)"
          class="absolute left-0 h-4 w-0.5 rounded-r-full bg-primary"
        />
      </button>
    </nav>

    <!-- Settings -->
    <div class="mt-auto flex flex-col items-center gap-1 pb-2">
      <button
        title="设置"
        class="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
      >
        <Settings class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>
