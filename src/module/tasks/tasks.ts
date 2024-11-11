import { OpenAPIHono, createRoute } from "@hono/zod-openapi"
import { dbClientInWorker } from "../../db/client.serverless"
import { tasks } from "../../db/schema"
import { count, eq } from "drizzle-orm"
import { TaskSchema, QuerySchema, ParamsSchema } from "./schema"
import { z } from "@hono/zod-openapi"
import { paginateQuery } from "../../db/pagination-help"

const taskRouter = new OpenAPIHono<HonoEnvType>()

// 获取任务列表路由
const listTasksRoute = createRoute({
  method: "get",
  path: "",
  tags: ["Tasks"],
  summary: "Get task list",
  description:
    "Retrieve a paginated list of tasks with optional status and priority filters",
  request: {
    query: QuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            tasks: z.array(z.any()),
            total: z.number(),
            page: z.number(),
            pageSize: z.number(),
            totalPages: z.number(),
          }),
        },
      },
      description: "Successfully retrieved tasks",
    },
  },
})

// 创建任务路由
const createTaskRoute = createRoute({
  method: "post",
  path: "",
  tags: ["Tasks"],
  summary: "Create new task",
  description: "Create a new task with the provided information",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TaskSchema,
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
            task: z.any(),
          }),
        },
      },
      description: "Task created successfully",
    },
  },
})

// 更新任务路由
const updateTaskRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Tasks"],
  summary: "Update task",
  description: "Update an existing task by ID",
  request: {
    params: ParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: TaskSchema.partial(),
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
      description: "Task updated successfully",
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
      description: "Task not found",
    },
  },
})

// 删除任务路由
const deleteTaskRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Tasks"],
  summary: "Delete task",
  description: "Delete an existing task by ID",
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
      description: "Task deleted successfully",
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
      description: "Task not found",
    },
  },
})

// 实现获取任务列表
taskRouter.openapi(listTasksRoute, async (c) => {
  const { page: pageStr, pageSize: pageSizeStr } = c.req.valid("query")
  const page = Number(pageStr || "1")
  const pageSize = Number(pageSizeStr || "10")
  const db = dbClientInWorker(c.env.DATABASE_URL)

  const { data: taskList, total } = await paginateQuery({
    table: tasks,
    page,
    pageSize,
    dbClient: db,
  })

  return c.json({
    code: 200,
    list: taskList,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
})

// 实现创建任务
taskRouter.openapi(createTaskRoute, async (c) => {
  const data = c.req.valid("json")

  const [task] = await dbClientInWorker(c.env.DATABASE_URL)
    .insert(tasks)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return c.json({
    code: 200,
    msg: "Create task success",
    task,
  })
})

// 实现更新任务
taskRouter.openapi(updateTaskRoute, async (c) => {
  const { id } = c.req.valid("param")
  const updateData = c.req.valid("json")

  const [existingTask] = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))

  if (!existingTask) {
    return c.json(
      {
        code: 404,
        msg: "Task not found",
      },
      404
    )
  }

  await dbClientInWorker(c.env.DATABASE_URL)
    .update(tasks)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))

  return c.json({
    code: 200,
    msg: "Update task success",
  })
})

// 实现删除任务
taskRouter.openapi(deleteTaskRoute, async (c) => {
  const { id } = c.req.valid("param")

  const [existingTask] = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))

  if (!existingTask) {
    return c.json(
      {
        code: 404,
        msg: "Task not found",
      },
      404
    )
  }

  await dbClientInWorker(c.env.DATABASE_URL)
    .delete(tasks)
    .where(eq(tasks.id, id))

  return c.json({
    code: 200,
    msg: "Delete task success",
  })
})

export { taskRouter }
