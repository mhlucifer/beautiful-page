<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import ActivityBar from '@/components/layout/ActivityBar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import EditorPanel from '@/components/layout/EditorPanel.vue'
import StatusBar from '@/components/layout/StatusBar.vue'

const appStore = useAppStore()

const mainContentStyle = computed(() => ({
  marginLeft: `${appStore.effectiveSidebarWidth}px`,
  marginRight: appStore.isRightPanelCollapsed ? '0px' : `${appStore.effectiveRightPanelWidth}px`,
}))
</script>

<template>
  <div class="flex h-full w-full flex-col bg-background">
    <!-- Activity Bar (Leftmost) -->
    <ActivityBar class="fixed left-0 top-0 z-50 h-full w-12" />
    
    <!-- Sidebar -->
    <Sidebar 
      class="fixed left-12 top-0 z-40 h-full transition-all duration-200 ease-in-out"
      :style="{ width: `${appStore.effectiveSidebarWidth}px` }"
    />
    
    <!-- Main Content Area -->
    <div 
      class="flex flex-1 flex-col transition-all duration-200 ease-in-out"
      :style="mainContentStyle"
    >
      <!-- Editor Panel -->
      <EditorPanel class="flex-1" />
      
      <!-- Status Bar -->
      <StatusBar />
    </div>
  </div>
</template>
