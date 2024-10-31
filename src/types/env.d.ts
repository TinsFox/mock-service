import type { TimingVariables } from "hono/timing"
import type { RequestIdVariables } from "hono/request-id"
import type { JwtVariables } from "hono/jwt"

export type Bindings = {
  DB: D1Database
  SECRET_KEY: string
  COOKIE_KEY: string
}

export interface IPayload {
  sub: string
  role: string
  exp: number
}

export type JwtPayload = IPayload
declare global {
  interface HonoEnvType {
    Bindings: Bindings
    Variables: RequestIdVariables & TimingVariables & JwtVariables
  }
}
