<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, Plus, Search, Tag } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'

const hasLore = ref(false)
const searchQuery = ref('')
const activeTab = ref<'rules' | 'factions'>('rules')

const worldRules = ref([
  {
    id: '1',
    name: '灵气复苏',
    category: '修炼体系',
    description: '天地灵气重新涌现，修真者可吸收灵气修炼',
    tags: ['核心设定', '修炼']
  },
  {
    id: '2',
    name: '宗门制度',
    category: '势力规则',
    description: '以宗门为基本单位的势力组织结构',
    tags: ['势力', '社会']
  }
])

const factions = ref([
  {
    id: '1',
    name: '天玄宗',
    ideology: '顺应天道，清静无为',
    type: '正道'
  },
  {
    id: '2',
    name: '血魔宗',
    ideology: '弱肉强食，强者为尊',
    type: '魔道'
  }
])

function createRule() {
  console.log('Create new world rule')
}

function createFaction() {
  console.log('Create new faction')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border p-3">
      <div class="flex items-center gap-2">
        <BookOpen class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">设定</span>
      </div>
      <button
        @click="activeTab === 'rules' ? createRule() : createFaction()"
        class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        title="新建"
      >
        <Plus class="h-4 w-4" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-border">
      <button
        @click="activeTab = 'rules'"
        :class="[
          'flex-1 px-3 py-2 text-xs font-medium transition-colors',
          activeTab === 'rules'
            ? 'border-b-2 border-primary text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        世界观法则
      </button>
      <button
        @click="activeTab = 'factions'"
        :class="[
          'flex-1 px-3 py-2 text-xs font-medium transition-colors',
          activeTab === 'factions'
            ? 'border-b-2 border-primary text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        势力
      </button>
    </div>

    <!-- Search -->
    <div class="border-b border-border p-2">
      <div class="relative">
        <Search class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="activeTab === 'rules' ? '搜索法则...' : '搜索势力...'"
          class="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- World Rules Tab -->
      <template v-if="activeTab === 'rules'">
        <EmptyState
          v-if="!hasLore && worldRules.length === 0"
          icon="book-open"
          title="暂无世界观法则"
          description="创建法则来构建你的故事世界观"
          :actions="[
            { label: '创建法则', variant: 'default', onClick: createRule },
          ]"
        />
        <div v-else class="p-2">
          <div
            v-for="rule in worldRules"
            :key="rule.id"
            class="group mb-2 cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div class="mb-1 flex items-center justify-between">
              <h4 class="font-medium text-foreground">{{ rule.name }}</h4>
              <span class="text-xs text-muted-foreground">{{ rule.category }}</span>
            </div>
            <p class="mb-2 text-xs text-muted-foreground line-clamp-2">{{ rule.description }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in rule.tags"
                :key="tag"
                class="inline-flex items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
              >
                <Tag class="h-3 w-3" />
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Factions Tab -->
      <template v-else>
        <EmptyState
          v-if="!hasLore && factions.length === 0"
          icon="users"
          title="暂无势力"
          description="创建势力来丰富你的故事世界"
          :actions="[
            { label: '创建势力', variant: 'default', onClick: createFaction },
          ]"
        />
        <div v-else class="p-2">
          <div
            v-for="faction in factions"
            :key="faction.id"
            class="group mb-2 cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div class="mb-1 flex items-center justify-between">
              <h4 class="font-medium text-foreground">{{ faction.name }}</h4>
              <span 
                class="text-xs"
                :class="faction.type === '正道' ? 'text-green-600' : 'text-red-600'"
              >
                {{ faction.type }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground">{{ faction.ideology }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
