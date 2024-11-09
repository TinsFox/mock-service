import { Hono } from "hono"

import { eq } from "drizzle-orm"

import { paginateQuery } from "../lib/pagination-help"
import { albums } from "../db/schema"
import { dbClient, dbClientInWorker } from "../db/client.serverless"

const albumRouter = new Hono<HonoEnvType>()

albumRouter.get("/", async (c) => {
  const page = Number(c.req.query("page") || "0")
  const pageSize = Number(c.req.query("pageSize") || "10")
  const searchParams: Record<string, string> = {}
  const queryParams = c.req.query()

  // 过滤掉 page 和 pageSize 参数
  Object.entries(queryParams).forEach(([key, value]) => {
    if (key !== "page" && key !== "pageSize" && value) {
      searchParams[key] = value
    }
  })
  const { data, total } = await paginateQuery({
    table: albums,
    page,
    pageSize,
    searchParams,
    dbClient: dbClientInWorker(c.env.DATABASE_URL),
  })
  return c.json({
    code: 200,
    data,
    total,
  })
})

albumRouter.get("/:id", async (c) => {
  const { id } = c.req.param()
  const album = await dbClient.select().from(albums).where(eq(albums.id, id))
  if (!album) {
    return c.json(
      {
        status: "error",
        message: "Album not found",
      },
      { status: 404 }
    )
  }
  return c.json({
    status: "ok",
    data: album,
  })
})

albumRouter.post("/", async (c) => {
  const json = await c.req.json()
  const [album] = await dbClient.insert(albums).values(json).returning()
  return c.json({
    status: "ok",
    data: album,
  })
})
export { albumRouter }
