import { Hono } from "hono"
import { setCookie, deleteCookie } from "hono/cookie"
import { comparePassword, createPassword } from "../lib/crypto"
import { sign } from "hono/jwt"
import { getPrisma } from "../lib/client"

const authRouter = new Hono<HonoEnvType>()

authRouter.post("/register", async (c) => {
  const { email, password } = await c.req.json()

  const prisma = getPrisma(c.env.DB)

  await prisma.user.create({
    data: { email, password: createPassword(password) },
  })

  return c.json({
    status: "ok",
    message: "Register successful",
  })
})

authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json()
  const prisma = getPrisma(c.env.DB)
  const user = await prisma.user.findUnique({
    where: { email },
  })
  if (!user) {
    return c.json(
      {
        status: "error",
        message: "invalid_email_or_password",
        code: 400,
      },
      { status: 400 }
    )
  }
  if (user && comparePassword(password, user.password)) {
    const payload = {
      sub: user.id,
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }
    const secret = c.env.SECRET_KEY
    const cookieKey = c.env.COOKIE_KEY
    const token = await sign(payload, secret)
    setCookie(c, cookieKey, token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    })
    return c.json({
      status: "ok",
      message: "Login successful",
      token,
    })
  }
})

authRouter.post("/logout", (c) => {
  const cookieKey = c.env.COOKIE_KEY
  deleteCookie(c, cookieKey)
  return c.json({
    status: "ok",
    headers: {
      "Set-Cookie": `${cookieKey}=;Max-Age=0; Path=/; HttpOnly; SameSite=Strict; Secure`,
    },
    message: "Logout successful",
  })
})

export { authRouter }
