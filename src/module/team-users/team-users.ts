import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi"
import { dbClientInWorker } from "../../db/client.serverless"
import { teamUsers } from "../../db/schema"
import { count, eq } from "drizzle-orm"
import { UpdateTeamUserSchema, ParamsSchema, QuerySchema } from "./schema"

const teamUserRouter = new OpenAPIHono<HonoEnvType>()

// 获取团队用户列表路由
const listTeamUsersRoute = createRoute({
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
            code: z.number().describe("Response code"),
            list: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string().nullable(),
                avatar: z.string().nullable(),
                bio: z.string().nullable(),
                status: z.string(),
                role: z.string(),
                amount: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
              })
            ),
            total: z.number(),
            page: z.number(),
            pageSize: z.number(),
            totalPages: z.number(),
          }),
        },
      },
      description: "Successfully retrieved team users",
    },
  },
  tags: ["Team Users"],
  description: "Get a paginated list of team users",
})

// 更新团队用户路由
const updateTeamUserRoute = createRoute({
  method: "put",
  path: "/{id}",
  request: {
    params: ParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateTeamUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number().describe("Response status code"),
            msg: z.string().describe("Success message"),
          }),
        },
      },
      description: "Team user updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number().describe("Error status code"),
            msg: z.string().describe("Error message"),
          }),
        },
      },
      description: "Team user not found",
    },
  },
  tags: ["Team Users"],
  description: "Update an existing team user's information",
  summary: "Update Team User",
  security: [{ BearerAuth: [] }], // 假设需要Bearer token认证
})

// 获取单个团队用户路由定义
const getTeamUserRoute = createRoute({
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
            code: z.number().describe("Response status code"),
            teamUser: z
              .object({
                id: z.string().describe("Team user ID"),
                name: z.string().describe("User name"),
                email: z.string().nullable().describe("User email"),
                avatar: z.string().nullable().describe("User avatar URL"),
                bio: z.string().nullable().describe("User biography"),
                status: z.string().describe("User status"),
                role: z.string().describe("User role"),
                amount: z.string().describe("User amount"),
                createdAt: z.string().describe("Creation timestamp"),
                updatedAt: z.string().describe("Last update timestamp"),
              })
              .describe("Team user details"),
          }),
        },
      },
      description: "Successfully retrieved team user",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number().describe("Error status code"),
            msg: z.string().describe("Error message"),
          }),
        },
      },
      description: "Team user not found",
    },
  },
  tags: ["Team Users"],
  description: "Get a single team user by ID",
  summary: "Get Team User Details",
})

// 实现获取列表路由
teamUserRouter.openapi(listTeamUsersRoute, async (c) => {
  const { page: pageStr, pageSize: pageSizeStr, status } = c.req.valid("query")

  // Add validation to ensure positive numbers
  const page = Math.max(1, Number(pageStr || "1"))
  const pageSize = Math.max(1, Math.min(100, Number(pageSizeStr || "10")))

  // Create a properly typed query
  const db = dbClientInWorker(c.env.DATABASE_URL)
  const baseQuery = db.select().from(teamUsers)

  const query = status
    ? baseQuery.where(eq(teamUsers.status, status))
    : baseQuery

  const [allTeamUsers, total] = await Promise.all([
    query.limit(pageSize).offset((page - 1) * pageSize),
    db.select({ value: count() }).from(teamUsers),
  ])

  return c.json({
    code: 200,
    list: allTeamUsers,
    total: Number(total[0].value),
    page,
    pageSize,
    totalPages: Math.ceil(Number(total[0].value) / pageSize),
  })
})

// 实现更新路由
teamUserRouter.openapi(updateTeamUserRoute, async (c) => {
  const { id } = c.req.valid("param")
  const updateData = c.req.valid("json")

  // Convert amount to string if it exists
  const processedUpdateData = {
    ...updateData,
    amount:
      updateData.amount !== undefined ? String(updateData.amount) : undefined,
  }

  const [existingTeamUser] = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.id, id))

  if (!existingTeamUser) {
    return c.json(
      {
        code: 404,
        msg: "Team user not found",
      },
      404
    )
  }

  await dbClientInWorker(c.env.DATABASE_URL)
    .update(teamUsers)
    .set({
      ...processedUpdateData,
      updatedAt: new Date(),
    })
    .where(eq(teamUsers.id, id))

  return c.json({
    code: 200,
    msg: "Update team user success",
  })
})

// 将原来的 get 路由改为使用 OpenAPI
teamUserRouter.openapi(getTeamUserRoute, async (c) => {
  const { id } = c.req.valid("param")

  const [teamUser] = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.id, id))

  if (!teamUser) {
    return c.json(
      {
        code: 404,
        msg: "Team user not found",
      },
      404
    )
  }

  // 确保日期字段被转换为 ISO 字符串
  const formattedTeamUser = {
    ...teamUser,
    createdAt: new Date(teamUser.createdAt).toISOString(),
    updatedAt: new Date(teamUser.updatedAt).toISOString(),
  }

  return c.json({
    code: 200,
    teamUser: formattedTeamUser,
  })
})

export { teamUserRouter }
