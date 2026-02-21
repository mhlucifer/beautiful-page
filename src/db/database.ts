import Dexie, { type Table } from 'dexie'
import type {
  Project,
  Character,
  WorldRule,
  Faction,
  OutlineNode,
  SceneDetail,
  ChapterSnapshot,
  Chronicle,
  DraftEntry,
  ContextItem,
} from '@/types'

export class NankeDatabase extends Dexie {
  // Tables
  projects!: Table<Project>
  characters!: Table<Character>
  worldRules!: Table<WorldRule>
  factions!: Table<Faction>
  outlineNodes!: Table<OutlineNode>
  sceneDetails!: Table<SceneDetail>
  snapshots!: Table<ChapterSnapshot>
  chronicles!: Table<Chronicle>
  draftEntries!: Table<DraftEntry>
  contextItems!: Table<ContextItem>

  constructor() {
    super('nanke-universe-v1')

    this.version(1).stores({
      projects: 'id, name, updatedAt',
      characters: 'id, projectId, name, updatedAt',
      worldRules: 'id, projectId, category, name',
      factions: 'id, projectId, name',
      outlineNodes: 'id, projectId, parentId, type, order',
      sceneDetails: 'id, nodeId, projectId',
      snapshots: 'id, chapterId, projectId, createdAt',
      chronicles: 'id, projectId, volumeNumber',
      draftEntries: 'id, chapterId, createdAt',
      contextItems: 'id, type, sourceId',
    })
  }
}

// Singleton instance
export const db = new NankeDatabase()

// Initialize database
export async function initDatabase(): Promise<void> {
  try {
    // Test database connection
    await db.open()
    console.log('[Database] Connected successfully, version:', db.verno)
  } catch (error) {
    console.error('[Database] Failed to initialize:', error)
    throw error
  }
}

// Utility functions
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.projects.clear(),
    db.characters.clear(),
    db.worldRules.clear(),
    db.factions.clear(),
    db.outlineNodes.clear(),
    db.sceneDetails.clear(),
    db.snapshots.clear(),
    db.chronicles.clear(),
    db.draftEntries.clear(),
    db.contextItems.clear(),
  ])
}

export async function exportAllData(projectId?: string): Promise<Blob> {
  const data: Record<string, unknown[]> = {
    projects: await db.projects.toArray(),
    characters: projectId 
      ? await db.characters.where('projectId').equals(projectId).toArray()
      : await db.characters.toArray(),
    worldRules: projectId
      ? await db.worldRules.where('projectId').equals(projectId).toArray()
      : await db.worldRules.toArray(),
    factions: projectId
      ? await db.factions.where('projectId').equals(projectId).toArray()
      : await db.factions.toArray(),
    outlineNodes: projectId
      ? await db.outlineNodes.where('projectId').equals(projectId).toArray()
      : await db.outlineNodes.toArray(),
    sceneDetails: projectId
      ? await db.sceneDetails.where('projectId').equals(projectId).toArray()
      : await db.sceneDetails.toArray(),
    snapshots: await db.snapshots.toArray(),
    chronicles: await db.chronicles.toArray(),
    draftEntries: await db.draftEntries.toArray(),
  }

  const json = JSON.stringify(data, null, 2)
  return new Blob([json], { type: 'application/json' })
}
