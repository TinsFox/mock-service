import { PrismaClient, Prisma } from "@prisma/client"

interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 添加搜索条件生成函数
export function generateSearchQuery(searchParams: Record<string, string>) {
  if (!Object.keys(searchParams).length) return {}

  const where: any = {}

  Object.entries(searchParams).forEach(([field, value]) => {
    where[field] = {
      contains: value,
    }
  })

  return where
}

export async function paginatePrismaQuery<T>(
  prisma: PrismaClient,
  model: {
    findMany: (args: any) => Promise<T[]>
    count: (args: any) => Promise<number>
  },
  page: number,
  pageSize: number,
  searchParams: Record<string, string> = {}
): Promise<PaginationResult<T>> {
  const skip = page * pageSize
  const where = generateSearchQuery(searchParams)

  try {
    const [items, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: pageSize,
      }),
      model.count({ where }),
    ])

    return {
      list: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  } catch (error) {
    console.error("Query error:", error)
    return {
      list: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }
}
