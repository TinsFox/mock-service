import { Hono } from "hono"
import { eq } from "drizzle-orm"
import { tasks } from "../db/schema"
import { paginateQuery } from "../lib/pagination-help"
import { dbClient, dbClientInWorker } from "../db/client.serverless"

const taskRouter = new Hono<HonoEnvType>()

// 获取任务列表（支持分页）
taskRouter.get("/", async (c) => {
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
    table: tasks,
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

// 获取单个任务详情
taskRouter.get("/:id", async (c) => {
  const { id } = c.req.param()

  const task = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))

  if (!task) {
    return c.json(
      {
        status: "error",
        message: "Task not found",
      },
      { status: 404 }
    )
  }

  return c.json({
    status: "ok",
    data: task,
  })
})

// 创建新任务
taskRouter.post("/", async (c) => {
  const json = await c.req.json()

  const [task] = await dbClient.insert(tasks).values(json).returning()

  return c.json({
    status: "ok",
    data: task,
  })
})

// 更新任务
taskRouter.put("/:id", async (c) => {
  const { id } = c.req.param()
  const json = await c.req.json()

  try {
    const [updatedTask] = await dbClientInWorker(c.env.DATABASE_URL)
      .update(tasks)
      .set(json)
      .where(eq(tasks.id, id))
      .returning()

    if (!updatedTask) {
      throw new Error("Task not found")
    }

    return c.json({
      status: "ok",
      data: updatedTask,
    })
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: "Task not found or update failed",
      },
      { status: 404 }
    )
  }
})

// 删除任务
taskRouter.delete("/:id", async (c) => {
  const { id } = c.req.param()

  try {
    const [deletedTask] = await dbClient
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning()

    if (!deletedTask) {
      throw new Error("Task not found")
    }

    return c.json({
      status: "ok",
      message: "Task deleted successfully",
    })
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: "Task not found or delete failed",
      },
      { status: 404 }
    )
  }
})

export { taskRouter }
