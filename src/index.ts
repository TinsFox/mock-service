import { Hono } from "hono"
import { csrf } from "hono/csrf"
import { cors } from "hono/cors"
import { userRouter } from "./module/user"
import { albumRouter } from "./module/album"
import { authRouter } from "./module/auth"
import { seedRouter } from "./module/seed"
import { teamUserRouter } from "./module/team-user"
import { logger } from "hono/logger"
import { requestId } from "hono/request-id"

import { showRoutes } from "hono/dev"
import { authMiddleware } from "./middleware/auth-middleware"

const app = new Hono<HonoEnvType>()

app.use("*", logger())
app.use("*", csrf())
app.use("*", cors())
app.use("*", requestId())
app.use("*", authMiddleware)

const baseUrl = "/api"

app.get("/", (c) => {
  return c.text(`Your request id is ${c.get("requestId")}`)
})

app.route(`${baseUrl}/auth`, authRouter)

app.route(`${baseUrl}/album`, albumRouter)

app.route(`${baseUrl}/user`, userRouter)

app.route(`${baseUrl}/team-users`, teamUserRouter)

app.route(`${baseUrl}/seed`, seedRouter)

// showRoutes(app, {
//   verbose: true,
// })

export default {
  ...app,
  fetch: app.fetch,
}
