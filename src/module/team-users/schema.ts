import { z } from "@hono/zod-openapi"

// 更新团队用户的请求体 Schema
export const UpdateTeamUserSchema = z
  .object({
    name: z.string().optional().openapi({
      description: "Team user's name",
      example: "John Doe",
    }),
    email: z.string().email().optional().openapi({
      description: "Team user's email",
      example: "john@example.com",
    }),
    avatar: z.string().optional().openapi({
      description: "Team user's avatar URL",
      example: "https://example.com/avatar.jpg",
    }),
    status: z.string().optional().openapi({
      description: "Team user's status",
      example: "active",
    }),
    role: z.string().optional().openapi({
      description: "Team user's role",
      example: "developer",
    }),
    bio: z.string().optional().openapi({
      description: "Team user's biography",
      example: "Senior Developer",
    }),
    amount: z.string().optional().openapi({
      description: "Team user's amount",
      example: "1000",
    }),
  })
  .openapi("UpdateTeamUser")

// 路由参数 Schema
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

// 查询参数 Schema
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
  status: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "status",
        in: "query",
      },
      description: "Filter by status",
      example: "active",
    }),
})
