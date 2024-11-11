import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { eq } from "drizzle-orm"
import { paginateQuery } from "../../db/pagination-help"
import { albums } from "../../db/schema"
import { dbClientInWorker } from "../../db/client.serverless"
import { AlbumSchema, ParamsSchema, QuerySchema } from "./schema"
import { z } from "@hono/zod-openapi"

const albumRouter = new OpenAPIHono<HonoEnvType>()

// 获取专辑列表路由
const listAlbumsRoute = createRoute({
  method: "get",
  path: "",
  request: {
    query: QuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number().describe("Response status code"),
            list: z.array(AlbumSchema).describe("List of albums"),
            total: z.number().describe("Total number of albums"),
          }),
        },
      },
      description: "Successfully retrieved albums",
    },
  },
  tags: ["Albums"],
  summary: "Get all albums with pagination",
})

// 获取单个专辑路由
const getAlbumRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            data: z.array(AlbumSchema),
          }),
        },
      },
      description: "Successfully retrieved album",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("error"),
            message: z.literal("Album not found"),
          }),
        },
      },
      description: "Album not found",
    },
  },
  tags: ["Albums"],
  summary: "Get a single album by ID",
})

// 创建专辑路由
const createAlbumRoute = createRoute({
  method: "post",
  path: "",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AlbumSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("ok"),
            data: AlbumSchema,
          }),
        },
      },
      description: "Album created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("error"),
            message: z.string(),
          }),
        },
      },
      description: "Invalid input data",
    },
  },
  tags: ["Albums"],
  summary: "Create a new album",
})

// 实现获取列表路由
albumRouter.openapi(listAlbumsRoute, async (c) => {
  const page = Number(c.req.query("page") || "0")
  const pageSize = Number(c.req.query("pageSize") || "10")
  const searchParams: Record<string, string> = {}
  const queryParams = c.req.query()

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
    list: data,
    total,
  })
})

// 实现获取单个专辑路由
albumRouter.openapi(getAlbumRoute, async (c) => {
  const { id } = c.req.valid("param")
  const album = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(albums)
    .where(eq(albums.id, id))

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

// 实现创建专辑路由
albumRouter.openapi(createAlbumRoute, async (c) => {
  const data = c.req.valid("json")
  const [album] = await dbClientInWorker(c.env.DATABASE_URL)
    .insert(albums)
    .values({
      ...data,
      digitalDownloads: data.digitalDownloads?.toString(),
    })
    .returning()

  return c.json({
    status: "ok",
    data: album,
  })
})

// 添加 OpenAPI 文档
albumRouter.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Album API",
    version: "1.0.0",
    description: "API for managing music albums",
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Albums",
      description: "Album management endpoints",
    },
  ],
})

export { albumRouter }
