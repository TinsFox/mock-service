import { Hono } from "hono"

import { PrismaD1 } from "@prisma/adapter-d1"

import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

import { createPassword } from "../lib/crypto"

const seedRouter = new Hono<HonoEnvType>()

const userList = [
  {
    email: "admin@guangguang.com",
    username: "guangguang",
    name: "guangguang",
    avatar: faker.image.avatarGitHub(),
    birthdate: faker.date.birthdate(),
    bio: faker.lorem.paragraph(),
    password: "guangguang",
  },
  {
    email: "admin@shadcn.com",
    username: "shadcn",
    name: "shadcn",
    avatar: faker.image.avatarGitHub(),
    birthdate: faker.date.birthdate(),
    bio: faker.lorem.paragraph(),
    password: "admin",
  },
]
const FakerAlbumList = Array.from({ length: 100 }, () => ({
  title: faker.music.songName(),
  cover: faker.image.url(),
  url: faker.internet.url(),
  slogan: faker.lorem.sentence(),
  updatedAt: faker.date.recent(),
  digitalDownloads: faker.number.float({
    min: 10,
    max: 100,
    multipleOf: 0.02,
  }),
}))

async function seedUser(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: userList.map((user) => ({
      ...user,
      password: createPassword(user.password),
    })),
  })
}
const FakerTeamUserList = Array.from({ length: 100 }, () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatarGitHub(),

  bio: faker.lorem.paragraph(),
  amount: faker.number.float({
    min: 10,
    max: 100,
    multipleOf: 0.02,
  }),
  status: faker.helpers.arrayElement([
    "pending",
    "processing",
    "success",
    "failed",
  ]),
  role: faker.helpers.arrayElement(["admin", "user"]),
}))

async function seedTeamUser(prisma: PrismaClient) {
  await prisma.teamUser.createMany({
    data: FakerTeamUserList,
  })
}

async function seedAlbum(prisma: PrismaClient) {
  await prisma.album.createMany({
    data: FakerAlbumList,
  })
}
seedRouter.get("/", async (c) => {
  console.log("🌱 Seeding...")
  console.time(`🌱 Database has been seeded`)
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })
  console.time("🧹 Cleaned up the database...")
  const albums = await prisma.album.findMany()
  console.log(albums)
  await cleanupDb(prisma)

  console.timeEnd("🧹 Cleaned up the database...")

  console.time("🌱 Seeding users...")
  await seedUser(prisma)
  console.timeEnd("🌱 Users has been seeded")

  console.time("🌱 Seeding team users...")
  await seedTeamUser(prisma)
  console.timeEnd("🌱 Seeding team users...")

  console.time("🌱 Seeding albums...")
  await seedAlbum(prisma)
  console.timeEnd("🌱 Seeding albums...")

  console.timeEnd(`🌱 Database has been seeded`)

  return c.json({
    code: 200,
    msg: "success",
  })
})

async function cleanupDb(prisma: PrismaClient) {
  const tables = await prisma.$queryRaw<
    { name: string }[]
  >`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`

  await prisma.$transaction([
    // Disable FK constraints to avoid relation conflicts during deletion
    prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`),
    // Delete all rows from each table, preserving table structures
    ...tables.map(({ name }) =>
      prisma.$executeRawUnsafe(`DELETE from "${name}"`)
    ),
    prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON`),
  ])
}
export { seedRouter }
