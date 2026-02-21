// Core types for Nanke Universe

// ==================== Base Types ====================

export type EntityId = string

export interface Timestamps {
  createdAt: number
  updatedAt: number
}

export interface BaseEntity extends Timestamps {
  id: EntityId
}

// ==================== Project Types ====================

export interface Project extends BaseEntity {
  name: string
  description: string
  settings: ProjectSettings
  lastOpenedAt: number
}

export interface ProjectSettings {
  theme: 'light' | 'dark' | 'system'
  autosaveInterval: number // seconds
  defaultOutlineTemplate: string
}

// ==================== Character Types (模块2: 角色状态机) ====================

export interface Character extends BaseEntity {
  projectId: EntityId
  name: string
  identity: string        // 身份
  personality: string     // 性格基调
  
  // 动态属性（随剧情热更新）
  currentKnowledge: string[]   // 当前认知（防上帝视角）
  assets: string[]            // 核心资源（法宝、资金、人脉、线索）
  emotionalState: EmotionalState  // 情感状态
  
  // 版本历史
  history: CharacterVersion[]
}

export interface EmotionalState {
  currentMood: string       // 当前心理状态
  relationships: Relationship[]  // 对其他角色的关系
  mentalDefense: number     // 心理防线 (0-100)
}

export interface Relationship {
  targetId: EntityId
  targetName: string
  type: 'ally' | 'enemy' | 'neutral' | 'family' | 'romance'
  value: number // -100 to 100, 负数为敌意，正数为好感
  notes: string
}

export interface CharacterVersion {
  id: string
  timestamp: number
  snapshot: Partial<Character>
  reason: string  // 更新原因/触发事件
}

export interface CharacterFormData {
  name: string
  identity: string
  personality: string
  currentKnowledge?: string[]
  assets?: string[]
  emotionalState?: Partial<EmotionalState>
}

// ==================== Tech Rule Types (模块1: 世界观法则) ====================

export interface WorldRule extends BaseEntity {
  projectId: EntityId
  name: string
  category: string       // 规则分类标签
  description: string
  constraints: string[]  // 限制条件
  examples: string[]     // 应用示例
  tags: string[]
}

export interface Faction extends BaseEntity {
  projectId: EntityId
  name: string
  ideology: string     // 核心理念
  relationships: FactionRelationship[]
  members: EntityId[]   // 成员ID列表
  resources: string[]
}

export interface FactionRelationship {
  factionId: EntityId
  factionName: string
  type: 'ally' | 'enemy' | 'neutral' | 'vassal' | 'overlord'
  description: string
}

// ==================== Outline Types (模块3: 大纲树) ====================

export type OutlineNodeType = 'book' | 'volume' | 'chapter' | 'scene'

export interface OutlineNode extends BaseEntity {
  projectId: EntityId
  parentId: EntityId | null
  type: OutlineNodeType
  title: string
  order: number
  expanded: boolean
  status: 'draft' | 'writing' | 'review' | 'finished'
  wordCountGoal: number
  metadata: NodeMetadata
}

export interface NodeMetadata {
  summary?: string
  tags?: string[]
  color?: string
  deadline?: number
}

export interface SceneDetail {
  nodeId: EntityId
  projectId: EntityId
  
  // 细纲内容
  objective: string          // 本章目标
  povCharacter: EntityId   // POV 角色
  characters: EntityId[]    // 出场人物（多选）
  location: string
  
  // 剧情设计
  conflictType: 'physical' | 'emotional' | 'intellectual' | 'situational'
  tensionLevel: number     // 紧张度 1-10
  plotFlow: PlotPoint[]    // 剧情流转
  
  // 线索与伏笔
  clues: Clue[]
  foreshadowing: string[]
  
  // 情绪曲线
  emotionalArc: EmotionalBeat[]
}

export interface PlotPoint {
  id: string
  type: 'setup' | 'inciting' | 'rising' | 'climax' | 'falling' | 'resolution'
  description: string
  outcome: string
}

export interface Clue {
  id: string
  content: string
  revealed: boolean
  paysOffIn: EntityId | null  // 在哪一章回收
}

export interface EmotionalBeat {
  progress: number  // 0-100% 场景进度
  emotion: string
  intensity: number  // 1-10
}

// ==================== Workspace Types (模块4: AI 组装台) ====================

export interface ContextAssembler {
  selectedItems: ContextItem[]
  assembledPrompt: string
  tokenEstimate: number
}

export type ContextItemType = 'outline' | 'character' | 'rule' | 'previous' | 'chronicle'

export interface ContextItem {
  id: string
  type: ContextItemType
  sourceId: EntityId
  title: string
  content: string
  weight: number  // 重要性权重 0-1
  checked: boolean
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string  // 带变量的模板字符串
  variables: PromptVariable[]
}

export interface PromptVariable {
  name: string
  type: 'text' | 'select' | 'multiline'
  required: boolean
  defaultValue?: string
  options?: string[]
}

export interface DraftEntry {
  id: string
  chapterId: EntityId
  prompt: string
  rawOutput: string
  editedContent: string
  status: 'raw' | 'editing' | 'final'
  wordCount: number
  createdAt: number
  modelInfo?: {
    provider: string
    model: string
    tokens: number
  }
}

// ==================== Snapshot Types (版本控制) ====================

export interface ChapterSnapshot {
  id: string
  chapterId: EntityId
  projectId: EntityId
  summary: string  // 100字核心剧情摘要
  contentHash: string
  wordCount: number
  diff: SnapshotDiff
  createdAt: number
  parentSnapshotId: string | null
}

export interface SnapshotDiff {
  added: number
  removed: number
  modified: number
  patches: TextPatch[]
}

export interface TextPatch {
  type: 'add' | 'remove' | 'replace'
  position: number
  oldText?: string
  newText?: string
}

export interface Chronicle {
  id: string
  projectId: EntityId
  volumeNumber: number
  title: string
  summaries: ChapterSummary[]
  compiledContext: string
  updatedAt: number
}

export interface ChapterSummary {
  chapterId: EntityId
  chapterNumber: number
  title: string
  summary: string
  wordCount: number
  keyEvents: string[]
  cliffhanger?: string
}

// ==================== UI Types ====================

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface ConfirmDialog {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export interface LoadingState {
  global: boolean
  operations: Record<string, boolean>
}

// ==================== Export Types ====================

export interface ExportOptions {
  format: 'markdown' | 'json' | 'epub' | 'html'
  includeSnapshots: boolean
  includeHistory: boolean
  compression: boolean
}

export interface BackupData {
  version: string
  exportedAt: number
  project: Project
  characters: Character[]
  worldRules: WorldRule[]
  factions: Faction[]
  outlineNodes: OutlineNode[]
  scenes: SceneDetail[]
  snapshots: ChapterSnapshot[]
  chronicles: Chronicle[]
}
