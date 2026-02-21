<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, Users } from 'lucide-vue-next'
import WorldRulesPanel from './WorldRulesPanel.vue'
import FactionsPanel from './FactionsPanel.vue'

type TabType = 'rules' | 'factions'

const activeTab = ref<TabType>('rules')
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Tabs -->
    <div class="flex border-b border-border">
      <button
        @click="activeTab = 'rules'"
        :class="[
          'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
          activeTab === 'rules'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        <BookOpen class="h-4 w-4" />
        世界观法则
      </button>
      <button
        @click="activeTab = 'factions'"
        :class="[
          'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
          activeTab === 'factions'
            ? 'border-b-2 border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        <Users class="h-4 w-4" />
        势力
      </button>
    </div>

    <!-- Panel Content -->
    <div class="flex-1 overflow-hidden">
      <WorldRulesPanel v-if="activeTab === 'rules'" />
      <FactionsPanel v-else />
    </div>
  </div>
</template>
