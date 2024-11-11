import { z } from "@hono/zod-openapi"

export const UpdateUserSchema = z
  .object({
    name: z.string().optional().openapi({
      description: "User's name",
      example: "John Doe",
    }),
    avatar: z.string().optional().openapi({
      description: "User's avatar URL",
      example: "https://example.com/avatar.jpg",
    }),
    birthdate: z.string().optional().openapi({
      description: "User's birthdate",
      example: "1990-01-01",
    }),
    bio: z.string().optional().openapi({
      description: "User's biography",
      example: "A software developer",
    }),
    username: z.string().optional().openapi({
      description: "User's username",
      example: "johndoe",
    }),
  })
  .openapi("UpdateUser")

export const ParamsSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
})

export const SearchQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "q",
        in: "query",
      },
      description: "Search query string",
      example: "john",
    }),
  page: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "page",
        in: "query",
      },
      description: "Page number",
      example: "1",
    }),
  pageSize: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "pageSize",
        in: "query",
      },
      description: "Items per page",
      example: "10",
    }),
})
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})