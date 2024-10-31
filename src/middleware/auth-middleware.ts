import { jwt } from "hono/jwt"
import { Context, Next } from "hono"

const authWhiteList = ["/api/auth/login", "/api/auth/register", "/api/seed"]

export const authMiddleware = (c: Context, next: Next) => {
  if (authWhiteList.includes(c.req.path)) {
    return next()
  }
  const jwtMiddleware = jwt({
    secret: c.env.SECRET_KEY,
    cookie: c.env.COOKIE_KEY,
  })
  return jwtMiddleware(c, next)
}

export const buildPayload = () => {
  const payload = {
    sub: "",
    role: "",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  }
  return payload
}
