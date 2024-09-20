import { Hono } from "hono"

import { PrismaD1 } from "@prisma/adapter-d1"

import { PrismaClient } from "@prisma/client"
import { paginatePrismaQuery } from "../lib/pagination-help"

const albumRouter = new Hono<HonoEnvType>()

albumRouter.get("/", async (c) => {
  const page = Number(c.req.query("page") || "0")
  const pageSize = Number(c.req.query("pageSize") || "10")
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })
  const albums = await paginatePrismaQuery(prisma, prisma.album, page, pageSize)
  return c.json({
    code: 200,
    ...albums,
  })
})

albumRouter.get("/:id", async (c) => {
  const { id } = c.req.param()
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })
  const album = await prisma.album.findUnique({
    where: {
      id,
    },
  })
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
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })
  const album = await prisma.album.create({
    data: json,
  })
  return c.json({
    status: "ok",
    data: album,
  })
})
export { albumRouter }
