import { sql } from 'drizzle-orm'
import { db } from './index.js'

const columnCache = new Map<string, boolean>()

function makeKey(tableName: string, columnName: string): string {
  return `${tableName}.${columnName}`
}

export async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const key = makeKey(tableName, columnName)
  const cached = columnCache.get(key)
  if (cached != null) {
    return cached
  }

  const result = await db.execute<{ exists: boolean }>(sql`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = ${tableName}
        and column_name = ${columnName}
    ) as "exists"
  `)

  const exists = Boolean(result.rows[0]?.exists)
  columnCache.set(key, exists)
  return exists
}

export async function hasColumns(tableName: string, columnNames: string[]): Promise<boolean> {
  const availability = await Promise.all(columnNames.map((columnName) => hasColumn(tableName, columnName)))
  return availability.every(Boolean)
}

export function clearOptionalColumnCache(): void {
  columnCache.clear()
}
