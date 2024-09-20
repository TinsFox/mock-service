import { Hono } from "hono"
import { PrismaD1 } from "@prisma/adapter-d1"

import { PrismaClient } from "@prisma/client"
import { paginatePrismaQuery } from "../lib/pagination-help"

const teamUserRouter = new Hono<HonoEnvType>()

teamUserRouter.get("/", async (c) => {
  const page = Number(c.req.query("page") || "0")
  const pageSize = Number(c.req.query("pageSize") || "10")
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const result = await paginatePrismaQuery(
    prisma,
    prisma.teamUser,
    page,
    pageSize
  )

  return c.json({
    code: 200,
    ...result,
  })
})

export { teamUserRouter }
