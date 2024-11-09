import { Hono } from "hono"
import { deleteCookie } from "hono/cookie"
import { dbClient, dbClientInWorker } from "../db/client.serverless"
import { users } from "../db/schema"
import { count, eq } from "drizzle-orm"

const userRouter = new Hono<HonoEnvType>()

userRouter.get("/", async (c) => {
  const page = Number(c.req.query("page") || "1")
  const pageSize = Number(c.req.query("pageSize") || "10")

  const [allUsers, total] = await Promise.all([
    dbClient.select().from(users),
    dbClient.select({ value: count() }).from(users),
  ])

  return c.json({
    code: 200,
    users: allUsers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(Number(total[0].value) / pageSize),
  })
})

userRouter.get("/info", async (c) => {
  const payload = c.get("jwtPayload")

  const [user] = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(users)
    .where(eq(users.id, payload.sub))
  if (!user) {
    deleteCookie(c, c.env.COOKIE_KEY)
    return c.json(
      {
        code: 404,
        msg: "User not found",
      },
      {
        status: 401,
      }
    )
  }
  return c.json({
    ...user,
  })
})

userRouter.get("/:id", async (c) => {
  const { id } = c.req.param()
  if (!id) {
    return c.json({
      code: 400,
      msg: "id is required",
    })
  }
  const user = await dbClientInWorker(c.env.DATABASE_URL)
    .select()
    .from(users)
    .where(eq(users.id, id))
  return c.json({
    user,
  })
})

export { userRouter }
