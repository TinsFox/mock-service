import { PrismaClient } from "@prisma/client"

interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
export async function paginatePrismaQuery<T>(
  prisma: PrismaClient,
  model: {
    findMany: (args: any) => Promise<T[]>
    count: (args: any) => Promise<number>
  },
  page: number,
  pageSize: number,
  where: object = {}
): Promise<PaginationResult<T>> {
  const skip = page * pageSize

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
}
