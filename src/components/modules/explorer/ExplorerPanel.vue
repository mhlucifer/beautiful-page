<script setup lang="ts">
import { ref } from 'vue'
import { FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-vue-next'

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
    <div v-if="!hasContent" class="p-4 text-center text-muted-foreground">
      <FolderOpen class="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>暂无内容</p>
    </div>
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
