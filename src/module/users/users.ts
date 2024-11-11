import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi"
import { dbClientInWorker } from "../../db/client.serverless"
import { users } from "../../db/schema"
import { count, eq } from "drizzle-orm"
import {
  UpdateUserSchema,
  ParamsSchema,
  SearchQuerySchema,
  UserResponseSchema,
} from "./schema"

const userRouter = new OpenAPIHono<HonoEnvType>()

// 添加获取用户列表的路由配置
const getUsersRoute = createRoute({
  method: "get",
  path: "",
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      pageSize: z.string().optional().default("10"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            users: z.array(UserResponseSchema),
            total: z.array(
              z.object({
                value: z.number(),
              })
            ),
            page: z.number(),
            pageSize: z.number(),
            totalPages: z.number(),
          }),
        },
      },
      description: "Successfully retrieved users list",
    },
  },
})

// 修改获取用户信息的路由配置
const getUserInfoRoute = createRoute({
  method: "get",
  path: "/info",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserResponseSchema,
        },
      },
      description: "Successfully retrieved user info",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "User not found",
    },
  },
})

// 修改获取指定用户的路由配置
const getUserByIdRoute = createRoute({
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
            user: z.array(UserResponseSchema),
          }),
        },
      },
      description: "Successfully retrieved user",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "User not found",
    },
  },
})

// 修改现有的路由处理器，使用 OpenAPI 配置
userRouter.openapi(getUsersRoute, async (c) => {
  const { page, pageSize } = c.req.valid("query")

  const [allUsers, total] = await Promise.all([
    dbClientInWorker(c.env.DATABASE_URL)
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users),
    dbClientInWorker(c.env.DATABASE_URL).select({ value: count() }).from(users),
  ])

  return c.json({
    code: 200,
    users: allUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })),
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages: Math.ceil(Number(total[0].value) / Number(pageSize)),
  })
})

// 修改 getUserInfo 处理器的响应
userRouter.openapi(getUserInfoRoute, async (c) => {
  const payload = c.get("jwtPayload")
  console.log("payload: ", payload)

  const [user] = await dbClientInWorker(c.env.DATABASE_URL)
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      avatar: users.avatar,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, payload.sub))

  if (!user) {
    return c.json(
      {
        code: 404,
        msg: "User not found",
      },
      404
    )
  }

  return c.json(
    {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    200
  )
})

// 修改 getUserById 处理器的响应
userRouter.openapi(getUserByIdRoute, async (c) => {
  const { id } = c.req.valid("param")

  const user = await dbClientInWorker(c.env.DATABASE_URL)
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatar: users.avatar,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))

  if (!user.length) {
    return c.json(
      {
        code: 404,
        msg: "User not found",
      },
      404
    )
  }

  return c.json(
    {
      user: user.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
    },
    200
  )
})

const updateUserRoute = createRoute({
  method: "put",
  path: "/{id}",
  request: {
    params: ParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "User updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "Invalid request",
    },
  },
})

userRouter.openapi(updateUserRoute, async (c) => {
  const { id } = c.req.valid("param")
  const updateData = c.req.valid("json")

  await dbClientInWorker(c.env.DATABASE_URL)
    .update(users)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))

  return c.json({
    code: 200,
    msg: "Update user success",
  })
})

// 添加删除用户的路由配置
const deleteUserRoute = createRoute({
  method: "delete",
  path: "/{id}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "User deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            msg: z.string(),
          }),
        },
      },
      description: "User not found",
    },
  },
})

// 实现删除用户路由
userRouter.openapi(deleteUserRoute, async (c) => {
  const { id } = c.req.valid("param")

  const [existingUser] = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(users)
    .where(eq(users.id, id))

  if (!existingUser) {
    return c.json(
      {
        code: 404,
        msg: "User not found",
      },
      404
    )
  }

  await dbClientInWorker(c.env.DATABASE_URL)
    .delete(users)
    .where(eq(users.id, id))

  return c.json({
    code: 200,
    msg: "Delete user success",
  })
})

export { userRouter }
