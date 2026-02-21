<script setup lang="ts">
import { ref } from 'vue'
import { GitBranch, Clock, Save, RotateCcw } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'

const hasSnapshots = ref(false)

const snapshots = ref([
  {
    id: '1',
    chapterName: '第一章 启程',
    summary: '主角林墨白在山中发现神秘玉佩，踏上修真之路',
    wordCount: 3200,
    timestamp: Date.now() - 3600000,
  },
  {
    id: '2',
    chapterName: '第一章 启程',
    summary: '增加主角回忆片段，完善人物背景',
    wordCount: 3800,
    timestamp: Date.now() - 7200000,
  }
])

function createSnapshot() {
  console.log('Create new snapshot')
}

function restoreSnapshot(id: string) {
  console.log('Restore snapshot:', id)
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border p-3">
      <div class="flex items-center gap-2">
        <GitBranch class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">版本控制</span>
      </div>
      <button
        @click="createSnapshot"
        class="flex h-7 items-center gap-1 rounded-md bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90"
      >
        <Save class="h-3.5 w-3.5" />
        保存快照
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <EmptyState
        v-if="!hasSnapshots && snapshots.length === 0"
        icon="git-branch"
        title="暂无版本快照"
        description="保存章节快照来追踪创作进度"
        :actions="[
          { label: '创建快照', variant: 'default', onClick: createSnapshot },
        ]"
      />
      <div v-else class="p-2">
        <div class="mb-2 px-2 text-xs text-muted-foreground">
          共 {{ snapshots.length }} 个版本
        </div>
        <div
          v-for="snapshot in snapshots"
          :key="snapshot.id"
          class="group mb-2 cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div class="mb-2 flex items-center justify-between">
            <h4 class="text-sm font-medium text-foreground">{{ snapshot.chapterName }}</h4>
            <span class="text-xs text-muted-foreground">{{ formatTime(snapshot.timestamp) }}</span>
          </div>
          <p class="mb-2 text-xs text-muted-foreground line-clamp-2">{{ snapshot.summary }}</p>
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground">{{ snapshot.wordCount }} 字</span>
            <button
              @click.stop="restoreSnapshot(snapshot.id)"
              class="flex h-6 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
            >
              <RotateCcw class="h-3 w-3" />
              恢复
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
