import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db/database'
import type { OutlineNode, SceneDetail, NodeMetadata } from '@/types'

export type OutlineNodeType = 'book' | 'volume' | 'chapter' | 'scene'

export interface TreeNode extends OutlineNode {
  children?: TreeNode[]
  level: number
}

export const useOutlineStore = defineStore('outline', () => {
  // State
  const nodes = ref<OutlineNode[]>([])
  const sceneDetails = ref<Map<string, SceneDetail>>(new Map())
  const currentNode = ref<OutlineNode | null>(null)
  const currentSceneDetail = ref<SceneDetail | null>(null)
  const expandedNodes = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const treeData = computed((): TreeNode[] => {
    const buildTree = (parentId: string | null, level: number): TreeNode[] => {
      return nodes.value
        .filter(n => n.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(node => ({
          ...node,
          level,
          children: buildTree(node.id, level + 1),
        }))
    }
    return buildTree(null, 0)
  })

  const books = computed(() => nodes.value.filter(n => n.type === 'book'))
  const volumes = computed(() => nodes.value.filter(n => n.type === 'volume'))
  const chapters = computed(() => nodes.value.filter(n => n.type === 'chapter'))
  const scenes = computed(() => nodes.value.filter(n => n.type === 'scene'))

  const wordCountTotal = computed(() => {
    return nodes.value.reduce((sum, node) => sum + (node.metadata?.wordCount || 0), 0)
  })

  // Actions
  async function loadNodes(projectId?: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (projectId) {
        nodes.value = await db.outlineNodes
          .where('projectId')
          .equals(projectId)
          .toArray()
      } else {
        nodes.value = await db.outlineNodes.toArray()
      }
    } catch (err) {
      console.error('Failed to load outline nodes:', err)
      error.value = '加载大纲失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createNode(data: {
    name: string
    type: OutlineNodeType
    parentId?: string | null
    projectId: string
    metadata?: NodeMetadata
  }): Promise<OutlineNode> {
    // 计算 order
    const siblings = nodes.value.filter(n => n.parentId === data.parentId)
    const maxOrder = siblings.reduce((max, n) => Math.max(max, n.order), -1)

    const now = Date.now()
    const newNode: OutlineNode = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      parentId: data.parentId || null,
      type: data.type,
      title: data.name,
      order: maxOrder + 1,
      expanded: false,
      status: 'draft',
      wordCountGoal: 0,
      metadata: data.metadata || {},
      createdAt: now,
      updatedAt: now,
    }

    await db.outlineNodes.add(newNode)
    nodes.value.push(newNode)
    
    return newNode
  }

  async function updateNode(id: string, updates: Partial<OutlineNode>) {
    const node = nodes.value.find(n => n.id === id)
    if (!node) throw new Error('Node not found')

    const updated = {
      ...node,
      ...updates,
      updatedAt: Date.now(),
    }

    await db.outlineNodes.update(id, updated)
    
    const index = nodes.value.findIndex(n => n.id === id)
    if (index !== -1) {
      nodes.value[index] = updated
    }
    
    if (currentNode.value?.id === id) {
      currentNode.value = updated
    }
  }

  async function deleteNode(id: string) {
    // 递归删除子节点
    const deleteRecursively = async (nodeId: string) => {
      const children = nodes.value.filter(n => n.parentId === nodeId)
      for (const child of children) {
        await deleteRecursively(child.id)
      }
      await db.outlineNodes.delete(nodeId)
    }

    await deleteRecursively(id)
    
    // 重新加载节点
    nodes.value = nodes.value.filter(n => {
      let current = n
      while (current.parentId) {
        if (current.parentId === id) return false
        current = nodes.value.find(node => node.id === current.parentId)!
        if (!current) break
      }
      return n.id !== id
    })
    
    if (currentNode.value?.id === id) {
      currentNode.value = null
    }
  }

  async function moveNode(id: string, newParentId: string | null, newOrder: number) {
    const node = nodes.value.find(n => n.id === id)
    if (!node) throw new Error('Node not found')

    // 检查是否会导致循环引用
    if (newParentId) {
      let current = nodes.value.find(n => n.id === newParentId)
      while (current) {
        if (current.id === id) {
          throw new Error('Cannot move a node to its own descendant')
        }
        current = nodes.value.find(n => n.id === current!.parentId)
      }
    }

    // 更新同层级其他节点的 order
    const siblings = nodes.value.filter(n => 
      n.parentId === newParentId && n.id !== id
    )
    
    for (const sibling of siblings) {
      if (newParentId === node.parentId) {
        // 同层级移动
        if (node.order < newOrder && sibling.order > node.order && sibling.order <= newOrder) {
          await updateNode(sibling.id, { order: sibling.order - 1 })
        } else if (node.order > newOrder && sibling.order >= newOrder && sibling.order < node.order) {
          await updateNode(sibling.id, { order: sibling.order + 1 })
        }
      } else {
        // 跨层级移动
        if (sibling.order >= newOrder) {
          await updateNode(sibling.id, { order: sibling.order + 1 })
        }
      }
    }

    // 更新当前节点
    await updateNode(id, {
      parentId: newParentId,
      order: newOrder,
    })
  }

  // Scene Detail Actions
  async function loadSceneDetail(nodeId: string) {
    try {
      const detail =