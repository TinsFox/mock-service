import { Hono } from "hono"
import { deleteCookie } from "hono/cookie"
import { getPrisma } from "../lib/client"

const userRouter = new Hono<HonoEnvType>()

userRouter.get("/", async (c) => {
  const page = Number(c.req.query("page") || "1")
  const prisma = getPrisma(c.env.DB)
  const pageSize = Number(c.req.query("pageSize") || "10")

  const [users, total] = await Promise.all([
    prisma.teamUser.findMany(),
    prisma.teamUser.count(),
  ])

  return c.json({
    code: 200,
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
})

userRouter.get("/info", async (c) => {
  const payload = c.get("jwtPayload")
  console.log("payload: ", payload.sub)
  const prisma = getPrisma(c.env.DB)
  const user = await prisma.user.findUnique({
    omit: {
      password: true,
    },
    where: { id: payload.sub },
  })
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
  const prisma = getPrisma(c.env.DB)
  if (!id) {
    return c.json({
      code: 400,
      msg: "id is required",
    })
  }
  // const user = await prisma.user.findUnique({
  //   where: { id: Number(id) },
  //   omit: {
  //     password: true,
  //   },
  // })
  return c.json({
    user: id,
  })
})

userRouter.post("/", async (c) => {
  const { name, email } = await c.req.json()
  const prisma = getPrisma(c.env.DB)
  // const user = await prisma.user.create({
  //   data: {
  //     username: name,
  //     email,
  //     birthdate: new Date(),
  //     registeredAt: new Date(),
  //   },
  // })
  return c.json(
    {
      msg: "User created successfully",
    },
    {
      status: 201,
    }
  )
})

export { userRouter }
