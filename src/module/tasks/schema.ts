import { z } from "@hono/zod-openapi"

// Task Status and Priority Enums
export const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"])
export const TaskPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
export const TaskLabel = z.enum([
  "BUG",
  "FEATURE",
  "IMPROVEMENT",
  "DOCUMENTATION",
])

// Task Schema
export const TaskSchema = z
  .object({
    title: z.string().openapi({
      description: "Task title",
      example: "Implement OpenAPI",
    }),
    status: TaskStatus.openapi({
      description: "Task status",
      example: "TODO",
    }),
    label: TaskLabel.openapi({
      description: "Task label",
      example: "FEATURE",
    }),
    priority: TaskPriority.openapi({
      description: "Task priority",
      example: "MEDIUM",
    }),
  })
  .openapi("Task")

// Query Parameters Schema
export const QuerySchema = z.object({
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
  status: TaskStatus.optional().openapi({
    param: {
      name: "status",
      in: "query",
    },
    description: "Filter by status",
  }),
  priority: TaskPriority.optional().openapi({
    param: {
      name: "priority",
      in: "query",
    },
    description: "Filter by priority",
  }),
})

// Route Parameters Schema
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
