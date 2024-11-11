import { z } from "@hono/zod-openapi"

// 定义查询参数 Schema
export const QuerySchema = z.object({
  page: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "page",
        in: "query",
      },
      description: "Page number",
      example: "1",
    }),
  pageSize: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "pageSize",
        in: "query",
      },
      description: "Items per page",
      example: "10",
    }),
})

// 定义专辑 Schema
export const AlbumSchema = z
  .object({
    title: z.string().openapi({
      description: "Album title",
      example: "Greatest Hits",
    }),
    cover: z.string().optional().openapi({
      description: "Album cover URL",
      example: "https://example.com/cover.jpg",
    }),
    url: z.string().optional().openapi({
      description: "Album URL",
      example: "https://example.com/album",
    }),
    slogan: z.string().optional().openapi({
      description: "Album slogan",
      example: "The best album ever",
    }),
    digitalDownloads: z.number().optional().openapi({
      description: "Number of digital downloads",
      example: 1000,
    }),
  })
  .openapi("Album")

// 定义路由参数 Schema
export const ParamsSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
})
