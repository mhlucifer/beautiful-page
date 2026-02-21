<script setup lang="ts">
import { ref } from 'vue'
import { Users, Plus, Search } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'

const hasCharacters = ref(false)
const searchQuery = ref('')

const characters = ref([
  {
    id: '1',
    name: '林墨白',
    identity: '主角',
    personality: '冷静理智',
    tags: ['主角', '修真者']
  },
  {
    id: '2',
    name: '苏清雪',
    identity: '女主角',
    personality: '温柔善良',
    tags: ['女主', '医修']
  }
])

function createCharacter() {
  // TODO: Implement character creation
  console.log('Create new character')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border p-3">
      <div class="flex items-center gap-2">
        <Users class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">角色列表</span>
      </div>
      <button
        @click="createCharacter"
        class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        title="新建角色"
      >
        <Plus class="h-4 w-4" />
      </button>
    </div>

    <!-- Search -->
    <div class="border-b border-border p-2">
      <div class="relative">
        <Search class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索角色..."
          class="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <EmptyState
        v-if="!hasCharacters"
        icon="users"
        title="暂无角色"
        description="创建你的第一个角色来开始构建故事"
        :actions="[
          { label: '创建角色', variant: 'default', onClick: createCharacter },
        ]"
      />
      <div v-else class="p-2">
        <div
          v-for="character in characters"
          :key="character.id"
          class="group mb-2 cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div class="mb-1 flex items-center justify-between">
            <h4 class="font-medium text-foreground">{{ character.name }}</h4>
            <span class="text-xs text-muted-foreground">{{ character.identity }}</span>
          </div>
          <p class="mb-2 text-xs text-muted-foreground">{{ character.personality }}</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in character.tags"
              :key="tag"
              class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
