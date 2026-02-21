<script setup lang="ts">
import { ref } from 'vue'
import { FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'

interface TreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: TreeNode[]
  expanded?: boolean
}

const hasContent = ref(false)

const treeData = ref<TreeNode[]>([
  {
    id: '1',
    name: '第一卷',
    type: 'folder',
    expanded: true,
    children: [
      { id: '1-1', name: '第一章 启程', type: 'file' },
      { id: '1-2', name: '第二章 遭遇', type: 'file' },
    ]
  },
  {
    id: '2',
    name: '第二卷',
    type: 'folder',
    children: [
      { id: '2-1', name: '第三章 重逢', type: 'file' },
    ]
  }
])

function toggleNode(node: TreeNode) {
  if (node.type === 'folder') {
    node.expanded = !node.expanded
  }
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <EmptyState
      v-if="!hasContent"
      icon="folder-open"
      title="资源管理器"
      description="创建一个新项目来开始你的创作之旅"
      :actions="[
        { label: '新建项目', variant: 'default' },
        { label: '打开项目', variant: 'outline' },
      ]"
    />
    <div v-else class="p-2">
      <div 
        v-for="node in treeData" 
        :key="node.id"
        class="select-none"
      >
        <div
          class="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm hover:bg-accent"
          @click="toggleNode(node)"
        >
          <component
            :is="node.expanded ? ChevronDown : ChevronRight"
            v-if="node.type === 'folder'"
            class="h-4 w-4 text-muted-foreground"
          />
          <component
            :is="node.type === 'folder' ? FolderOpen : FileText"
            class="h-4 w-4"
            :class="node.type === 'folder' ? 'text-blue-500' : 'text-muted-foreground'"
          />
          <span class="text-foreground">{{ node.name }}</span>
        </div>
        <div 
          v-if="node.children && node.expanded" 
          class="ml-4"
        >
          <div
            v-for="child in node.children"
            :key="child.id"
            class="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm hover:bg-accent"
          >
            <FileText class="h-4 w-4 text-muted-foreground" />
            <span class="text-foreground">{{ child.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
