import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core"
import { SQL, count, or, like } from "drizzle-orm"

interface PaginationParams<T extends SQLiteTableWithColumns<any>> {
  table: T
  page: number
  pageSize: number
  searchParams: Record<string, string>
  dbClient: any
}

export async function paginateQuery<T extends SQLiteTableWithColumns<any>>({
  table,
  page,
  pageSize,
  searchParams,
  dbClient,
}: PaginationParams<T>) {
  // 构建基础查询
  let whereConditions: SQL[] = []

  // 处理搜索参数
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && table[key]) {
      whereConditions.push(like(table[key], `%${value}%`))
    }
  })

  // 构建 WHERE 子句
  const whereClause =
    whereConditions.length > 0 ? or(...whereConditions) : undefined

  // 获取总数
  const [totalResult] = await dbClient
    .select({ value: count() })
    .from(table)
    .where(whereClause)

  // 获取分页数据
  const data = await dbClient
    .select()
    .from(table)
    .where(whereClause)
    .limit(pageSize)
    .offset(page * pageSize)

  return {
    data,
    total: totalResult.value,
  }
}
