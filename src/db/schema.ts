import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
} from "drizzle-orm/pg-core"

// User table
export const users = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  name: text("name"),
  avatar: text("avatar"),
  birthdate: text("birthdate"),
  bio: text("bio"),
  password: text("password").notNull(),
  registeredAt: timestamp("registeredAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Album table
export const albums = pgTable("Album", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  cover: text("cover"),
  url: text("url"),
  slogan: text("slogan"),
  digitalDownloads: numeric("digitalDownloads"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// TeamUser table
export const teamUsers = pgTable("TeamUser", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  avatar: text("avatar"),
  status: text("status").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Role table
export const roles = pgTable("Role", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Permission table
export const permissions = pgTable("Permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Task table
export const tasks = pgTable("Task", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  label: text("label").notNull(),
  priority: text("priority").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Export types for each table
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Album = typeof albums.$inferSelect
export type NewAlbum = typeof albums.$inferInsert

export type TeamUser = typeof teamUsers.$inferSelect
export type NewTeamUser = typeof teamUsers.$inferInsert

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert

export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
