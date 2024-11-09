import { Hono } from "hono"

import { paginateQuery } from "../lib/pagination-help"
import { teamUsers } from "../db/schema"
import { dbClientInWorker } from "../db/client.serverless"

const teamUserRouter = new Hono<HonoEnvType>()

teamUserRouter.get("/", async (c) => {
  const page = Number(c.req.query("page") || "0")
  const pageSize = Number(c.req.query("pageSize") || "10")

  // 获取所有查询参数
  const searchParams: Record<string, string> = {}
  const queryParams = c.req.query()

  // 过滤掉 page 和 pageSize 参数
  Object.entries(queryParams).forEach(([key, value]) => {
    if (key !== "page" && key !== "pageSize" && value) {
      searchParams[key] = value
    }
  })

  const result = await paginateQuery({
    table: teamUsers,
    page,
    pageSize,
    searchParams,
    dbClient: dbClientInWorker(c.env.DATABASE_URL),
  })

  return c.json({
    code: 200,
    list: result.data,
    total: result.total,
  })
})

export { teamUserRouter }
