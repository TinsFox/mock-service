import { Hono } from "hono"
import { csrf } from "hono/csrf"
import { cors } from "hono/cors"
import { userRouter } from "./module/user"
import { albumRouter } from "./module/album"
import { authRouter } from "./module/auth"

import { teamUserRouter } from "./module/team-user"
import { logger } from "hono/logger"
import { requestId } from "hono/request-id"

import { authMiddleware } from "./middleware/auth-middleware"
import { taskRouter } from "./module/task"

const app = new Hono<HonoEnvType>()

app.get("/", (c) => {
  return c.text(`Your request id is ${c.get("requestId")}`)
})

app.use("*", logger())
app.use("*", csrf())
app.use("*", cors())
app.use("*", requestId())
app.use("*", authMiddleware)

const baseUrl = "/api"

app.route(`${baseUrl}/auth`, authRouter)

app.route(`${baseUrl}/albums`, albumRouter)

app.route(`${baseUrl}/user`, userRouter)

app.route(`${baseUrl}/team-users`, teamUserRouter)

app.route(`${baseUrl}/tasks`, taskRouter)

export default {
  ...app,
  fetch: app.fetch,
}
